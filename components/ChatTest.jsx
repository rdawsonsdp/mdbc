'use client'

import React, { useState } from 'react';
import SecureChatInterface from './SecureChatInterface';

const ChatTest = () => {
  const [userData, setUserData] = useState({
    name: 'Test User',
    birthCard: 'Queen of Spades',
    age: 35,
    uid: 'test-user-123'
  });

  const [isChatReady, setIsChatReady] = useState(false);

  const handleLoadSession = (session) => {
    console.log('Session loaded:', session);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ChatGPT Book Context Test</h1>
      
      {/* User Data Setup */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test User Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Card
            </label>
            <select
              value={userData.birthCard}
              onChange={(e) => setUserData({...userData, birthCard: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Queen of Spades">Queen of Spades</option>
              <option value="King of Hearts">King of Hearts</option>
              <option value="Ace of Clubs">Ace of Clubs</option>
              <option value="Jack of Diamonds">Jack of Diamonds</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={userData.age}
              onChange={(e) => setUserData({...userData, age: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => setIsChatReady(true)}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Start Chat Test
        </button>
      </div>

      {/* Chat Interface */}
      {isChatReady && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">ChatGPT with Book Context</h2>
          <div className="h-96">
            <SecureChatInterface 
              userData={userData}
              onSessionSaved={handleLoadSession}
            />
          </div>
        </div>
      )}

      {/* Test Questions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Test Questions to Try:</h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>"What business strategies align with my birth card?"</li>
          <li>"How can I improve my business timing?"</li>
          <li>"What should I focus on for business growth?"</li>
          <li>"Tell me about business cycles and my birth card"</li>
          <li>"What are the key principles from your book?"</li>
        </ul>
        <p className="text-yellow-700 mt-2 text-sm">
          <strong>Note:</strong> If your book content is properly integrated, the AI should reference specific information from your uploaded book in its responses.
        </p>
      </div>
    </div>
  );
};

export default ChatTest;

