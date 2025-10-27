'use client'

import React, { useState, useRef, useEffect } from 'react';
import { sendSecureMessage, validateMessage, sanitizeMessage, formatAIResponse, getChatSuggestions, checkRateLimit } from '../utils/secureChat';
import { getQuickAnswer } from '../utils/sessionAnswers';
import { useAuth } from '../contexts/AuthContext';
import { saveChatConversation, updateChatConversation } from '../utils/chatConversationManager';

const SecureChatInterface = ({ userData }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi there! I'm your Cardology Business Coach, ready to help you unlock the path to your most aligned business success. I can't see your full spread, but if you tell me which card you're looking at and its position, I'll decode exactly what it means for your business strategy.

So—what part of your business would you like clarity on today?`,
      citations: 0
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
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

    // Try to answer from session data first (instant response - no API call)
    const quickAnswer = getQuickAnswer(sanitizedMessage, userData);
    
    if (quickAnswer) {
      console.log('⚡ Quick answer from session data (no API call needed)');
      setMessages([...newMessages, {
        role: 'assistant',
        content: quickAnswer,
        citations: 0,
        source: 'session' // Mark as session-based answer
      }]);
      return; // Skip API call
    }

    // If no quick answer available, call the Vector Database API
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
        citations: responseData.citations || 0,
        source: 'gpt' // Mark as GPT-based answer
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

  // Save conversation to Firestore
  const saveConversation = async () => {
    if (!user) {
      alert('Please sign in to save conversations.');
      return;
    }

    try {
      setIsSaving(true);

      const conversationData = {
        messages: messages.filter((msg, index) => index !== 0), // Skip welcome message
        userData: {
          name: userData?.name,
          birthCard: userData?.birthCard,
          age: userData?.age
        },
        title: `Chat ${new Date().toLocaleDateString()}`
      };

      if (currentConversationId) {
        // Update existing conversation
        await updateChatConversation(currentConversationId, conversationData);
      } else {
        // Save new conversation
        const result = await saveChatConversation(user.uid, conversationData);
        setCurrentConversationId(result.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('❌ Error saving conversation:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to save conversation: ${error.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setIsSaving(false);
    }
  };


  const suggestions = getChatSuggestions(userData?.birthCard);

  return (
    <div className="flex h-full max-h-96">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        
        {/* Chat Header with Save Button */}
        <div className="flex justify-start items-center px-4 py-2 bg-white border-b border-gray-200">
          {/* Save Conversation Button */}
          <button
            onClick={saveConversation}
            disabled={isSaving || saved || !user}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              saved
                ? 'bg-green-500 text-white cursor-default'
                : isSaving
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : !user
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={!user ? 'Sign in to save conversations' : 'Save conversation to your account'}
          >
            {saved ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Saved!</span>
              </>
            ) : isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="font-medium">Saving...</span>
              </>
            ) : (
              <>
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                <span className="font-medium">Save</span>
              </>
            )}
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                       {message.source === 'session' && (
                         <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-green-600">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                           </svg>
                           <span>Instant answer from your session data</span>
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
    </div>
  );
};

export default SecureChatInterface;
