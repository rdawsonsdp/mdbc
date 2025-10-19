'use client'

import React, { useState } from 'react';
import { getAllBooks, getBook } from '../utils/unifiedBookStorage';

const BookDataDebug = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookContent, setBookContent] = useState(null);
  const [status, setStatus] = useState('');

  const loadAllBooks = async () => {
    try {
      setStatus('Loading books...');
      const allBooks = await getAllBooks();
      setBooks(allBooks);
      setStatus(`Found ${allBooks.length} books`);
      console.log('All books:', allBooks);
    } catch (error) {
      console.error('Error loading books:', error);
      setStatus(`Error loading books: ${error.message}`);
    }
  };

  const loadBookContent = async (bookId) => {
    try {
      setStatus(`Loading content for book: ${bookId}`);
      const content = await getBook(bookId);
      setBookContent(content);
      setStatus(`Loaded content for: ${content.title}`);
      console.log('Book content:', content);
    } catch (error) {
      console.error('Error loading book content:', error);
      setStatus(`Error loading book content: ${error.message}`);
    }
  };

  const testBookContext = async () => {
    try {
      setStatus('Testing book context loading...');
      const { getAllBooksForContext } = await import('../utils/unifiedBookStorage');
      
      const allBooks = await getAllBooksForContext();
      setStatus(`Context test completed. Found ${allBooks.length} books for ChatGPT context.`);
      console.log('Books for context:', allBooks);
    } catch (error) {
      console.error('Error testing book context:', error);
      setStatus(`Error testing context: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Data Debug</h1>
      
      {/* Status */}
      {status && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 p-4 rounded-lg mb-6">
          {status}
        </div>
      )}

      {/* Test Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
        <div className="space-y-4">
          <button
            onClick={loadAllBooks}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-4"
          >
            Load All Books
          </button>
          
          <button
            onClick={testBookContext}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Test Book Context
          </button>
        </div>
      </div>

      {/* Books List */}
      {books.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Books ({books.length})</h2>
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.description}</p>
                    <p className="text-xs text-gray-500">
                      {book.content?.length || 0} characters
                    </p>
                  </div>
                  <button
                    onClick={() => loadBookContent(book.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  >
                    View Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Content */}
      {bookContent && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Book Content: {bookContent.title}</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-sm text-gray-700 mb-4">{bookContent.description || 'No description'}</p>
              
              <h3 className="font-semibold text-lg mb-2">Content</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {bookContent.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Click "Load All Books" to see if any books are stored</li>
          <li>Click "Test Book Context" to see if books are loaded for ChatGPT</li>
          <li>Check browser console for detailed logs</li>
          <li>If no books found, go to /book-upload to upload your book</li>
        </ol>
      </div>
    </div>
  );
};

export default BookDataDebug;
