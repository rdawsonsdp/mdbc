'use client'

import React, { useState } from 'react';

const SimpleFirestoreTest = () => {
  const [status, setStatus] = useState('Ready to test');
  const [result, setResult] = useState('');

  const testFirestore = async () => {
    try {
      setStatus('Testing...');
      setResult('Starting test...');
      
      // Import Firebase dynamically to avoid syntax issues
      const { db } = await import('../lib/firebaseClient');
      const { collection, getDocs } = await import('firebase/firestore');
      
      console.log('Firebase imported successfully');
      setResult('Firebase imported successfully');
      
      // Test connection
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      
      console.log('Firestore test successful:', snapshot);
      setStatus('✅ Connected to Firestore');
      setResult(`Success! Found ${snapshot.size} documents in test collection.`);
      
    } catch (error) {
      console.error('Firestore test failed:', error);
      setStatus('❌ Connection Failed');
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Simple Firestore Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>
        <button
          onClick={testFirestore}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Test Firestore Connection
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        </div>
      )}

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Open browser Developer Tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click "Test Firestore Connection"</li>
          <li>Watch console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleFirestoreTest;

