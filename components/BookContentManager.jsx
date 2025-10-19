'use client'

import React, { useState, useEffect } from 'react';
import { uploadBook, getAllBooks, getBook } from '../utils/unifiedBookStorage';

const BookContentManager = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    chapters: []
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const allBooks = await getAllBooks();
      setBooks(allBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const handleUploadBook = async () => {
    if (!newBook.title || newBook.chapters.length === 0) {
      setUploadStatus('Please provide a title and at least one chapter');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading book content...');

    try {
      const bookData = {
        bookId: `book-${Date.now()}`,
        title: newBook.title,
        description: newBook.description,
        chapters: newBook.chapters
      };

      const bookId = await uploadBookContent(bookData);
      setUploadStatus(`Book uploaded successfully! ID: ${bookId}`);
      
      // Reset form
      setNewBook({
        title: '',
        description: '',
        chapters: []
      });
      
      // Reload books
      await loadBooks();
      
    } catch (error) {
      console.error('Error uploading book:', error);
      setUploadStatus(`Error uploading book: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const addChapter = () => {
    setNewBook({
      ...newBook,
      chapters: [
        ...newBook.chapters,
        {
          chapterId: `ch${newBook.chapters.length + 1}`,
          title: '',
          sections: []
        }
      ]
    });
  };

  const addSection = (chapterIndex) => {
    const updatedChapters = [...newBook.chapters];
    const chapter = updatedChapters[chapterIndex];
    
    chapter.sections.push({
      sectionId: `ch${chapterIndex + 1}-s${chapter.sections.length + 1}`,
      title: '',
      content: '',
      cardTypes: ['all'],
      businessTopics: ['general']
    });
    
    setNewBook({ ...newBook, chapters: updatedChapters });
  };

  const updateChapter = (chapterIndex, field, value) => {
    const updatedChapters = [...newBook.chapters];
    updatedChapters[chapterIndex][field] = value;
    setNewBook({ ...newBook, chapters: updatedChapters });
  };

  const updateSection = (chapterIndex, sectionIndex, field, value) => {
    const updatedChapters = [...newBook.chapters];
    updatedChapters[chapterIndex].sections[sectionIndex][field] = value;
    setNewBook({ ...newBook, chapters: updatedChapters });
  };

  const loadBookContent = async (bookId) => {
    try {
      const bookContent = await getBookContent(bookId);
      setSelectedBook(bookContent);
    } catch (error) {
      console.error('Error loading book content:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Content Manager</h1>
      
      {/* Upload Status */}
      {uploadStatus && (
        <div className={`p-4 rounded-lg mb-6 ${
          uploadStatus.includes('Error') 
            ? 'bg-red-100 border border-red-400 text-red-700'
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {uploadStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Book Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Book</h2>
          
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
                placeholder="Enter book title"
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
                placeholder="Enter book description"
              />
            </div>

            {/* Chapters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chapters
                </label>
                <button
                  onClick={addChapter}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add Chapter
                </button>
              </div>

              {newBook.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapterIndex, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Chapter title"
                    />
                  </div>

                  {/* Sections */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Sections</span>
                      <button
                        onClick={() => addSection(chapterIndex)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Add Section
                      </button>
                    </div>

                    {chapter.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(chapterIndex, sectionIndex, 'title', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Section title"
                          />
                          
                          <textarea
                            value={section.content}
                            onChange={(e) => updateSection(chapterIndex, sectionIndex, 'content', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows={3}
                            placeholder="Section content"
                          />
                          
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={section.cardTypes.join(', ')}
                              onChange={(e) => updateSection(chapterIndex, sectionIndex, 'cardTypes', e.target.value.split(', '))}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Card types (e.g., all, Queen of Spades)"
                            />
                            
                            <input
                              type="text"
                              value={section.businessTopics.join(', ')}
                              onChange={(e) => updateSection(chapterIndex, sectionIndex, 'businessTopics', e.target.value.split(', '))}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Business topics"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleUploadBook}
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload Book'}
            </button>
          </div>
        </div>

        {/* Existing Books */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Books</h2>
          
          {books.length === 0 ? (
            <p className="text-gray-500">No books uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {books.map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.description}</p>
                      <p className="text-xs text-gray-500">
                        {book.metadata?.totalChapters} chapters, {book.metadata?.totalSections} sections
                      </p>
                    </div>
                    <button
                      onClick={() => loadBookContent(book.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Content Viewer */}
      {selectedBook && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedBook.title}</h2>
            <button
              onClick={() => setSelectedBook(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          
          <div className="space-y-4">
            {selectedBook.chapters.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{chapter.title}</h3>
                <div className="space-y-3">
                  {chapter.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium mb-2">{section.title}</h4>
                      <p className="text-sm text-gray-700 mb-2">{section.content}</p>
                      <div className="flex space-x-4 text-xs text-gray-500">
                        <span>Cards: {section.cardTypes.join(', ')}</span>
                        <span>Topics: {section.businessTopics.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookContentManager;
