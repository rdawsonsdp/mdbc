// Vector Database AI Chat API using OpenAI Assistants
// Uses shared Vector Store with app-specific Assistant

import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Get Assistant ID from environment
function getAssistantId() {
  return process.env.OPENAI_ASSISTANT_ID;
}

// Thread storage (in production, use Redis or Firestore)
const threadStore = new Map();

// Rate limiting
const rateLimitStore = new Map();

function checkRateLimit(userId, maxRequests = 20, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(userId) || [];
  
  // Remove old requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(userId, recentRequests);
  return true;
}

export async function POST(request) {
  try {
    const { query, userData, sessionId } = await request.json();

    // Validate input
    if (!query || !userData) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Check rate limit
    const userId = userData.uid || sessionId || 'anonymous';
    if (!checkRateLimit(userId)) {
      return Response.json({ 
        error: 'Too many requests. Please wait a moment before sending another message.',
        timestamp: new Date().toISOString()
      }, { status: 429 });
    }

    // Get OpenAI client and Assistant ID
    const openai = getOpenAIClient();
    const ASSISTANT_ID = getAssistantId();

    // Validate Assistant ID is configured
    if (!ASSISTANT_ID) {
      console.error('OPENAI_ASSISTANT_ID not configured');
      return Response.json({ 
        error: 'Service configuration error. Please contact support.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Get or create thread for this session
    let threadId = threadStore.get(sessionId);
    
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      threadStore.set(sessionId, threadId);
      console.log('📝 Created new thread:', threadId);
    }

    // Build contextual query with user profile and app-calculated data
    let contextualQuery = `
===== USER'S ACTUAL DATA (USE THIS FIRST) =====

User Profile:
- Name: ${userData.name || 'User'}
- Birth Card: ${userData.birthCard}
- Age: ${userData.age || 'Not specified'}
`;

    // Find and highlight current period
    let currentPeriod = null;
    if (userData.planetaryPeriods && userData.planetaryPeriods.length > 0) {
      currentPeriod = userData.planetaryPeriods.find(p => p.isCurrent);
    }

    // Add current period prominently at the top
    if (currentPeriod) {
      contextualQuery += `\n🔴 CURRENT PLANETARY PERIOD RIGHT NOW:\n`;
      contextualQuery += `- Planet: ${currentPeriod.displayName || currentPeriod.planet}\n`;
      contextualQuery += `- Card: ${currentPeriod.card}\n`;
      contextualQuery += `- Started: ${currentPeriod.formattedStartDate || currentPeriod.startDate}\n`;
      contextualQuery += `- Duration: 52 days\n`;
    }

    // Add yearly forecast cards if available
    if (userData.yearlyCards && userData.yearlyCards.length > 0) {
      contextualQuery += `\nYEARLY FORECAST CARDS (Age ${userData.age}):\n`;
      userData.yearlyCards.forEach(card => {
        contextualQuery += `- ${card.type}: ${card.card}\n`;
      });
    }

    // Add all planetary periods
    if (userData.planetaryPeriods && userData.planetaryPeriods.length > 0) {
      contextualQuery += `\nALL PLANETARY PERIODS THIS YEAR (52-day cycles):\n`;
      
      userData.planetaryPeriods.forEach(period => {
        const isCurrent = period.isCurrent || false;
        const marker = isCurrent ? ' ← CURRENT PERIOD' : '';
        const displayName = period.displayName || period.planet;
        const card = period.card;
        const startDate = period.formattedStartDate || period.startDate || '';
        
        contextualQuery += `- ${displayName}: ${card} (starts ${startDate})${marker}\n`;
      });
    }

    contextualQuery += `\n===== END OF USER'S ACTUAL DATA =====

Question: ${query}

IMPORTANT INSTRUCTIONS:
1. When asked "what period am I in" or "what's my current planetary period", answer with the CURRENT PLANETARY PERIOD shown above (marked with 🔴)
2. When asked about yearly cards, use the YEARLY FORECAST CARDS listed above
3. When asked about dates or timing, use the dates provided above
4. FIRST answer the question using the actual data above
5. THEN explain what it means using your cardology books knowledge
6. Include citations from books when explaining meanings

DO NOT make up or infer period information - use ONLY the data provided above.
`;

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: contextualQuery
    });

    console.log('💬 Message added to thread');

    // Run assistant with file search
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: ASSISTANT_ID,
      instructions: `The user's birth card is ${userData.birthCard}. Focus your response on their specific card characteristics and provide actionable guidance. Always cite sources from the books when referencing specific information.`
    });

    console.log('🤖 Assistant run status:', run.status);

    // Check run status
    if (run.status !== 'completed') {
      console.error('Assistant run failed:', run.status, run.last_error);
      return Response.json({ 
        error: 'Unable to process your request at this time. Please try again.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Get messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];
    
    // Extract text content
    const responseText = lastMessage.content
      .filter(c => c.type === 'text')
      .map(c => c.text.value)
      .join('\n');

    // Extract citations
    const citations = lastMessage.content
      .filter(c => c.type === 'text')
      .flatMap(c => c.text.annotations || []);

    console.log(`✅ Response generated with ${citations.length} citations`);

    return Response.json({
      response: responseText,
      citations: citations.length,
      threadId: threadId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Don't expose internal errors
    return Response.json({ 
      error: 'Unable to process your request at this time. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Optional: Cleanup endpoint for old threads
export async function DELETE(request) {
  try {
    const { sessionId } = await request.json();
    const openai = getOpenAIClient();
    
    if (threadStore.has(sessionId)) {
      const threadId = threadStore.get(sessionId);
      
      try {
        await openai.beta.threads.del(threadId);
        threadStore.delete(sessionId);
        console.log('🗑️ Thread deleted:', threadId);
      } catch (error) {
        console.error('Error deleting thread:', error);
      }
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete thread error:', error);
    return Response.json({ success: false }, { status: 500 });
  }
}
