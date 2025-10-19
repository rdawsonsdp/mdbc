'use client'

import React, { useState } from 'react';
import { uploadBook, getAllBooks } from '../utils/unifiedBookStorage';

const UnifiedBookUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [contentType, setContentType] = useState('simple');
  const [existingBooks, setExistingBooks] = useState([]);
  const [showBooks, setShowBooks] = useState(false);

  // Simple book data
  const [simpleData, setSimpleData] = useState({
    title: '',
    description: '',
    content: '',
    applicableCards: ['all']
  });

  // Cardology book data
  const [cardologyData, setCardologyData] = useState({
    title: 'Cardology Business Guide',
    description: 'Complete guide to cardology for business success',
    cards: []
  });

  // Structured book data
  const [structuredData, setStructuredData] = useState({
    title: '',
    description: '',
    chapters: []
  });

  const addCard = () => {
    setCardologyData({
      ...cardologyData,
      cards: [
        ...cardologyData.cards,
        {
          cardName: '',
          cardSymbol: '',
          description: '',
          highVibration: '',
          lowVibration: ''
        }
      ]
    });
  };

  const updateCard = (index, field, value) => {
    const updatedCards = [...cardologyData.cards];
    updatedCards[index][field] = value;
    setCardologyData({
      ...cardologyData,
      cards: updatedCards
    });
  };

  const removeCard = (index) => {
    const updatedCards = cardologyData.cards.filter((_, i) => i !== index);
    setCardologyData({
      ...cardologyData,
      cards: updatedCards
    });
  };

  const addChapter = () => {
    setStructuredData({
      ...structuredData,
      chapters: [
        ...structuredData.chapters,
        {
          title: '',
          content: '',
          sections: []
        }
      ]
    });
  };

  const updateChapter = (index, field, value) => {
    const updatedChapters = [...structuredData.chapters];
    updatedChapters[index][field] = value;
    setStructuredData({
      ...structuredData,
      chapters: updatedChapters
    });
  };

  const removeChapter = (index) => {
    const updatedChapters = structuredData.chapters.filter((_, i) => i !== index);
    setStructuredData({
      ...structuredData,
      chapters: updatedChapters
    });
  };

  const uploadBookContent = async () => {
    let bookData;
    
    switch (contentType) {
      case 'simple':
        if (!simpleData.title.trim() || !simpleData.content.trim()) {
          setStatus('Please enter title and content for simple book.');
          return;
        }
        bookData = simpleData;
        break;
        
      case 'cardology':
        if (!cardologyData.title.trim() || cardologyData.cards.length === 0) {
          setStatus('Please enter title and at least one card for cardology book.');
          return;
        }
        bookData = cardologyData;
        break;
        
      case 'structured':
        if (!structuredData.title.trim() || structuredData.chapters.length === 0) {
          setStatus('Please enter title and at least one chapter for structured book.');
          return;
        }
        bookData = structuredData;
        break;
        
      default:
        setStatus('Invalid content type selected.');
        return;
    }

    setIsUploading(true);
    setStatus(`Uploading ${contentType} book...`);

    try {
      const bookId = await uploadBook(bookData);
      setStatus(`✅ ${contentType} book uploaded successfully! ID: ${bookId}`);
      
      // Reset form based on content type
      switch (contentType) {
        case 'simple':
          setSimpleData({ title: '', description: '', content: '', applicableCards: ['all'] });
          break;
        case 'cardology':
          setCardologyData({ 
            title: 'Cardology Business Guide', 
            description: 'Complete guide to cardology for business success', 
            cards: [] 
          });
          break;
        case 'structured':
          setStructuredData({ title: '', description: '', chapters: [] });
          break;
      }
      
    } catch (error) {
      console.error('Error uploading book:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const loadExistingBooks = async () => {
    try {
      setStatus('Loading existing books...');
      const books = await getAllBooks({ includeContent: false });
      setExistingBooks(books);
      setShowBooks(true);
      setStatus(`Found ${books.length} existing books`);
    } catch (error) {
      console.error('Error loading books:', error);
      setStatus(`❌ Error loading books: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📚 Unified Book Uploader</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">✨ New Unified System Features:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Support for Simple, Cardology, and Structured content</li>
          <li>• Intelligent keyword extraction and relevance scoring</li>
          <li>• Optimized ChatGPT context injection</li>
          <li>• Unified storage with flexible schema</li>
          <li>• Birth card specific content filtering</li>
        </ul>
      </div>

      {/* Content Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="simple">Simple Book (Title + Content)</option>
          <option value="cardology">Cardology Book (Cards with High/Low Vibrations)</option>
          <option value="structured">Structured Book (Chapters + Sections)</option>
        </select>
      </div>

      {/* Simple Book Form */}
      {contentType === 'simple' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
            <input
              type="text"
              value={simpleData.title}
              onChange={(e) => setSimpleData({ ...simpleData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter book title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <input
              type="text"
              value={simpleData.description}
              onChange={(e) => setSimpleData({ ...simpleData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the book"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book Content</label>
            <textarea
              value={simpleData.content}
              onChange={(e) => setSimpleData({ ...simpleData, content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="10"
              placeholder="Enter the complete book content here..."
            />
          </div>
        </div>
      )}

      {/* Cardology Book Form */}
      {contentType === 'cardology' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
            <input
              type="text"
              value={cardologyData.title}
              onChange={(e) => setCardologyData({ ...cardologyData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={cardologyData.description}
              onChange={(e) => setCardologyData({ ...cardologyData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Cards</label>
              <button
                onClick={addCard}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                + Add Card
              </button>
            </div>
            
            {cardologyData.cards.map((card, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Card {index + 1}</h4>
                  <button
                    onClick={() => removeCard(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={card.cardName}
                    onChange={(e) => updateCard(index, 'cardName', e.target.value)}
                    placeholder="Card Name (e.g., Ace of Spades)"
                    className="p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={card.cardSymbol}
                    onChange={(e) => updateCard(index, 'cardSymbol', e.target.value)}
                    placeholder="Card Symbol (e.g., AS)"
                    className="p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <textarea
                  value={card.description}
                  onChange={(e) => updateCard(index, 'description', e.target.value)}
                  placeholder="Card description..."
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  rows="2"
                />
                
                <textarea
                  value={card.highVibration}
                  onChange={(e) => updateCard(index, 'highVibration', e.target.value)}
                  placeholder="High vibration characteristics..."
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  rows="3"
                />
                
                <textarea
                  value={card.lowVibration}
                  onChange={(e) => updateCard(index, 'lowVibration', e.target.value)}
                  placeholder="Low vibration characteristics..."
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  rows="3"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Book Form */}
      {contentType === 'structured' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
            <input
              type="text"
              value={structuredData.title}
              onChange={(e) => setStructuredData({ ...structuredData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter book title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={structuredData.description}
              onChange={(e) => setStructuredData({ ...structuredData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the book"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Chapters</label>
              <button
                onClick={addChapter}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                + Add Chapter
              </button>
            </div>
            
            {structuredData.chapters.map((chapter, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Chapter {index + 1}</h4>
                  <button
                    onClick={() => removeChapter(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => updateChapter(index, 'title', e.target.value)}
                  placeholder="Chapter title"
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
                
                <textarea
                  value={chapter.content}
                  onChange={(e) => updateChapter(index, 'content', e.target.value)}
                  placeholder="Chapter content..."
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="6"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={uploadBookContent}
          disabled={isUploading}
          className={`flex-1 py-3 px-6 rounded-lg font-medium ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isUploading ? 'Uploading...' : `Upload ${contentType} Book`}
        </button>
        
        <button
          onClick={loadExistingBooks}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          View Books
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`p-4 rounded-lg mb-4 ${
          status.includes('✅') ? 'bg-green-50 text-green-800' :
          status.includes('❌') ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      {/* Existing Books */}
      {showBooks && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Existing Books ({existingBooks.length})</h3>
          <div className="space-y-3">
            {existingBooks.map((book) => (
              <div key={book.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.description}</p>
                    <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                      <span>Type: {book.contentType || 'unknown'}</span>
                      <span>ID: {book.bookId}</span>
                      {book.metadata && (
                        <span>Words: {book.metadata.totalWords || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {book.lastUpdated ? new Date(book.lastUpdated.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedBookUploader;