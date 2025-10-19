'use client'

import React, { useState } from 'react';
import { uploadBook } from '../utils/unifiedBookStorage';

const SimpleBookUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [bookData, setBookData] = useState({
    title: '',
    description: '',
    content: ''
  });

  const uploadBookData = async () => {
    if (!bookData.title.trim()) {
      setStatus('Please enter a book title.');
      return;
    }

    if (!bookData.content.trim()) {
      setStatus('Please enter book content.');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading book...');

    try {
      const bookId = await uploadBook(bookData);
      setStatus(`✅ Book uploaded successfully! ID: ${bookId}`);
      
      // Reset form
      setBookData({
        title: '',
        description: '',
        content: ''
      });
      
    } catch (error) {
      console.error('Error uploading book:', error);
      setStatus(`❌ Error uploading book: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleData = () => {
    setBookData({
      title: 'Cardology Business Guide',
      description: 'Complete guide to cardology for business success',
      content: `Card High Vibration

A♥ Liberal beliefs with creative, out-of-the- box thinking. Powerful feelings with a sensitive heart and natural artistic abilities. Strong work ethic and pursuit of making a mark for yourself. A pension for soul-searching and introspection and wanting to find another to reflect back to you what you are seeking within.

A♣ Charm, wit and good taste, knowing what to say to keep everything harmonious. Willing to do what it takes to learn something new. A fast, sharp mind that enjoys intelligent individuals. Curious and always wanting to know, to research, to discover.

A♦ Idealistic, spiritual, and compassionate, always looking for the good in others. Highly creative imagination and excels in the artistic fields. Creative in ways to make money or begin some new financial venture. Searching within oneself to create/build a project/venture that expands the spiritual ideals and explains the deep sensitivities you feel.

Low Vibration (Shadow)

With such a strong impetus for independence, yet seeking to start new relationships, you can take risks in love and/or only take from a relationship what you need to feel fulfilled. There can be a lot of naivety and immaturity when it comes to making decisions and can lead to a life of making many mistakes, attempting to learn by trial and error, creating hardships for yourself.

Head and heart act as one, creating one who is either completely objective or completely romantic. So focused on jumping to something new and exciting that one never stays within a topic or relationship long enough to create a stable, committed foundation.`
    });
    setStatus('Sample data loaded. You can edit it before uploading.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Uploader</h1>
      
      {/* Status */}
      {status && (
        <div className={`p-4 rounded-lg mb-6 ${
          status.includes('✅') 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : status.includes('❌')
            ? 'bg-red-100 border border-red-400 text-red-700'
            : 'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          {status}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          {/* Book Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              value={bookData.title}
              onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter book title"
            />
          </div>

          {/* Book Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Description
            </label>
            <textarea
              value={bookData.description}
              onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter book description"
            />
          </div>

          {/* Book Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Content *
            </label>
            <textarea
              value={bookData.content}
              onChange={(e) => setBookData({ ...bookData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={15}
              placeholder="Paste your book content here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={loadSampleData}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Load Sample Data
            </button>
            
            <button
              onClick={uploadBookData}
              disabled={isUploading || !bookData.title.trim() || !bookData.content.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload Book'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Enter your book title and description</li>
          <li>Paste your complete book content in the content field</li>
          <li>Click "Upload Book" to save to Firestore</li>
          <li>All uploaded books will be sent to ChatGPT as context</li>
          <li>Use "Load Sample Data" to see the format</li>
        </ol>
      </div>
    </div>
  );
};

export default SimpleBookUploader;

