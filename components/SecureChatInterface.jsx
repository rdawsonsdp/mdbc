'use client'

import React, { useState, useRef, useEffect } from 'react';
import { sendSecureMessage, validateMessage, sanitizeMessage, formatAIResponse, getChatSuggestions, checkRateLimit } from '../utils/secureChat';

const SecureChatInterface = ({ userData, onSessionSaved }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your Cardology Business Coach. I analyze comprehensive cardology knowledge to provide you with accurate, personalized guidance based on your birth card.

**⏱️ Response Time: 20-30 seconds** - I'm analyzing extensive cardology knowledge to give you the best answer.

What would you like to know about your business strategy?`,
      citations: 0
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    // Validate message
    if (!validateMessage(message)) {
      setError('Please enter a valid message (max 1000 characters)');
      return;
    }

    // Check rate limit
    if (!checkRateLimit(userData?.uid || 'anonymous', 10)) {
      setError('Too many requests. Please wait a moment before sending another message.');
      return;
    }

    const sanitizedMessage = sanitizeMessage(message);
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: sanitizedMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setError('');
    setIsLoading(true);

    try {
      console.log('🚀 Sending message to Vector Database...', { userData });
      
      // Send to secure API
      const responseData = await sendSecureMessage(sanitizedMessage, userData);
      
      console.log('✅ Got response from Vector Database:', responseData?.response?.substring(0, 100) + '...');
      
      // Add AI response with citations
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: responseData.response || responseData,
        citations: responseData.citations || 0
      }]);
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      setError(error.message || 'Failed to get response. Please try again.');
      
      // Remove the user message if there was an error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const suggestions = getChatSuggestions(userData?.birthCard);

  return (
    <div className="flex flex-col h-full max-h-96">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-full px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {message.role === 'assistant' ? (
                <>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatAIResponse(message.content) 
                    }} 
                  />
                  {message.citations > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-medium">
                        {message.citations} {message.citations === 1 ? 'citation' : 'citations'} from your cardology books
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <div>
                  <div className="font-medium">Searching Cardology Knowledge Base...</div>
                  <div className="text-xs text-gray-500">Analyzing your birth card profile • 20-30 seconds</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Chat Suggestions */}
      {messages.length <= 1 && (
        <div className="p-4 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your business strategy..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isLoading ? (
            <span className="text-blue-600 font-medium">
              ⏳ Analyzing Cardology Knowledge Base (20-30s) • Please wait...
            </span>
          ) : (
            <span>🔐 Powered by AI • Expert cardology guidance from comprehensive knowledge base</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default SecureChatInterface;
