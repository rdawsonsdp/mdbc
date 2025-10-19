'use client'

import React, { useState } from 'react';
import { uploadBook } from '../utils/unifiedBookStorage';

const PDFBookUploader = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookDescription, setBookDescription] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setStatus('PDF file selected. Click "Extract Text" to process.');
    } else {
      setStatus('Please select a valid PDF file.');
    }
  };

  const extractTextFromPDF = async () => {
    if (!pdfFile) {
      setStatus('Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setStatus('Extracting text from PDF...');

    try {
      // For now, we'll use a simple approach
      // In production, you'd want to use a proper PDF parsing library
      setStatus('PDF text extraction requires a server-side solution. Please use the manual upload method below.');
      setExtractedText('PDF extraction not available in browser. Please copy and paste your book content manually.');
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      setStatus(`Error extracting text: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processExtractedText = (text) => {
    // Simple text processing to create chapters and sections
    const lines = text.split('\n').filter(line => line.trim());
    const chapters = [];
    let currentChapter = null;
    let currentSection = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detect chapter headers (simple heuristic)
      if (trimmedLine.match(/^Chapter\s+\d+/i) || 
          trimmedLine.match(/^Part\s+\d+/i) ||
          trimmedLine.match(/^Section\s+\d+/i) ||
          (trimmedLine.length < 100 && trimmedLine.length > 10 && index < lines.length * 0.3)) {
        
        // Save previous section if exists
        if (currentSection && currentChapter) {
          currentChapter.sections.push(currentSection);
        }
        
        // Start new chapter
        currentChapter = {
          chapterId: `ch${chapters.length + 1}`,
          title: trimmedLine,
          sections: []
        };
        chapters.push(currentChapter);
        currentSection = null;
      }
      // Detect section headers
      else if (trimmedLine.match(/^\d+\.\s/) || 
               trimmedLine.match(/^[A-Z][a-z]+:/) ||
               (trimmedLine.length < 80 && trimmedLine.length > 5 && !trimmedLine.includes('.'))) {
        
        // Save previous section if exists
        if (currentSection && currentChapter) {
          currentChapter.sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          sectionId: `ch${chapters.length}-s${currentChapter ? currentChapter.sections.length + 1 : 1}`,
          title: trimmedLine,
          content: '',
          cardTypes: ['all'],
          businessTopics: ['general']
        };
      }
      // Add content to current section
      else if (currentSection && trimmedLine.length > 10) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    });

    // Save the last section
    if (currentSection && currentChapter) {
      currentChapter.sections.push(currentSection);
    }

    return chapters;
  };

  const uploadProcessedBook = async () => {
    if (!extractedText.trim()) {
      setStatus('Please extract text from PDF first.');
      return;
    }

    if (!bookTitle.trim()) {
      setStatus('Please enter a book title.');
      return;
    }

    setIsProcessing(true);
    setStatus('Processing and uploading book...');

    try {
      const chapters = processExtractedText(extractedText);
      
      const bookData = {
        title: bookTitle,
        description: bookDescription,
        chapters: chapters
      };

      const bookId = await uploadBook(bookData);
      setStatus(`✅ Book uploaded successfully! ID: ${bookId}`);
      
    } catch (error) {
      console.error('Error uploading book:', error);
      setStatus(`❌ Error uploading book: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">PDF Book Uploader</h1>
      
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
        {/* PDF Upload */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">1. Upload PDF</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={extractTextFromPDF}
              disabled={!pdfFile || isProcessing}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Extract Text from PDF'}
            </button>
          </div>
        </div>

        {/* Manual Text Input */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">2. Manual Text Input</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Description
              </label>
              <textarea
                value={bookDescription}
                onChange={(e) => setBookDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter book description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Content (Copy from PDF)
              </label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={10}
                placeholder="Copy and paste your book content here..."
              />
            </div>

            <button
              onClick={uploadProcessedBook}
              disabled={!extractedText.trim() || !bookTitle.trim() || isProcessing}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isProcessing ? 'Uploading...' : 'Upload Book'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li><strong>Option 1:</strong> Upload PDF and extract text (requires server-side processing)</li>
          <li><strong>Option 2:</strong> Copy text from your PDF and paste it manually</li>
          <li>The system will automatically detect chapters and sections</li>
          <li>You can edit the structure after upload if needed</li>
          <li>Make sure to include your book title and description</li>
        </ol>
      </div>
    </div>
  );
};

export default PDFBookUploader;

