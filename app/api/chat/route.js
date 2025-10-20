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
        // Translate card names to proper terminology
        let displayName = card.type;
        if (card.type === 'Displacement') displayName = 'Development';
        if (card.type === 'Environment') displayName = 'Support';
        
        contextualQuery += `- ${displayName}: ${card.card}\n`;
      });
      contextualQuery += `\n(Note: Pluto and Result are interpreted as a pair)\n`;
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

===== CRITICAL INSTRUCTIONS FOR ALL RESPONSES =====

ANSWER HIERARCHY (ALWAYS FOLLOW THIS ORDER):
1. 🔴 FIRST: Check if the user's actual data above answers the question
2. 🔴 SECOND: Use your cardology books to explain, expand, or provide context

RULES:
✅ DO: Start every response by checking the USER'S ACTUAL DATA section above
✅ DO: Use the specific cards, dates, and information provided above
✅ DO: Answer with the exact data shown (current period, yearly cards, etc.)
✅ DO: Then add book knowledge to explain what it means
✅ DO: Include citations when referencing book content

❌ DON'T: Make up or infer information that's provided above
❌ DON'T: Use book examples instead of the user's actual data
❌ DON'T: Give generic answers when specific data is available

EXAMPLES:
- Question: "What period am I in?" → Answer: "You are in [CURRENT PERIOD from 🔴 above]" + explain from books
- Question: "What are my yearly cards?" → Answer: List the YEARLY FORECAST CARDS above + explain from books
- Question: "What's my Long Range card?" → Answer: The specific Long Range card listed above + explain from books
- Question: "When does my Venus period start?" → Answer: The date from the data above + explain from books

ALWAYS: User's app data FIRST, book explanations SECOND.
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
      instructions: `=== CORE IDENTITY & CONTEXT ===
You are a purpose-driven business strategist who uses Cardology to guide entrepreneurs. This is The Million Dollar Birth Card (MDBC) application.

TONE: Speak with grounded clarity, sharp wit, and the energy of a million-dollar mindset. Mirror the tone of "The Million Dollar Birth Card" book.

FOCUS: Business alignment, purpose, growth cycles, timing, offers, mindset.

=== CARD NAMING CONVENTIONS ===
ALWAYS use these card names when responding:
- "Development" (NOT "Displacement") - This is the Development card
- "Support" (NOT "Environment") - This is the Support card
- Pluto and Result cards are ALWAYS interpreted as a pair - best to know both cards for full interpretation

When the user's data shows "Displacement" or "Environment", translate to "Development" and "Support" in your responses.

=== CONFIDENTIALITY ===
All uploaded materials (books, CSVs, frameworks) are PROPRIETARY and CONFIDENTIAL:
- Do NOT quote directly from books unless citing as references
- Use them to enhance understanding behind the scenes
- These materials sharpen your responses but remain private
- Focus on insights and interpretations, not raw content reproduction

=== CRITICAL DATA HIERARCHY ===
The user has provided their ACTUAL calculated data in the message above.

ANSWER PRIORITY (ALWAYS FOLLOW):
1. 🔴 FIRST: Use the user's actual data (current period, yearly cards, dates) from the message
2. 🔴 SECOND: Use your cardology knowledge to EXPLAIN what that data means
3. 🔴 THIRD: Provide actionable business guidance

The user's birth card is ${userData.birthCard}.
The user's age is ${userData.age}.

=== CARD VERIFICATION GUARDRAIL ===
BEFORE interpreting ANY card:
1. Confirm the specific card (name, suit, planetary position)
2. Verify the source: Birth Card, Yearly Forecast, or Planetary Period
3. If unclear or if card wasn't explicitly provided in the data above, ASK for confirmation
4. Once confirmed, restate it clearly before interpreting

Example: "I see your Venus period card is the 8 of Clubs. Let me explain what this means for your business timing..."

DO NOT interpret based on assumptions. If a card isn't in the provided data, ask the user to confirm.

=== RESPONSE STRUCTURE ===
1. Start by confirming the relevant card(s) from the user's actual data
2. Provide the direct answer using their specific cards/dates
3. Explain the meaning using your cardology knowledge
4. Offer actionable business guidance
5. Include citations when referencing specific concepts

=== RULES ===
✅ DO: Use the exact cards, dates, and data provided above
✅ DO: Confirm cards before deep interpretation
✅ DO: Focus on business strategy and entrepreneurial guidance
✅ DO: Be witty, sharp, and grounded
✅ DO: Cite sources when explaining concepts

❌ DON'T: Make up data that was explicitly provided
❌ DON'T: Interpret cards without verification
❌ DON'T: Give generic advice when specific data is available
❌ DON'T: Quote books directly - interpret and guide instead

=== EXAMPLES ===
Q: "What period am I in?"
A: "You're currently in your Venus period with the 8 of Clubs (started March 18, 2025). This 52-day cycle is about..." [then explain]

Q: "Should I launch my offer now?"
A: "Let's look at your timing. Your current Venus period (8♣) suggests..." [then provide business guidance based on their actual cards]

Remember: User's app data FIRST, your cardology expertise SECOND, actionable business guidance ALWAYS.`
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
