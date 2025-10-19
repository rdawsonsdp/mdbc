'use client';

import { useState } from 'react';

export default function EnhancedChatTest() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [appType, setAppType] = useState('mdbc');
  const [userData, setUserData] = useState({
    name: 'Test User',
    birthCard: 'King of Hearts',
    yearlyCard: 'Queen of Spades',
    age: 30,
    planetaryCards: {
      mercury: 'Jack of Clubs',
      venus: 'Ace of Hearts',
      mars: 'King of Spades'
    }
  });
  const [cardInfo, setCardInfo] = useState({
    cardName: '',
    suit: '',
    position: '',
    verified: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userData,
          appType,
          cardInfo: cardInfo.cardName ? cardInfo : null
        }),
      });

      const data = await response.json();
      
      if (data.needsCardVerification) {
        setResponse(data.response);
        setCardInfo(prev => ({ ...prev, verified: false }));
      } else {
        setResponse(data.response);
        setCardInfo(prev => ({ ...prev, verified: true }));
      }
    } catch (error) {
      setResponse('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardVerification = () => {
    setCardInfo(prev => ({ ...prev, verified: true }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Enhanced Chat Test - App-Specific Tones</h1>
      
      {/* App Type Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">App Type Selection</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setAppType('mdbc')}
            className={`p-4 rounded-lg border-2 ${
              appType === 'mdbc' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold">Million Dollar Birth Card</h3>
            <p className="text-sm text-gray-600">Business strategy & entrepreneurship</p>
          </button>
          <button
            onClick={() => setAppType('lcc')}
            className={`p-4 rounded-lg border-2 ${
              appType === 'lcc' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold">Love Cheat Code</h3>
            <p className="text-sm text-gray-600">Dating & relationships</p>
          </button>
          <button
            onClick={() => setAppType('dyk')}
            className={`p-4 rounded-lg border-2 ${
              appType === 'dyk' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold">Decode Your Kid</h3>
            <p className="text-sm text-gray-600">Parenting & child development</p>
          </button>
        </div>
      </div>

      {/* User Data Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Data Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              value={userData.age}
              onChange={(e) => setUserData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Birth Card</label>
            <input
              type="text"
              value={userData.birthCard}
              onChange={(e) => setUserData(prev => ({ ...prev, birthCard: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Yearly Card</label>
            <input
              type="text"
              value={userData.yearlyCard}
              onChange={(e) => setUserData(prev => ({ ...prev, yearlyCard: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Card Verification */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Card Verification (Optional)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Card Name</label>
            <input
              type="text"
              value={cardInfo.cardName}
              onChange={(e) => setCardInfo(prev => ({ ...prev, cardName: e.target.value }))}
              placeholder="e.g., Jack"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Suit</label>
            <select
              value={cardInfo.suit}
              onChange={(e) => setCardInfo(prev => ({ ...prev, suit: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Suit</option>
              <option value="Hearts">Hearts</option>
              <option value="Clubs">Clubs</option>
              <option value="Diamonds">Diamonds</option>
              <option value="Spades">Spades</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Position</label>
            <select
              value={cardInfo.position}
              onChange={(e) => setCardInfo(prev => ({ ...prev, position: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Position</option>
              <option value="birth">Birth Card</option>
              <option value="yearly">Yearly Forecast</option>
              <option value="planetary_mercury">Mercury Period</option>
              <option value="planetary_venus">Venus Period</option>
              <option value="planetary_mars">Mars Period</option>
              <option value="planetary_jupiter">Jupiter Period</option>
              <option value="planetary_saturn">Saturn Period</option>
              <option value="planetary_uranus">Uranus Period</option>
              <option value="planetary_neptune">Neptune Period</option>
              <option value="planetary_pluto">Pluto Period</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Chat Interface</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Question</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask a question about ${appType === 'mdbc' ? 'business strategy' : appType === 'lcc' ? 'relationships' : 'parenting'}...`}
              className="w-full p-3 border rounded-lg h-24"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Response Display */}
      {response && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">AI Response</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{response}</pre>
          </div>
          {response.includes('confirm') && !cardInfo.verified && (
            <button
              onClick={handleCardVerification}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Confirm Card Information
            </button>
          )}
        </div>
      )}

      {/* App-Specific Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">App-Specific Example Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-blue-600">MDBC Examples</h3>
            <ul className="text-sm space-y-1 mt-2">
              <li>• "What business opportunities align with my birth card?"</li>
              <li>• "How can I improve my business timing?"</li>
              <li>• "What should I focus on for growth?"</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-pink-600">LCC Examples</h3>
            <ul className="text-sm space-y-1 mt-2">
              <li>• "What are my dating patterns?"</li>
              <li>• "How can I find compatible partners?"</li>
              <li>• "What are my love languages?"</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-green-600">DYK Examples</h3>
            <ul className="text-sm space-y-1 mt-2">
              <li>• "How can I understand my child's behavior?"</li>
              <li>• "What does my child need emotionally?"</li>
              <li>• "How can I support their development?"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

