'use client'

import { useState } from 'react';

export default function TestChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);
    setError('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Test data
      const testUserData = {
        name: 'Test User',
        birthCard: 'Queen of Hearts',
        age: 35,
        uid: 'test-user'
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          userData: testUserData,
          sessionId: 'test-session-' + Date.now()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      console.log('📚 Response includes', data.citations, 'citations from books');

      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        citations: data.citations 
      }]);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-3xl font-bold mb-2">🧪 Vector Database Test</h1>
          <p className="text-gray-600 mb-4">
            Testing AI chat with Vector Store integration
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <strong>Test User:</strong> Queen of Hearts, Age 35
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg mb-4">👋 Start chatting to test the Vector Database!</p>
              <p className="text-sm">Try asking:</p>
              <ul className="text-left max-w-md mx-auto mt-2 space-y-1">
                <li>• "What are my business strengths?"</li>
                <li>• "How should a Queen of Hearts approach leadership?"</li>
                <li>• "When is the best time to launch a new project?"</li>
              </ul>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[80%] p-4 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.citations > 0 && (
                  <div className="text-xs mt-2 opacity-75">
                    📚 {msg.citations} citation{msg.citations > 1 ? 's' : ''} from books
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 mt-2">Getting response from AI...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              ❌ Error: {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question about business, cards, or timing..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ✅ Using Vector Store with 8 cardology books
          </p>
        </div>

        {/* Status Info */}
        <div className="mt-4 bg-gray-100 rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2">🔍 What to Check:</h3>
          <ul className="space-y-1 text-gray-700">
            <li>✓ Open browser console (F12) to see citation logs</li>
            <li>✓ Check terminal for "✅ Response generated with X citations"</li>
            <li>✓ Responses should be card-specific (Queen of Hearts)</li>
            <li>✓ Response time should be 2-5 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

