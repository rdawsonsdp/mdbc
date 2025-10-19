'use client'

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebaseClient';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const FirestoreTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🔍 Testing Firestore connection...');
      console.log('📊 Firestore instance:', db);
      
      setConnectionStatus('Testing connection...');
      
      // Try to read from a test collection
      const testCollection = collection(db, 'test');
      console.log('📁 Test collection reference:', testCollection);
      
      const snapshot = await getDocs(testCollection);
      console.log('✅ Firestore read successful:', snapshot);
      
      setConnectionStatus('✅ Connected to Firestore');
      setTestResult('Successfully connected to Firestore!');
      
    } catch (error) {
      console.error('❌ Firestore connection failed:', error);
      setConnectionStatus('❌ Connection Failed');
      setTestResult(`Error: ${error.message}`);
    }
  };

  const testWrite = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Testing Firestore write...');
      
      const testCollection = collection(db, 'test');
      const docData = {
        message: 'Test document',
        timestamp: serverTimestamp(),
        testId: Date.now()
      };
      
      console.log('📝 Writing test document:', docData);
      const docRef = await addDoc(testCollection, docData);
      console.log('✅ Write successful:', docRef);
      
      setTestResult(`Write successful! Document ID: ${docRef.id}`);
      
    } catch (error) {
      console.error('❌ Firestore write failed:', error);
      setTestResult(`Write error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBookCollection = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Testing bookContent collection...');
      
      const bookCollection = collection(db, 'bookContent');
      const snapshot = await getDocs(bookCollection);
      console.log('✅ Book collection read successful:', snapshot);
      
      setTestResult(`Book collection accessible! Found ${snapshot.size} documents.`);
      
    } catch (error) {
      console.error('❌ Book collection access failed:', error);
      setTestResult(`Book collection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Firestore Connection Test</h1>
      
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center space-x-4">
          <span className="text-lg">{connectionStatus}</span>
          <button
            onClick={testConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        </div>
      )}

      {/* Test Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Operations</h2>
        <div className="space-y-4">
          <button
            onClick={testWrite}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded"
          >
            {isLoading ? 'Testing...' : 'Test Write Operation'}
          </button>
          
          <button
            onClick={testBookCollection}
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 px-4 rounded"
          >
            {isLoading ? 'Testing...' : 'Test Book Collection Access'}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Open browser Developer Tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click "Test Connection" and watch console logs</li>
          <li>Try the test operations and check for errors</li>
          <li>Look for any Firebase/Firestore error messages</li>
        </ol>
      </div>
    </div>
  );
};

export default FirestoreTest;

