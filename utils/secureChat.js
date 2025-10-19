// Secure Chat Integration with Vector Database Assistants
// Handles secure communication with OpenAI Assistants API

/**
 * Get or create a session ID for thread persistence
 * @returns {string} Session ID
 */
function getSessionId() {
  // Try to get existing session ID
  let sessionId = localStorage.getItem('chat_session_id');
  
  // Create new session if none exists
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Clear the current session (use when user logs out)
 */
export function clearChatSession() {
  const sessionId = localStorage.getItem('chat_session_id');
  
  if (sessionId) {
    // Try to delete thread on server
    fetch('/api/chat', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    }).catch(err => console.warn('Could not delete thread:', err));
    
    localStorage.removeItem('chat_session_id');
  }
}

/**
 * Send a message to the Vector Database AI chat API
 * @param {string} message - User's message
 * @param {Object} userData - User's profile data
 * @returns {Promise<string>} AI response
 */
export async function sendSecureMessage(message, userData) {
  try {
    // Validate inputs
    if (!message || !userData) {
      throw new Error('Message and user data are required');
    }

    // Get session ID for thread persistence
    const sessionId = getSessionId();

    // Prepare request data
    const requestData = {
      query: message,
      userData: {
        birthCard: userData.birthCard,
        age: userData.age,
        name: userData.name,
        uid: userData.uid || 'anonymous'
      },
      sessionId: sessionId
    };

    console.log('📤 Sending request to Vector Database API...');
    const startTime = Date.now();
    
    // Call Vector Database API (with 60 second timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`⏱️ API responded in ${elapsed}s`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment before sending another message.');
        }
        
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Log citations count if available
      if (data.citations > 0) {
        console.log(`📚 Response includes ${data.citations} citations from books`);
      }
      
      if (!data.response) {
        console.error('❌ No response in data:', data);
        throw new Error('No response received from API');
      }
      
      console.log(`✅ Received response: ${data.response.length} characters`);
      
      // Return full data object with response and citations
      return {
        response: data.response,
        citations: data.citations || 0,
        threadId: data.threadId
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 60 seconds. Please try again.');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Secure chat error:', error);
    throw new Error(error.message || 'Unable to get AI response. Please try again.');
  }
}

/**
 * Validate user message before sending
 * @param {string} message - User's message
 * @returns {boolean} Whether message is valid
 */
export function validateMessage(message) {
  if (!message || message.trim().length === 0) {
    return false;
  }

  if (message.length > 1000) {
    return false;
  }

  // Check for potentially sensitive information
  const sensitivePatterns = [
    /password/i,
    /credit.?card/i,
    /ssn|social.?security/i,
    /bank.?account/i
  ];

  return !sensitivePatterns.some(pattern => pattern.test(message));
}

/**
 * Sanitize user message for display
 * @param {string} message - User's message
 * @returns {string} Sanitized message
 */
export function sanitizeMessage(message) {
  return message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Format AI response for display (with Markdown support)
 * @param {string} response - AI response
 * @returns {string} Formatted response
 */
export function formatAIResponse(response) {
  // Convert Markdown-style formatting to HTML
  return response
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

/**
 * Get chat suggestions based on user's birth card
 * @param {string} birthCard - User's birth card
 * @returns {Array<string>} Array of suggested questions
 */
export function getChatSuggestions(birthCard) {
  const suggestions = {
    'Queen of Spades': [
      "What are my business strengths?",
      "How can I improve my strategic leadership?",
      "What business opportunities should I focus on?"
    ],
    'King of Hearts': [
      "How can I build stronger business relationships?",
      "What's my approach to emotional intelligence in business?",
      "How can I improve my networking?"
    ],
    'Ace of Clubs': [
      "What business ideas align with my card?",
      "How can I communicate better in business?",
      "What learning opportunities should I pursue?"
    ],
    // Add more card-specific suggestions
    'default': [
      "What are my business strengths?",
      "What business strategies align with my birth card?",
      "How can I optimize my business timing?",
      "What should I focus on for growth?"
    ]
  };

  return suggestions[birthCard] || suggestions.default;
}

/**
 * Rate limiting helper
 * @param {string} userId - User ID
 * @param {number} limit - Request limit per minute
 * @returns {boolean} Whether request is allowed
 */
export function checkRateLimit(userId, limit = 10) {
  // Simple in-memory rate limiting (in production, use Redis or database)
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  if (!window.rateLimitStore) {
    window.rateLimitStore = new Map();
  }
  
  const userRequests = window.rateLimitStore.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  window.rateLimitStore.set(userId, recentRequests);
  
  return true;
}
