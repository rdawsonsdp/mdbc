'use client'

import React, { useState, useEffect } from 'react';
import { uploadBookContentDebug, testFirestoreConnection } from '../utils/bookStorageDebug';

const BookContentManagerDebug = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [firestoreStatus, setFirestoreStatus] = useState('Testing...');
  const [newBook, setNewBook] = useState({
    title: 'Test Book',
    description: 'A test book for debugging',
    chapters: [
      {
        chapterId: 'ch1',
        title: 'Test Chapter',
        sections: [
          {
            sectionId: 'ch1-s1',
            title: 'Test Section',
            content: 'This is a test section about business strategy and cardology principles.',
            cardTypes: ['all'],
            businessTopics: ['strategy', 'general']
          }
        ]
      }
    ]
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const isConnected = await testFirestoreConnection();
      setFirestoreStatus(isConnected ? '✅ Connected' : '❌ Connection Failed');
    } catch (error) {
      setFirestoreStatus('❌ Error: ' + error.message);
    }
  };

  const handleUploadBook = async () => {
    setIsUploading(true);
    setUploadStatus('Starting upload...');

    try {
      console.log('🚀 Starting book upload...');
      setUploadStatus('Uploading book content...');

      const bookId = await uploadBookContentDebug(newBook);
      
      setUploadStatus(`✅ Book uploaded successfully! ID: ${bookId}`);
      console.log('✅ Upload completed successfully');
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadStatus(`❌ Error uploading book: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestConnection = async () => {
    setFirestoreStatus('Testing...');
    await testConnection();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Upload Debug</h1>
      
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center space-x-4">
          <span className="text-lg">{firestoreStatus}</span>
          <button
            onClick={handleTestConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`p-4 rounded-lg mb-6 ${
          uploadStatus.includes('✅') 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : uploadStatus.includes('❌')
            ? 'bg-red-100 border border-red-400 text-red-700'
            : 'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          {uploadStatus}
        </div>
      )}

      {/* Test Book Data */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Book Data</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book Title
            </label>
            <input
              type="text"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Title
            </label>
            <input
              type="text"
              value={newBook.chapters[0].title}
              onChange={(e) => {
                const updatedChapters = [...newBook.chapters];
                updatedChapters[0].title = e.target.value;
                setNewBook({ ...newBook, chapters: updatedChapters });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={newBook.chapters[0].sections[0].title}
              onChange={(e) => {
                const updatedChapters = [...newBook.chapters];
                updatedChapters[0].sections[0].title = e.target.value;
                setNewBook({ ...newBook, chapters: updatedChapters });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Content
            </label>
            <textarea
              value={newBook.chapters[0].sections[0].content}
              onChange={(e) => {
                const updatedChapters = [...newBook.chapters];
                updatedChapters[0].sections[0].content = e.target.value;
                setNewBook({ ...newBook, chapters: updatedChapters });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={handleUploadBook}
          disabled={isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload Test Book'}
        </button>
      </div>

      {/* Debug Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Open browser Developer Tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click "Test Connection" to check Firestore</li>
          <li>Click "Upload Test Book" and watch console for detailed logs</li>
          <li>Check for any error messages in the console</li>
        </ol>
      </div>
    </div>
  );
};

export default BookContentManagerDebug;
