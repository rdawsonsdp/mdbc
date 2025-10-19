'use client'

import React, { useState } from 'react';
import { uploadBook } from '../utils/unifiedBookStorage';

const BookLoadingTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testBookUpload = async () => {
    setIsLoading(true);
    addResult('🧪 Starting book upload test...', 'info');
    
    try {
      const sampleBook = {
        title: 'Test Cardology Guide',
        description: 'Test book for verifying book loading functionality',
        content: `High Vibration Traits for A♥:
        
        - Liberal beliefs with creative, out-of-the-box thinking
        - Powerful feelings with a sensitive heart and natural artistic abilities
        - Strong work ethic and pursuit of making a mark for yourself
        - A pension for soul-searching and introspection
        
        Business Activation:
        - Creative ways to make money or begin new financial ventures
        - Building projects that expand spiritual ideals
        - Artistic fields and creative expression
        
        Low Vibration (Shadow):
        - Taking risks in love without commitment
        - Naivety and immaturity in decision-making
        - Jumping to new things without stable foundation`
      };

      addResult('📤 Uploading test book...', 'info');
      const bookId = await uploadBook(sampleBook);
      addResult(`✅ Book uploaded successfully! ID: ${bookId}`, 'success');
      
      // Test chat API
      addResult('🤖 Testing chat API with book context...', 'info');
      await testChatAPI();
      
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
      console.error('Book upload test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testChatAPI = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'What are my high vibration traits?',
          userData: {
            birthCard: 'A♥',
            name: 'Test User'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      addResult(`✅ Chat API responded successfully`, 'success');
      addResult(`📝 Response length: ${data.response?.length || 0} characters`, 'info');
      
      // Check if response mentions book content
      if (data.response?.includes('High Vibration') || data.response?.includes('creative')) {
        addResult('🎯 Book context detected in response!', 'success');
      } else {
        addResult('⚠️ No book context detected in response', 'warning');
      }
      
    } catch (error) {
      addResult(`❌ Chat API error: ${error.message}`, 'error');
    }
  };

  const testBookRetrieval = async () => {
    try {
      addResult('🔍 Testing book retrieval...', 'info');
      
      // This would test the server-side book retrieval
      const response = await fetch('/api/books', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const books = await response.json();
        addResult(`✅ Retrieved ${books.length} books from database`, 'success');
      } else {
        addResult(`⚠️ Book retrieval API not available (${response.status})`, 'warning');
      }
      
    } catch (error) {
      addResult(`❌ Book retrieval error: ${error.message}`, 'error');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Loading Test</h1>
      
      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="flex space-x-4 mb-4">
          <button
            onClick={testBookUpload}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
          >
            {isLoading ? 'Testing...' : 'Test Book Upload & Chat'}
          </button>
          
          <button
            onClick={testBookRetrieval}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
          >
            Test Book Retrieval
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Clear Results
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Test 1:</strong> Upload a sample book and test chat API</p>
          <p><strong>Test 2:</strong> Test server-side book retrieval</p>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500">No test results yet. Click a test button above.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  result.type === 'success' 
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : result.type === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : result.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                    : 'bg-blue-50 border-blue-400 text-blue-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span>{result.message}</span>
                  <span className="text-xs text-gray-500 ml-2">{result.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">What This Tests:</h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li><strong>Book Upload:</strong> Tests if books can be saved to Firestore</li>
          <li><strong>Chat API:</strong> Tests if the chat API can access uploaded books</li>
          <li><strong>Book Context:</strong> Verifies if book content appears in chat responses</li>
          <li><strong>Server-Side Access:</strong> Tests Firebase Admin SDK functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default BookLoadingTest;
