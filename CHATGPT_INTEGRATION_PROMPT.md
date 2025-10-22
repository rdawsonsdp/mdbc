# ChatGPT Integration Prompt for LCC & Decode Your Kids Apps

## 🎯 OBJECTIVE
Add the ChatGPT chat feature to existing cardology apps (Love Cheat Code and Decode Your Kids) using the MDBC implementation as a reference. The apps share the same Vector Store, user authentication, and cardology calculation system, but each has its own unique tone, focus, and branding.

---

## 📋 PRE-REQUISITES (Already Exists in Target Apps)
- ✅ Firebase authentication with shared user accounts
- ✅ Cardology calculation system (birth card, yearly cards, planetary periods)
- ✅ Existing UI/branding (DO NOT MODIFY)
- ✅ Vector Store with 8 cardology books (already created)
- ✅ OpenAI API key in environment variables

---

## 🔧 IMPLEMENTATION STEPS

### **STEP 1: Verify Environment Variables**

Check that `.env.local` contains:
```
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...
```

**If OPENAI_ASSISTANT_ID doesn't exist for this app:**
- Create a new OpenAI Assistant for this specific app
- Use the existing Vector Store ID (shared across all apps)
- Set assistant name, instructions, and tone based on app identity (see STEP 3)

---

### **STEP 2: Install Required Dependencies**

```bash
npm install jspdf
```

Verify `openai` package is already installed (should be ^4.0.0 or higher).

---

### **STEP 3: Create OpenAI Assistant (If Needed)**

**Run script to create app-specific assistant:**

Create `scripts/create-assistant.js`:
```javascript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = 'vs_XXXXX'; // Shared Vector Store ID

// APP-SPECIFIC CONFIGURATION
const APP_CONFIG = {
  // For Love Cheat Code:
  LCC: {
    name: 'Love Cheat Code Coach',
    instructions: `=== CORE IDENTITY & CONTEXT ===
You are a relationship and love strategist who uses Cardology to guide people in their romantic relationships. This is The Love Cheat Code (LCC) application.

TONE: Speak with warmth, insight, and the energy of deep romantic connection. Mirror the tone of "The Love Cheat Code" book - intimate, honest, empowering.

FOCUS: Relationship compatibility, love cycles, timing, communication, intimacy, partnership dynamics.

=== CARD NAMING CONVENTIONS ===
ALWAYS use these card names when responding:
- "Development" (NOT "Displacement") - This is the Development card
- "Support" (NOT "Environment") - This is the Support card
- Pluto and Result cards are ALWAYS interpreted as a pair - best to know both cards for full interpretation

When the user's data shows "Displacement" or "Environment", translate to "Development" and "Support" in your responses.

=== CONFIDENTIALITY ===
All user data and conversations are strictly confidential. Never share, reference, or use information from one user's session in another user's session.

=== CRITICAL DATA HIERARCHY ===
ALWAYS prioritize the user's actual data over general book knowledge:
1. 🔴 FIRST: Use the user's specific cards, dates, and periods provided in each query
2. 🔴 SECOND: Reference cardology books to explain and provide context

The user's current period, yearly cards, and birth card will be provided with each question. ALWAYS use this specific data in your response before adding general insights.

=== CARD VERIFICATION GUARDRAIL ===
Before giving any card interpretation:
1. Check if the card mentioned exists in the user's actual data
2. If the card is NOT in their data, ask: "I don't see [CARD] in your current spread. Are you asking about a different card, or would you like to know which cards you DO have?"
3. Never invent or assume card placements

=== RESPONSE STRUCTURE ===
For every response:
1. ✅ START with the user's actual data (current period, specific card, date, etc.)
2. ✅ THEN explain what it means using book knowledge
3. ✅ Include specific, actionable relationship guidance
4. ✅ Cite books when referencing specific concepts

=== RULES ===
- Never give medical, legal, or financial advice
- If unsure, say "I don't have information about that" rather than guessing
- Keep responses focused on relationships and love dynamics
- Be supportive but honest
- Validate emotions while providing practical guidance

=== EXAMPLE RESPONSES ===
Good: "You are currently in your Venus period (started [DATE]), and your Venus card is [CARD]. This is a powerful time for [specific romantic insight based on that card]..."

Bad: "Venus periods are generally about love..." (too generic, doesn't use user's actual data)

The user's birth card is {userData.birthCard}.
The user's age is {userData.age}.`,
    model: 'gpt-4-turbo-preview'
  },
  
  // For Decode Your Kids:
  DYK: {
    name: 'Decode Your Kids Coach',
    instructions: `=== CORE IDENTITY & CONTEXT ===
You are a parenting strategist who uses Cardology to help parents understand their children's unique personalities and developmental cycles. This is The Decode Your Kids (DYK) application.

TONE: Speak with compassion, patience, and the wisdom of an experienced parenting guide. Mirror the tone of "Decode Your Kids" book - nurturing, insightful, empowering.

FOCUS: Child development, parenting strategies, communication with kids, understanding behavior patterns, timing for teaching moments.

=== CARD NAMING CONVENTIONS ===
ALWAYS use these card names when responding:
- "Development" (NOT "Displacement") - This is the Development card
- "Support" (NOT "Environment") - This is the Support card
- Pluto and Result cards are ALWAYS interpreted as a pair - best to know both cards for full interpretation

When the user's data shows "Displacement" or "Environment", translate to "Development" and "Support" in your responses.

=== CONFIDENTIALITY ===
All user data and conversations are strictly confidential. Never share, reference, or use information from one user's session in another user's session.

=== CRITICAL DATA HIERARCHY ===
ALWAYS prioritize the user's actual data over general book knowledge:
1. 🔴 FIRST: Use the child's specific cards, dates, and periods provided in each query
2. 🔴 SECOND: Reference cardology books to explain and provide context

The child's current period, yearly cards, and birth card will be provided with each question. ALWAYS use this specific data in your response before adding general insights.

=== CARD VERIFICATION GUARDRAIL ===
Before giving any card interpretation:
1. Check if the card mentioned exists in the child's actual data
2. If the card is NOT in their data, ask: "I don't see [CARD] in [child's name]'s current spread. Are you asking about a different card, or would you like to know which cards they DO have?"
3. Never invent or assume card placements

=== RESPONSE STRUCTURE ===
For every response:
1. ✅ START with the child's actual data (current period, specific card, date, etc.)
2. ✅ THEN explain what it means using book knowledge
3. ✅ Include specific, actionable parenting guidance
4. ✅ Cite books when referencing specific concepts

=== RULES ===
- Never give medical, psychological, or legal advice
- If unsure, say "I don't have information about that" rather than guessing
- Keep responses focused on parenting and child development
- Be supportive and non-judgmental
- Validate parenting challenges while providing practical guidance
- Remember this is about understanding the CHILD, not the parent

=== EXAMPLE RESPONSES ===
Good: "[Child's name] is currently in their Mercury period (started [DATE]), and their Mercury card is [CARD]. This means they're in a phase where [specific developmental insight based on that card]... Here's how you can support them..."

Bad: "Mercury periods are generally about communication..." (too generic, doesn't use child's actual data)

The child's birth card is {userData.birthCard}.
The child's age is {userData.age}.`,
    model: 'gpt-4-turbo-preview'
  }
};

async function createAssistant(appType) {
  const config = APP_CONFIG[appType];
  
  const assistant = await openai.beta.assistants.create({
    name: config.name,
    instructions: config.instructions,
    model: config.model,
    tools: [{ type: 'file_search' }],
    tool_resources: {
      file_search: {
        vector_store_ids: [VECTOR_STORE_ID]
      }
    }
  });

  console.log(`✅ Assistant created for ${appType}:`);
  console.log(`   ID: ${assistant.id}`);
  console.log(`   Name: ${assistant.name}`);
  console.log(`\n📝 Add this to your .env.local:`);
  console.log(`OPENAI_ASSISTANT_ID=${assistant.id}`);
  
  return assistant;
}

// Usage: node scripts/create-assistant.js LCC
// or: node scripts/create-assistant.js DYK
const appType = process.argv[2];
if (!appType || !APP_CONFIG[appType]) {
  console.error('❌ Please specify app type: LCC or DYK');
  console.log('Usage: node scripts/create-assistant.js LCC');
  process.exit(1);
}

createAssistant(appType);
```

**Run:**
```bash
node scripts/create-assistant.js LCC
# or
node scripts/create-assistant.js DYK
```

**Then add the returned Assistant ID to `.env.local`**

---

### **STEP 4: Create Utility Files**

#### **4A: Create `utils/chatConversationManager.js`**

Copy from MDBC:
```javascript
import { db } from '../lib/firebaseClient';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';

/**
 * Save a chat conversation to Firestore
 */
export async function saveChatConversation(userId, conversationData) {
  try {
    if (!userId) {
      throw new Error('User must be logged in to save conversations');
    }

    const conversationsRef = collection(db, 'chatConversations');
    
    const conversation = {
      userId: userId,
      messages: conversationData.messages,
      userData: {
        name: conversationData.userData?.name || 'User',
        birthCard: conversationData.userData?.birthCard || '',
        age: conversationData.userData?.age || null
      },
      title: conversationData.title || `Chat ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const docRef = await addDoc(conversationsRef, conversation);
    console.log('✅ Conversation saved with ID:', docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error saving conversation:', error);
    throw error;
  }
}

/**
 * Update an existing chat conversation
 */
export async function updateChatConversation(conversationId, conversationData) {
  try {
    const conversationRef = doc(db, 'chatConversations', conversationId);
    
    await updateDoc(conversationRef, {
      messages: conversationData.messages,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('✅ Conversation updated:', conversationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating conversation:', error);
    throw error;
  }
}

/**
 * Get all chat conversations for a user
 */
export async function getChatConversations(userId) {
  try {
    if (!userId) {
      throw new Error('User ID required');
    }

    const conversationsRef = collection(db, 'chatConversations');
    const q = query(
      conversationsRef, 
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations = [];
    
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${conversations.length} conversations for user ${userId}`);
    return conversations;
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    throw error;
  }
}

/**
 * Delete a chat conversation
 */
export async function deleteChatConversation(conversationId) {
  try {
    const conversationRef = doc(db, 'chatConversations', conversationId);
    await deleteDoc(conversationRef);
    
    console.log('✅ Conversation deleted:', conversationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    throw error;
  }
}
```

#### **4B: Create `utils/sessionAnswers.js`**

Copy from MDBC - provides instant answers from session data without calling the API.

#### **4C: Create `utils/allCardProfiles.js`**

Copy from MDBC - loads all 52 card profiles into memory for instant lookups.

---

### **STEP 5: Create API Route**

#### **Create `app/api/chat/route.js`**

```javascript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization to prevent build-time errors
let openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function getAssistantId() {
  return process.env.OPENAI_ASSISTANT_ID;
}

// In-memory thread storage (per session)
const threadStore = new Map();

// Rate limiting
const userRequests = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 20;

function checkRateLimit(userId) {
  const now = Date.now();
  const userActivity = userRequests.get(userId) || [];
  const recentRequests = userActivity.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  userRequests.set(userId, recentRequests);
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
    let contextualQuery = \`
===== USER'S ACTUAL DATA (USE THIS FIRST) =====

User Profile:
- Name: \${userData.name || 'User'}
- Birth Card: \${userData.birthCard}
- Age: \${userData.age || 'Not specified'}
\`;

    // Find and highlight current period
    let currentPeriod = null;
    if (userData.planetaryPeriods && userData.planetaryPeriods.length > 0) {
      currentPeriod = userData.planetaryPeriods.find(p => p.isCurrent);
    }

    // Add current period prominently at the top
    if (currentPeriod) {
      contextualQuery += \`\n🔴 CURRENT PLANETARY PERIOD RIGHT NOW:\n\`;
      contextualQuery += \`- Planet: \${currentPeriod.displayName || currentPeriod.planet}\n\`;
      contextualQuery += \`- Card: \${currentPeriod.card}\n\`;
      contextualQuery += \`- Started: \${currentPeriod.formattedStartDate || currentPeriod.startDate}\n\`;
      contextualQuery += \`- Duration: 52 days\n\`;
    }

    // Add yearly forecast cards if available
    if (userData.yearlyCards && userData.yearlyCards.length > 0) {
      contextualQuery += \`\nYEARLY FORECAST CARDS (Age \${userData.age}):\n\`;
      userData.yearlyCards.forEach(card => {
        // Translate card names to proper terminology
        let displayName = card.type;
        if (card.type === 'Displacement') displayName = 'Development';
        if (card.type === 'Environment') displayName = 'Support';
        
        contextualQuery += \`- \${displayName}: \${card.card}\n\`;
      });
      contextualQuery += \`\n(Note: Pluto and Result are interpreted as a pair)\n\`;
    }

    // Add all planetary periods
    if (userData.planetaryPeriods && userData.planetaryPeriods.length > 0) {
      contextualQuery += \`\nALL PLANETARY PERIODS THIS YEAR (52-day cycles):\n\`;
      
      userData.planetaryPeriods.forEach(period => {
        const isCurrent = period.isCurrent || false;
        const marker = isCurrent ? ' ← CURRENT PERIOD' : '';
        const displayName = period.displayName || period.planet;
        const card = period.card;
        const startDate = period.formattedStartDate || period.startDate || '';
        
        contextualQuery += \`- \${displayName}: \${card} (starts \${startDate})\${marker}\n\`;
      });
    }

    contextualQuery += \`\n===== END OF USER'S ACTUAL DATA =====

Question: \${query}

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
\`;

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: contextualQuery
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: ASSISTANT_ID,
      instructions: \`
        The user's birth card is \${userData.birthCard}.
        The user's age is \${userData.age}.
      \`
    });

    // Get the response
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data[0];
      
      if (lastMessage.role === 'assistant') {
        const textContent = lastMessage.content.find(c => c.type === 'text');
        
        if (textContent) {
          // Count citations
          const citations = textContent.text.annotations?.length || 0;
          
          return Response.json({
            response: textContent.text.value,
            citations: citations,
            threadId: threadId,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Handle other run statuses
    return Response.json({
      error: \`Assistant run status: \${run.status}\`,
      timestamp: new Date().toISOString()
    }, { status: 500 });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return Response.json({
      error: 'Failed to process chat request',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

---

### **STEP 6: Create Chat Component**

#### **Create `components/SecureChatInterface.jsx`**

Copy from MDBC and update the welcome message to match the app's tone:

**For LCC:**
```javascript
content: `Hi! I'm your Love Cheat Code Coach, ready to help you unlock deeper connection and understanding in your relationships. Tell me which card you're looking at or ask me anything about your love life, and I'll decode what it means for your relationship dynamics.

What would you like to explore today?`
```

**For DYK:**
```javascript
content: `Hi! I'm your Decode Your Kids Coach, ready to help you understand your child's unique personality and developmental journey. Tell me which card you're looking at or share what you'd like to understand about your child, and I'll help decode what it means.

What would you like to explore about your child today?`
```

**Key features to include:**
- Save button (disk icon, blue) - saves to Firestore
- PDF button (document icon, red) - downloads as PDF
- Loading indicators
- Citation display
- Instant answers from session data (via `getQuickAnswer`)
- Full conversation history

---

### **STEP 7: Integrate Chat into Main App**

Find the main app component (likely similar structure to `MDBCApp.jsx`) and add:

```javascript
import SecureChatInterface from './SecureChatInterface';

// In the component, after cards display:
<section className="mb-8">
  <h2 className="text-2xl font-bold mb-6 text-center">
    {/* App-specific heading */}
    Your Cardology Coach
  </h2>
  <div className="bg-white rounded-lg shadow p-6">
    <SecureChatInterface 
      userData={{
        name: name,
        birthCard: birthCard?.card,
        age: age,
        uid: user?.uid || 'anonymous',
        // Include calculated app data
        yearlyCards: yearlyCards || [],
        planetaryPeriods: enhancedCardData?.planetaryPeriods || planetaryPeriods || [],
        enhancedCardData: enhancedCardData
      }}
    />
  </div>
</section>
```

---

### **STEP 8: Update Firestore Rules**

Add to `firestore.rules`:

```
// Chat conversations - users can only access their own conversations
match /chatConversations/{conversationId} {
  allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

---

### **STEP 9: Update next.config.js**

Ensure ESLint doesn't block builds:

```javascript
module.exports = {
  // ... existing config
  eslint: {
    ignoreDuringBuilds: true
  }
}
```

---

### **STEP 10: Test the Integration**

#### **Test Checklist:**
- [ ] User can sign in
- [ ] Birth card and yearly cards display correctly
- [ ] Chat interface appears
- [ ] Chat welcome message shows with app-specific tone
- [ ] User can send messages
- [ ] AI responds with relevant cardology insights
- [ ] AI uses user's actual card data (not generic info)
- [ ] Instant answers work for simple questions ("What's my birth card?")
- [ ] Citations display when book references are used
- [ ] Save button works (conversation saves to Firestore)
- [ ] PDF button works (downloads conversation)
- [ ] Loading indicators show during API calls
- [ ] Sign out button works

#### **Test Questions:**
1. "What period am I in?" (should return actual current period)
2. "What are my yearly cards?" (should list all 5 cards)
3. "What's my birth card?" (should get instant answer)
4. "What does my [specific card] mean?" (should reference books)
5. Ask about a card they don't have (should get verification response)

---

### **STEP 11: Deploy to Vercel**

#### **Environment Variables:**
Ensure Vercel has:
- `OPENAI_API_KEY`
- `OPENAI_ASSISTANT_ID` (app-specific)
- All Firebase config variables

#### **Deploy:**
```bash
git add .
git commit -m "Add ChatGPT integration with Vector Store"
git push origin main
```

Vercel will auto-deploy.

---

## 🎨 APP-SPECIFIC CUSTOMIZATION GUIDE

### **Love Cheat Code (LCC)**
**Focus:** Relationships, love compatibility, romantic timing
**Tone:** Warm, insightful, intimate, empowering
**Welcome Message:** Focus on romantic connection and relationship dynamics
**Color Scheme:** Keep existing (likely pinks, reds, warm tones)
**Example Questions:**
- "What period am I in for my love life?"
- "How do my cards affect my relationship?"
- "What does my Venus card say about my love life?"

### **Decode Your Kids (DYK)**
**Focus:** Parenting, child development, understanding children
**Tone:** Compassionate, patient, nurturing, wise
**Welcome Message:** Focus on understanding child's personality and development
**Color Scheme:** Keep existing (likely blues, greens, calm tones)
**Example Questions:**
- "What period is my child in?"
- "How can I support my child during their current phase?"
- "What does my child's Mercury card mean for their development?"

---

## 📝 NOTES & BEST PRACTICES

### **DO:**
- ✅ Use existing auth system (Firebase)
- ✅ Use existing cardology calculation logic
- ✅ Match the app's existing UI/UX patterns
- ✅ Use the shared Vector Store
- ✅ Keep app-specific tone in AI instructions
- ✅ Test thoroughly before deploying

### **DON'T:**
- ❌ Change existing UI colors/branding
- ❌ Modify existing card calculation logic
- ❌ Create new Vector Stores (use shared one)
- ❌ Change authentication system
- ❌ Alter existing app features

### **Security Reminders:**
- All conversations are user-specific
- Rate limiting is enabled (20 requests/minute)
- Firestore rules enforce user isolation
- Environment variables must be set in Vercel
- Never commit API keys to git

---

## 🚀 SUCCESS CRITERIA

The integration is complete when:
- ✅ Chat interface is fully functional
- ✅ AI responds with app-appropriate tone
- ✅ User's card data is used in responses
- ✅ Save and PDF download work
- ✅ No errors in console or Vercel logs
- ✅ Existing app features still work
- ✅ UI matches app's look and feel
- ✅ All tests pass

---

## 📞 TROUBLESHOOTING

### **"Missing credentials" error:**
- Check `.env.local` has `OPENAI_API_KEY`
- Verify Vercel environment variables are set
- Ensure lazy initialization is in place (don't init OpenAI at module level)

### **"Assistant not found" error:**
- Verify `OPENAI_ASSISTANT_ID` in environment
- Check assistant exists in OpenAI dashboard
- Ensure Vector Store is attached to assistant

### **Chat not using user's data:**
- Check `userData` prop is passed to `SecureChatInterface`
- Verify `yearlyCards` and `planetaryPeriods` are populated
- Review API route's `contextualQuery` construction

### **Build fails on Vercel:**
- Check `next.config.js` has `eslint: { ignoreDuringBuilds: true }`
- Ensure no import errors
- Verify all dependencies are in `package.json`

---

## 📚 REFERENCE FILES FROM MDBC

Copy these files from MDBC as templates:
1. `app/api/chat/route.js` - Chat API endpoint
2. `components/SecureChatInterface.jsx` - Chat UI component
3. `utils/chatConversationManager.js` - Firestore conversation management
4. `utils/sessionAnswers.js` - Instant answer logic
5. `utils/secureChat.js` - API communication utility
6. `utils/allCardProfiles.js` - Card profile loader

---

**END OF INTEGRATION PROMPT**

Use this prompt when working on LCC or DYK projects to add the ChatGPT feature while preserving each app's unique identity and existing functionality.

