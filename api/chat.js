// Secure AI Chat API with Book Context Integration
// This API injects your proprietary book content into ChatGPT context

import OpenAI from 'openai';
import { searchBookContent } from '../utils/bookStorage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Data sanitization function
function sanitizeUserInput(query) {
  // Remove any potential proprietary information from user input
  const proprietaryTerms = [
    'cardology methodology',
    'business cycle algorithm', 
    'proprietary interpretation',
    'internal methodology'
  ];
  
  let sanitized = query;
  proprietaryTerms.forEach(term => {
    sanitized = sanitized.replace(new RegExp(term, 'gi'), '[business guidance]');
  });
  
  return sanitized;
}

// Add book context to ChatGPT prompt
async function addBookContext(query, userData) {
  try {
    // Get relevant book content based on user query and profile
    const relevantSections = await searchBookContent(query, userData);
    
    if (relevantSections.length === 0) {
      return createBasicPrompt(query, userData);
    }
    
    // Format book content for ChatGPT context
    const bookContext = relevantSections.map(section => 
      `**${section.sectionTitle}** (from ${section.bookTitle} - ${section.chapterTitle}):
${section.content}

Keywords: ${section.keywords.join(', ')}
Business Topics: ${section.businessTopics.join(', ')}
`
    ).join('\n---\n');
    
    return `
You are a professional business coach specializing in cardology-based business strategy. Use the following book content to provide expert guidance:

BOOK CONTENT:
${bookContext}

USER PROFILE:
- Name: ${userData.name}
- Birth Card: ${userData.birthCard}
- Age: ${userData.age}

USER QUERY: ${query}

INSTRUCTIONS:
- Use the book content above to provide personalized business advice
- Reference specific sections from the book when relevant
- Focus on practical applications of the book's teachings
- Provide actionable strategies based on the user's birth card
- Keep responses professional and helpful
- If the book content doesn't directly address the query, provide general cardology-based guidance

Response should be:
- Based on the book content provided
- Personalized to their birth card
- Actionable and specific
- Professional in tone
- Focused on business success
`;
    
  } catch (error) {
    console.error('Error getting book context:', error);
    return createBasicPrompt(query, userData);
  }
}

// Create basic prompt when no book content is available
function createBasicPrompt(query, userData) {
  return `
You are a professional business coach specializing in cardology-based business strategy.

User Profile:
- Name: ${userData.name}
- Birth Card: ${userData.birthCard}
- Age: ${userData.age}

User Query: ${query}

Guidelines:
- Provide business advice based on cardology principles
- Focus on strategic business cycles and timing
- Reference their birth card characteristics for personalized guidance
- Offer actionable business strategies
- Keep responses professional and helpful
- Focus on practical business applications

Response should be:
- Personalized to their birth card
- Actionable and specific
- Professional in tone
- Focused on business success
`;
}

// Filter AI response to ensure no data leaks
function filterResponse(aiResponse) {
  // Remove any potential proprietary information that might leak
  const filtered = aiResponse
    .replace(/proprietary|confidential|internal|algorithm/gi, 'approach')
    .replace(/methodology/gi, 'method')
    .replace(/secret|private/gi, 'specialized');
  
  // Add disclaimer
  return filtered + '\n\n*This guidance is based on cardology principles and should be used as business strategy guidance only.*';
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, userData } = req.body;

    // Validate input
    if (!query || !userData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sanitize user input
    const sanitizedQuery = sanitizeUserInput(query);
    
    // Add book context
    const enhancedQuery = await addBookContext(sanitizedQuery, userData);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional business coach specializing in cardology-based business strategy. Provide personalized business guidance based on birth card characteristics and business cycles."
        },
        {
          role: "user",
          content: enhancedQuery
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Filter response
    const filteredResponse = filterResponse(aiResponse);
    
    // Log interaction (without sensitive data)
    console.log('AI Chat Interaction:', {
      timestamp: new Date().toISOString(),
      userCard: userData.birthCard,
      queryLength: query.length,
      responseLength: filteredResponse.length
    });

    return res.status(200).json({ 
      response: filteredResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Don't expose internal errors
    return res.status(500).json({ 
      error: 'Unable to process your request at this time. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
}
