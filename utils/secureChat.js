// Secure Chat Integration
// This utility handles secure communication with the AI chat API

/**
 * Send a message to the secure AI chat API
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

    // Prepare request data
    const requestData = {
      query: message,
      userData: {
        birthCard: userData.birthCard,
        age: userData.age,
        name: userData.name,
        // Only send necessary data, not proprietary information
      }
    };

    // Call secure API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.error('Secure chat error:', error);
    throw new Error('Unable to get AI response. Please try again.');
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
 * Format AI response for display
 * @param {string} response - AI response
 * @returns {string} Formatted response
 */
export function formatAIResponse(response) {
  // Convert line breaks to HTML
  return response
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

/**
 * Get chat suggestions based on user's birth card
 * @param {string} birthCard - User's birth card
 * @returns {Array<string>} Array of suggested questions
 */
export function getChatSuggestions(birthCard) {
  const suggestions = {
    'Queen of Spades': [
      "How can I improve my strategic leadership skills?",
      "What business opportunities should I focus on this year?",
      "How can I make better intuitive business decisions?"
    ],
    'King of Hearts': [
      "How can I build stronger business relationships?",
      "What's the best approach for emotional intelligence in business?",
      "How can I improve my networking skills?"
    ],
    // Add more card-specific suggestions
    'default': [
      "What business strategies align with my birth card?",
      "How can I optimize my business cycles?",
      "What should I focus on for business growth?",
      "How can I improve my business timing?"
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
