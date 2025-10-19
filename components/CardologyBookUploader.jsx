'use client'

import React, { useState } from 'react';
import { uploadBook } from '../utils/unifiedBookStorage';

const CardologyBookUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [bookData, setBookData] = useState({
    title: 'Cardology Business Guide',
    description: 'Complete guide to cardology for business success',
    cards: []
  });

  const addCard = () => {
    setBookData({
      ...bookData,
      cards: [
        ...bookData.cards,
        {
          cardName: '',
          cardSymbol: '',
          highVibration: '',
          lowVibration: '',
          description: ''
        }
      ]
    });
  };

  const updateCard = (cardIndex, field, value) => {
    const updatedCards = [...bookData.cards];
    updatedCards[cardIndex][field] = value;
    setBookData({ ...bookData, cards: updatedCards });
  };

  const removeCard = (cardIndex) => {
    const updatedCards = bookData.cards.filter((_, index) => index !== cardIndex);
    setBookData({ ...bookData, cards: updatedCards });
  };

  const uploadCardologyBook = async () => {
    if (!bookData.title.trim()) {
      setStatus('Please enter a book title.');
      return;
    }

    if (bookData.cards.length === 0) {
      setStatus('Please add at least one card.');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading cardology book...');

    try {
      const bookId = await uploadBook(bookData);
      setStatus(`✅ Cardology book uploaded successfully! ID: ${bookId}`);
      
      // Reset form
      setBookData({
        title: 'Cardology Business Guide',
        description: 'Complete guide to cardology for business success',
        cards: []
      });
      
    } catch (error) {
      console.error('Error uploading cardology book:', error);
      setStatus(`❌ Error uploading book: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const parseCardData = () => {
    const cardText = `Card High
Vibration
A♥ Liberal beliefs with creative, out-of-the- box
thinking. Powerful feelings with a sensitive heart
and natural artistic abilities. Strong work ethic and
pursuit of making a mark for yourself. A pension for
soul-searching and introspection and wanting to find
another to reflect back to you what you are seeking
within.
A♣ Charm, wit and good taste, knowing what to say to
keep everything harmonious.
Willing to do what it takes to learn something new.
A fast, sharp mind that enjoys intelligent
individuals. Curious and always wanting to know, to
research, to discover.
A♦ Idealistic, spiritual, and compassionate, always
looking for the good in others. Highly creative
imagination and excels in the artistic fields. Creative
in ways to make money or begin some new financial
venture. Searching within oneself to create/build a
project/venture that expands the spiritual ideals and
explains the deep sensitivities you feel.
Low
Vibration
(Shadow)
With such a strong impetus for independence, yet
seeking to start new relationships, you can take risks in
love and/or only take from a relationship what you need
to feel fulfilled. There can be a lot of naivety and
immaturity when it comes to making decisions and can
lead to a life of making many mistakes, attempting to
learn by trial and error, creating hardships for yourself.
Head and heart act as one, creating one who is either
completely objective or completely romantic. So
focused on jumping to something new and exciting that
one never stays within a topic or relationship long
enough to create a stable, committed foundation.`;

    // Parse the card data
    const lines = cardText.split('\n').filter(line => line.trim());
    const cards = [];
    let currentCard = null;
    let currentSection = '';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^[A-Z][♠♥♦♣]/)) {
        // New card
        if (currentCard) {
          cards.push(currentCard);
        }
        currentCard = {
          cardName: trimmedLine,
          cardSymbol: trimmedLine,
          highVibration: '',
          lowVibration: '',
          description: ''
        };
        currentSection = 'high';
      } else if (trimmedLine === 'High' || trimmedLine === 'Vibration') {
        currentSection = 'high';
      } else if (trimmedLine === 'Low' || trimmedLine === 'Vibration' || trimmedLine === '(Shadow)') {
        currentSection = 'low';
      } else if (trimmedLine && currentCard) {
        if (currentSection === 'high') {
          currentCard.highVibration += (currentCard.highVibration ? '\n' : '') + trimmedLine;
        } else if (currentSection === 'low') {
          currentCard.lowVibration += (currentCard.lowVibration ? '\n' : '') + trimmedLine;
        }
      }
    });

    // Add the last card
    if (currentCard) {
      cards.push(currentCard);
    }

    setBookData({
      ...bookData,
      cards: cards
    });
    
    setStatus(`Parsed ${cards.length} cards from the sample data.`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cardology Book Uploader</h1>
      
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Book Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Book Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Title
              </label>
              <input
                type="text"
                value={bookData.title}
                onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="flex space-x-2">
              <button
                onClick={addCard}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Card
              </button>
              
              <button
                onClick={parseCardData}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Parse Sample Data
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Cards ({bookData.cards.length})</h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {bookData.cards.map((card, cardIndex) => (
              <div key={cardIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">Card {cardIndex + 1}</h3>
                  <button
                    onClick={() => removeCard(cardIndex)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Name/Symbol
                    </label>
                    <input
                      type="text"
                      value={card.cardName}
                      onChange={(e) => updateCard(cardIndex, 'cardName', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., A♥, K♠, Q♦"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      High Vibration
                    </label>
                    <textarea
                      value={card.highVibration}
                      onChange={(e) => updateCard(cardIndex, 'highVibration', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      placeholder="High vibration description..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Vibration (Shadow)
                    </label>
                    <textarea
                      value={card.lowVibration}
                      onChange={(e) => updateCard(cardIndex, 'lowVibration', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      placeholder="Low vibration description..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={uploadCardologyBook}
          disabled={isUploading || bookData.cards.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload Cardology Book'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Enter your book title and description</li>
          <li>Click "Parse Sample Data" to load the example card data</li>
          <li>Or manually add cards using "Add Card" button</li>
          <li>For each card, enter the card symbol (A♥, K♠, etc.)</li>
          <li>Add high vibration and low vibration descriptions</li>
          <li>Click "Upload Cardology Book" to save to Firestore</li>
        </ol>
      </div>
    </div>
  );
};

export default CardologyBookUploader;

