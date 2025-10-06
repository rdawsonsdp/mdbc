// Book Content Storage and Retrieval System
// Manages proprietary book content for ChatGPT context injection

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

/**
 * Upload book content to Firestore
 * @param {Object} bookData - Book content data
 * @returns {Promise<string>} Book ID
 */
export async function uploadBookContent(bookData) {
  try {
    const bookId = bookData.bookId || `book-${Date.now()}`;
    
    // Validate book structure
    const validatedData = validateBookStructure(bookData);
    
    // Process and index content
    const processedData = await processBookContent(validatedData);
    
    // Store in Firestore
    await setDoc(doc(db, 'bookContent', bookId), {
      ...processedData,
      bookId,
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    console.log('Book content uploaded successfully:', bookId);
    return bookId;
    
  } catch (error) {
    console.error('Error uploading book content:', error);
    throw error;
  }
}

/**
 * Get book content by ID
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Book content
 */
export async function getBookContent(bookId) {
  try {
    const bookDoc = await getDoc(doc(db, 'bookContent', bookId));
    
    if (bookDoc.exists()) {
      return bookDoc.data();
    } else {
      throw new Error('Book not found');
    }
  } catch (error) {
    console.error('Error getting book content:', error);
    throw error;
  }
}

/**
 * Search book content based on query and user context
 * @param {string} userQuery - User's question
 * @param {Object} userData - User's profile data
 * @returns {Promise<Array>} Relevant book sections
 */
export async function searchBookContent(userQuery, userData) {
  try {
    // Extract keywords from user query
    const keywords = extractKeywords(userQuery);
    
    // Get user's birth card
    const birthCard = userData.birthCard;
    
    // Search for relevant content
    const relevantSections = await queryRelevantContent(keywords, birthCard);
    
    return relevantSections;
    
  } catch (error) {
    console.error('Error searching book content:', error);
    throw error;
  }
}

/**
 * Get all books
 * @returns {Promise<Array>} List of all books
 */
export async function getAllBooks() {
  try {
    const booksSnapshot = await getDocs(
      query(collection(db, 'bookContent'), orderBy('lastUpdated', 'desc'))
    );
    
    return booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error('Error getting all books:', error);
    throw error;
  }
}

/**
 * Validate book structure
 * @param {Object} bookData - Book data to validate
 * @returns {Object} Validated book data
 */
function validateBookStructure(bookData) {
  const requiredFields = ['title', 'chapters'];
  
  requiredFields.forEach(field => {
    if (!bookData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
  
  // Validate chapters structure
  if (!Array.isArray(bookData.chapters)) {
    throw new Error('Chapters must be an array');
  }
  
  bookData.chapters.forEach((chapter, index) => {
    if (!chapter.title || !chapter.sections) {
      throw new Error(`Chapter ${index} missing required fields`);
    }
    
    if (!Array.isArray(chapter.sections)) {
      throw new Error(`Chapter ${index} sections must be an array`);
    }
  });
  
  return bookData;
}

/**
 * Process book content for storage
 * @param {Object} bookData - Raw book data
 * @returns {Object} Processed book data
 */
async function processBookContent(bookData) {
  const processedData = { ...bookData };
  
  // Process each chapter and section
  processedData.chapters = bookData.chapters.map(chapter => ({
    ...chapter,
    sections: chapter.sections.map(section => ({
      ...section,
      // Extract keywords from content
      keywords: extractKeywords(section.content + ' ' + section.title),
      // Ensure cardTypes is an array
      cardTypes: Array.isArray(section.cardTypes) ? section.cardTypes : ['all'],
      // Ensure businessTopics is an array
      businessTopics: Array.isArray(section.businessTopics) ? section.businessTopics : ['general'],
      // Add word count
      wordCount: section.content.split(' ').length,
      // Add processing timestamp
      processedAt: new Date().toISOString()
    }))
  }));
  
  // Calculate total statistics
  processedData.metadata = {
    totalChapters: processedData.chapters.length,
    totalSections: processedData.chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0),
    totalWords: processedData.chapters.reduce((sum, chapter) => 
      sum + chapter.sections.reduce((sectionSum, section) => sectionSum + section.wordCount, 0), 0
    ),
    lastProcessed: new Date().toISOString()
  };
  
  return processedData;
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} Extracted keywords
 */
function extractKeywords(text) {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into words
  const words = cleanText.split(' ');
  
  // Filter out common stop words
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ];
  
  const keywords = words
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .filter((word, index, array) => array.indexOf(word) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 keywords
  
  return keywords;
}

/**
 * Query relevant content from Firestore
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @returns {Promise<Array>} Relevant content sections
 */
async function queryRelevantContent(keywords, birthCard) {
  try {
    // First, try to find content specific to the user's birth card
    const cardSpecificQuery = query(
      collection(db, 'bookContent'),
      where('chapters.sections.cardTypes', 'array-contains', birthCard)
    );
    
    const cardSpecificSnapshot = await getDocs(cardSpecificQuery);
    
    if (!cardSpecificSnapshot.empty) {
      return extractRelevantSections(cardSpecificSnapshot, keywords, birthCard);
    }
    
    // If no card-specific content, search for general content
    const generalQuery = query(
      collection(db, 'bookContent'),
      where('chapters.sections.cardTypes', 'array-contains', 'all')
    );
    
    const generalSnapshot = await getDocs(generalQuery);
    
    return extractRelevantSections(generalSnapshot, keywords, birthCard);
    
  } catch (error) {
    console.error('Error querying relevant content:', error);
    return [];
  }
}

/**
 * Extract relevant sections from query results
 * @param {QuerySnapshot} snapshot - Firestore query snapshot
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @returns {Array} Relevant sections
 */
function extractRelevantSections(snapshot, keywords, birthCard) {
  const relevantSections = [];
  
  snapshot.forEach(doc => {
    const bookData = doc.data();
    
    bookData.chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        // Check if section is relevant to user's birth card
        const isRelevantCard = section.cardTypes.includes(birthCard) || section.cardTypes.includes('all');
        
        // Check if section contains relevant keywords
        const hasRelevantKeywords = keywords.some(keyword => 
          section.keywords.includes(keyword) ||
          section.content.toLowerCase().includes(keyword) ||
          section.title.toLowerCase().includes(keyword)
        );
        
        if (isRelevantCard && hasRelevantKeywords) {
          relevantSections.push({
            bookId: bookData.bookId,
            bookTitle: bookData.title,
            chapterId: chapter.chapterId,
            chapterTitle: chapter.title,
            sectionId: section.sectionId,
            sectionTitle: section.title,
            content: section.content,
            keywords: section.keywords,
            businessTopics: section.businessTopics,
            relevanceScore: calculateRelevanceScore(section, keywords, birthCard)
          });
        }
      });
    });
  });
  
  // Sort by relevance score and return top 5
  return relevantSections
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

/**
 * Calculate relevance score for a section
 * @param {Object} section - Book section
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @returns {number} Relevance score
 */
function calculateRelevanceScore(section, keywords, birthCard) {
  let score = 0;
  
  // Score based on keyword matches
  keywords.forEach(keyword => {
    if (section.keywords.includes(keyword)) score += 3;
    if (section.content.toLowerCase().includes(keyword)) score += 2;
    if (section.title.toLowerCase().includes(keyword)) score += 4;
  });
  
  // Score based on birth card relevance
  if (section.cardTypes.includes(birthCard)) score += 5;
  if (section.cardTypes.includes('all')) score += 2;
  
  return score;
}
