'use client'

import React, { useState } from 'react';
import { uploadBook } from '../../utils/unifiedBookStorage';

export default function BookIntegrationTestPage() {
  const [testResults, setTestResults] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [chatResponse, setChatResponse] = useState('');

  // Test book with unique identifiable content
  const testBook = {
    title: "UNIQUE_TEST_BOOK_FOR_CHATGPT_INTEGRATION",
    description: "A test book to verify ChatGPT can access and use book content",
    cards: [
      {
        cardName: "Test Ace of Spades",
        cardSymbol: "AS",
        description: "Test card for verification",
        highVibration: "UNIQUE_MARKER_12345: This specific text should appear in ChatGPT responses when discussing Ace of Spades. It proves the book integration is working correctly.",
        lowVibration: "UNIQUE_MARKER_67890: When Ace of Spades is in low vibration, this unique test content should be referenced by ChatGPT."
      },
      {
        cardName: "Test King of Hearts", 
        cardSymbol: "KH",
        description: "Another test card for verification",
        highVibration: "VERIFICATION_TOKEN_ABC123: King of Hearts high vibration content that ChatGPT should reference when discussing leadership and emotional intelligence.",
        lowVibration: "VERIFICATION_TOKEN_XYZ789: King of Hearts low vibration warning signs that should appear in ChatGPT responses."
      }
    ]
  };

  const uploadTestBook = async () => {
    setIsUploading(true);
    setTestResults('Uploading test book...');
    
    try {
      const bookId = await uploadBook(testBook);
      setTestResults(prev => prev + `\n✅ Test book uploaded successfully! ID: ${bookId}`);
      setTestResults(prev => prev + `\n📚 Book title: "${testBook.title}"`);
      setTestResults(prev => prev + `\n🔍 Look for markers: UNIQUE_MARKER_12345, VERIFICATION_TOKEN_ABC123`);
    } catch (error) {
      setTestResults(prev => prev + `\n❌ Error uploading test book: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const testChatIntegration = async () => {
    setIsTesting(true);
    setChatResponse('');
    setTestResults(prev => prev + `\n\n🧪 Testing ChatGPT integration...`);
    
    const testQuery = "Tell me about Ace of Spades business strategy";
    const userData = {
      name: "Test User",
      birthCard: "AS", // This should match our test book content
      age: 35
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testQuery,
          userData: userData
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        setChatResponse(data.response);
        
        // Check if our unique markers appear in the response
        const hasMarker1 = data.response.includes('UNIQUE_MARKER_12345');
        const hasMarker2 = data.response.includes('VERIFICATION_TOKEN_ABC123');
        const hasBookTitle = data.response.includes('UNIQUE_TEST_BOOK');
        
        setTestResults(prev => prev + `\n\n📊 Integration Test Results:`);
        setTestResults(prev => prev + `\n${hasMarker1 ? '✅' : '❌'} UNIQUE_MARKER_12345 found: ${hasMarker1}`);
        setTestResults(prev => prev + `\n${hasMarker2 ? '✅' : '❌'} VERIFICATION_TOKEN_ABC123 found: ${hasMarker2}`);
        setTestResults(prev => prev + `\n${hasBookTitle ? '✅' : '❌'} Book title referenced: ${hasBookTitle}`);
        
        if (hasMarker1 || hasMarker2 || hasBookTitle) {
          setTestResults(prev => prev + `\n\n🎉 SUCCESS: Book content is being used by ChatGPT!`);
        } else {
          setTestResults(prev => prev + `\n\n⚠️  WARNING: No unique markers found. Check server logs.`);
        }
      } else if (data.error) {
        setTestResults(prev => prev + `\n❌ Chat API Error: ${data.error}`);
      }
      
    } catch (error) {
      setTestResults(prev => prev + `\n❌ Error testing chat integration: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults('');
    setChatResponse('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">🧪 Book Integration Test Suite</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">📋 Test Instructions</h2>
          <ol className="text-blue-700 space-y-2">
            <li><strong>1. Upload Test Book:</strong> Creates a book with unique markers that ChatGPT should reference</li>
            <li><strong>2. Test Chat Integration:</strong> Asks ChatGPT about content that should trigger book lookup</li>
            <li><strong>3. Check Results:</strong> Verifies if unique markers from the book appear in ChatGPT responses</li>
            <li><strong>4. Monitor Logs:</strong> Check browser console and server terminal for detailed logs</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">🎮 Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={uploadTestBook}
                disabled={isUploading}
                className={`w-full py-3 px-6 rounded-lg font-medium ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isUploading ? 'Uploading...' : '📚 Upload Test Book'}
              </button>
              
              <button
                onClick={testChatIntegration}
                disabled={isTesting}
                className={`w-full py-3 px-6 rounded-lg font-medium ${
                  isTesting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isTesting ? 'Testing...' : '🤖 Test ChatGPT Integration'}
              </button>
              
              <button
                onClick={clearResults}
                className="w-full py-3 px-6 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                🗑️ Clear Results
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 What to Look For:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• <code>UNIQUE_MARKER_12345</code> in ChatGPT response</li>
                <li>• <code>VERIFICATION_TOKEN_ABC123</code> in response</li>
                <li>• Server logs showing book retrieval</li>
                <li>• Reference to test book title</li>
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">📊 Test Results</h2>
            
            {testResults && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">System Logs:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                  {testResults}
                </pre>
              </div>
            )}
            
            {chatResponse && (
              <div>
                <h3 className="font-semibold mb-2">ChatGPT Response:</h3>
                <div className="bg-blue-50 p-4 rounded-lg text-sm max-h-60 overflow-y-auto">
                  {chatResponse}
                </div>
              </div>
            )}
            
            {!testResults && !chatResponse && (
              <div className="text-gray-500 text-center py-8">
                Run tests to see results here...
              </div>
            )}
          </div>
        </div>

        {/* Server Log Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">🖥️ Server Log Monitoring</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <strong>To see detailed server logs, check your terminal where the Next.js server is running.</strong>
            </p>
            <p className="text-gray-700 mb-2">
              Look for these log messages when testing:
            </p>
            <ul className="text-gray-600 text-sm space-y-1 ml-4">
              <li>• <code>✅ Found X relevant sections for query</code></li>
              <li>• <code>📚 Relevant sections: [...]</code></li>
              <li>• <code>🚀 Final prompt length: X</code></li>
              <li>• <code>📝 Book context included: true</code></li>
              <li>• <code>❌ No books found</code> (if no books available)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}