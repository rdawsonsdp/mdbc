'use client'

import React, { useState } from 'react';

const APITest = () => {
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');

  const testAPI = async () => {
    setStatus('Testing API...');
    setResponse('');

    try {
      const testData = {
        query: 'Hello, this is a test message',
        userData: {
          name: 'Test User',
          birthCard: 'A♥',
          age: 35
        }
      };

      console.log('Sending test request:', testData);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', errorText);
        setStatus(`❌ API Error: ${res.status} - ${errorText}`);
        return;
      }

      const data = await res.json();
      console.log('API Response:', data);
      
      setStatus('✅ API Test Successful!');
      setResponse(data.response || 'No response content');
      
    } catch (error) {
      console.error('Test Error:', error);
      setStatus(`❌ Test Failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={testAPI}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-4"
        >
          Test ChatGPT API
        </button>
        
        {status && (
          <div className={`p-4 rounded-lg mb-4 ${
            status.includes('✅') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {status}
          </div>
        )}
        
        {response && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">API Response:</h3>
            <pre className="text-sm whitespace-pre-wrap">{response}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-sm">
          <li>Click "Test ChatGPT API" button</li>
          <li>Check browser console (F12) for detailed logs</li>
          <li>Look for any error messages</li>
          <li>Check if OpenAI API key is configured</li>
        </ol>
      </div>
    </div>
  );
};

export default APITest;

