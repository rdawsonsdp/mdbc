// Server-side Unified Book Storage System
// For use in API routes with Firebase Admin SDK

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    // For development, we'll use the service account key
    // In production, this should be set via environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "cardology-1558b",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    // Initialize with service account if available
    if (serviceAccount.private_key && serviceAccount.client_email) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Fallback to default credentials (for production with proper IAM)
      initializeApp({
        projectId: serviceAccount.project_id
      });
      console.log('Firebase Admin initialized with default credentials');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Continue without admin SDK - will use basic prompts
  }
}

const db = getFirestore();

// ============================================================================
// SERVER-SIDE BOOK OPERATIONS
// ============================================================================

/**
 * Get all books for ChatGPT context (server-side)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} All books with their content
 */
export async function getAllBooksForContext(options = {}) {
  try {
    const { limit: queryLimit = 10, orderBy: orderField = 'lastUpdated' } = options;
    
    const booksSnapshot = await db.collection('books')
      .orderBy(orderField, 'desc')
      .limit(queryLimit)
      .get();
    
    if (booksSnapshot.empty) {
      console.log('No books found in database');
      return [];
    }
    
    const books = booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Retrieved ${books.length} books for ChatGPT context`);
    return books;
    
  } catch (error) {
    console.error('Error getting all books for context:', error);
    return []; // Return empty array instead of throwing to allow basic prompts
  }
}

/**
 * Search book content for ChatGPT context (server-side)
 * @param {string} userQuery - User's question
 * @param {Object} userData - User's profile data
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Relevant book sections
 */
export async function searchBooksForContext(userQuery, userData, options = {}) {
  try {
    const { maxResults = 5, minRelevanceScore = 1 } = options;
    
    // Extract keywords from user query
    const keywords = extractKeywords(userQuery);
    
    // Get user context
    const birthCard = userData.birthCard;
    const age = userData.age;
    
    // Get all books
    const allBooksSnapshot = await db.collection('books')
      .orderBy('lastUpdated', 'desc')
      .get();
    
    if (allBooksSnapshot.empty) {
      console.log('No books found for content search');
      return [];
    }
    
    const relevantSections = [];
    
    allBooksSnapshot.forEach(doc => {
      const bookData = { id: doc.id, ...doc.data() };
      const sections = extractRelevantSections(bookData, keywords, birthCard, age);
      relevantSections.push(...sections);
    });
    
    // Sort by relevance score and filter
    const filteredResults = relevantSections
      .filter(section => section.relevanceScore >= minRelevanceScore)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    
    console.log(`Found ${filteredResults.length} relevant sections for query`);
    return filteredResults;
    
  } catch (error) {
    console.error('Error searching books for context:', error);
    return [];
  }
}

/**
 * Get book by ID (server-side)
 * @param {string} bookId - Book ID
 * @returns {Promise<Object|null>} Book data or null if not found
 */
export async function getBook(bookId) {
  try {
    const bookDoc = await db.collection('books').doc(bookId).get();
    
    if (bookDoc.exists) {
      return { id: bookDoc.id, ...bookDoc.data() };
    } else {
      console.log(`Book not found: ${bookId}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting book:', error);
    return null;
  }
}

/**
 * Upload book content (server-side)
 * @param {Object} bookData - Book content data
 * @returns {Promise<string|null>} Book ID or null if failed
 */
export async function uploadBook(bookData) {
  try {
    const bookId = bookData.bookId || `book-${Date.now()}`;
    
    // Validate and process book structure
    const validatedData = validateBookStructure(bookData);
    const processedData = await processBookContent(validatedData);
    
    // Store in Firestore using Admin SDK
    await db.collection('books').doc(bookId).set({
      ...processedData,
      bookId,
      lastUpdated: new Date(),
      createdAt: new Date(),
      version: '1.0.0'
    });
    
    console.log('Book uploaded successfully:', bookId);
    return bookId;
    
  } catch (error) {
    console.error('Error uploading book:', error);
    return null;
  }
}

// ============================================================================
// CONTENT PROCESSING FUNCTIONS (Shared with client-side)
// ============================================================================

/**
 * Extract relevant sections from a book based on search criteria
 * @param {Object} bookData - Book data
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @param {number} age - User's age
 * @returns {Array} Relevant sections
 */
function extractRelevantSections(bookData, keywords = [], birthCard, age) {
  const sections = [];
  
  if (bookData.contentType === 'cardology' && bookData.cards) {
    // Extract from cardology content
    bookData.cards.forEach(card => {
      const relevanceScore = calculateCardRelevanceScore(card, keywords, birthCard);
      if (relevanceScore > 0) {
        sections.push({
          bookId: bookData.bookId,
          bookTitle: bookData.title,
          contentType: 'card',
          cardName: card.cardName,
          cardSymbol: card.cardSymbol,
          content: formatCardContent(card),
          keywords: card.keywords,
          relevanceScore
        });
      }
    });
  } else if (bookData.contentType === 'structured' && bookData.chapters) {
    // Extract from structured content
    bookData.chapters.forEach(chapter => {
      if (chapter.sections) {
        chapter.sections.forEach(section => {
          const relevanceScore = calculateSectionRelevanceScore(section, keywords, birthCard);
          if (relevanceScore > 0) {
            sections.push({
              bookId: bookData.bookId,
              bookTitle: bookData.title,
              contentType: 'section',
              chapterTitle: chapter.title,
              sectionTitle: section.title,
              content: section.content,
              keywords: section.keywords,
              relevanceScore
            });
          }
        });
      } else {
        const relevanceScore = calculateSectionRelevanceScore(chapter, keywords, birthCard);
        if (relevanceScore > 0) {
          sections.push({
            bookId: bookData.bookId,
            bookTitle: bookData.title,
            contentType: 'chapter',
            chapterTitle: chapter.title,
            content: chapter.content,
            keywords: chapter.keywords,
            relevanceScore
          });
        }
      }
    });
  } else if (bookData.contentType === 'simple') {
    // Extract from simple content
    const relevanceScore = calculateSimpleContentRelevanceScore(bookData, keywords, birthCard);
    if (relevanceScore > 0) {
      sections.push({
        bookId: bookData.bookId,
        bookTitle: bookData.title,
        contentType: 'simple',
        content: bookData.content,
        keywords: bookData.keywords,
        relevanceScore
      });
    }
  }
  
  return sections;
}

/**
 * Calculate relevance score for cardology content
 * @param {Object} card - Card data
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @returns {number} Relevance score
 */
function calculateCardRelevanceScore(card, keywords, birthCard) {
  let score = 0;
  
  // Keyword matching
  keywords.forEach(keyword => {
    if (card.keywords?.includes(keyword)) score += 3;
    if (card.highVibration?.toLowerCase().includes(keyword)) score += 2;
    if (card.lowVibration?.toLowerCase().includes(keyword)) score += 2;
    if (card.description?.toLowerCase().includes(keyword)) score += 2;
  });
  
  // Birth card relevance
  if (card.cardSymbol === birthCard) score += 15;
  if (card.cardTypes?.includes(birthCard)) score += 10;
  if (card.cardTypes?.includes('all')) score += 3;
  
  return score;
}

/**
 * Calculate relevance score for structured content sections
 * @param {Object} section - Section data
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @returns {number} Relevance score
 */
function calculateSectionRelevanceScore(section, keywords, birthCard) {
  let score = 0;
  
  // Keyword matching
  keywords.forEach(keyword => {
    if (section.keywords?.includes(keyword)) score += 3;
    if (section.title?.toLowerCase().includes(keyword)) score += 2;
    if (section.content?.toLowerCase().includes(keyword)) score += 1;
  });
  
  // Birth card relevance (if section has card-specific data)
  if (section.cardTypes?.includes(birthCard)) score += 10;
  if (section.cardTypes?.includes('all')) score += 3;
  
  return score;
}

/**
 * Calculate relevance score for simple content
 * @param {Object} bookData - Book data
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @returns {number} Relevance score
 */
function calculateSimpleContentRelevanceScore(bookData, keywords, birthCard) {
  let score = 0;
  
  // Keyword matching
  keywords.forEach(keyword => {
    if (bookData.keywords?.includes(keyword)) score += 3;
    if (bookData.title?.toLowerCase().includes(keyword)) score += 2;
    if (bookData.content?.toLowerCase().includes(keyword)) score += 1;
  });
  
  // Birth card relevance
  if (bookData.applicableCards?.includes(birthCard)) score += 10;
  if (bookData.applicableCards?.includes('all')) score += 3;
  
  return score;
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} Extracted keywords
 */
function extractKeywords(text) {
  if (!text) return [];
  
  // Clean and normalize text
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanText.split(' ');
  
  // Enhanced stop words list
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'you', 'your', 'i', 'my', 'me', 'we', 'our', 'us', 'he', 'his', 'him', 'she', 'her', 'it', 'its',
    'they', 'their', 'them', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'if', 'then'
  ]);
  
  const keywords = words
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, index, array) => array.indexOf(word) === index) // Remove duplicates
    .slice(0, 20); // Increased limit for better matching
  
  return keywords;
}

/**
 * Validate book structure and ensure required fields
 * @param {Object} bookData - Raw book data
 * @returns {Object} Validated book data
 */
function validateBookStructure(bookData) {
  const requiredFields = ['title'];
  
  requiredFields.forEach(field => {
    if (!bookData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
  
  // Ensure we have some content
  if (!bookData.content && !bookData.chapters && !bookData.cards) {
    throw new Error('Book must have content, chapters, or cards');
  }
  
  return bookData;
}

/**
 * Process book content for optimal storage and retrieval
 * @param {Object} bookData - Validated book data
 * @returns {Object} Processed book data
 */
async function processBookContent(bookData) {
  const processedData = { ...bookData };
  
  // Determine content type and structure
  if (bookData.cards) {
    processedData.contentType = 'cardology';
    processedData.applicableCards = extractApplicableCards(bookData.cards);
  } else if (bookData.chapters) {
    processedData.contentType = 'structured';
    processedData.applicableCards = bookData.applicableCards || ['all'];
  } else {
    processedData.contentType = 'simple';
    processedData.applicableCards = bookData.applicableCards || ['all'];
  }
  
  // Extract global keywords
  processedData.keywords = extractGlobalKeywords(processedData);
  
  // Add processing timestamp
  processedData.processedAt = new Date().toISOString();
  
  return processedData;
}

/**
 * Extract applicable cards from cardology content
 * @param {Array} cards - Array of card data
 * @returns {Array<string>} List of applicable cards
 */
function extractApplicableCards(cards) {
  const cardSymbols = cards
    .map(card => card.cardSymbol)
    .filter(Boolean)
    .filter((symbol, index, array) => array.indexOf(symbol) === index);
  
  return [...cardSymbols, 'all'];
}

/**
 * Extract global keywords from processed book data
 * @param {Object} bookData - Processed book data
 * @returns {Array<string>} Global keywords
 */
function extractGlobalKeywords(bookData) {
  let allText = bookData.title + ' ' + (bookData.description || '');
  
  if (bookData.contentType === 'cardology' && bookData.cards) {
    allText += ' ' + bookData.cards.map(card => 
      `${card.cardName || ''} ${card.cardSymbol || ''} ${card.description || ''}`
    ).join(' ');
  } else if (bookData.contentType === 'structured' && bookData.chapters) {
    allText += ' ' + bookData.chapters.map(chapter => 
      `${chapter.title || ''} ${chapter.content || ''}`
    ).join(' ');
  } else if (bookData.contentType === 'simple') {
    allText += ' ' + (bookData.content || '');
  }
  
  return extractKeywords(allText);
}

/**
 * Format card content for display
 * @param {Object} card - Card data
 * @returns {string} Formatted content
 */
function formatCardContent(card) {
  let content = '';
  
  if (card.cardName) content += `**${card.cardName}**\n`;
  if (card.description) content += `${card.description}\n\n`;
  if (card.highVibration) content += `High Vibration: ${card.highVibration}\n`;
  if (card.lowVibration) content += `Low Vibration: ${card.lowVibration}\n`;
  if (card.content) content += `\n${card.content}`;
  
  return content.trim();
}