// Unified Book Storage System
// Combines best features from all storage approaches into a single, comprehensive system

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

// ============================================================================
// CORE BOOK OPERATIONS
// ============================================================================

/**
 * Upload book content to Firestore with unified structure
 * Supports both simple and structured content formats
 * @param {Object} bookData - Book content data
 * @returns {Promise<string>} Book ID
 */
export async function uploadBook(bookData) {
  try {
    const bookId = bookData.bookId || `book-${Date.now()}`;
    
    // Validate and process book structure
    const validatedData = validateBookStructure(bookData);
    const processedData = await processBookContent(validatedData);
    
    // Store in unified Firestore collection
    await setDoc(doc(db, 'books', bookId), {
      ...processedData,
      bookId,
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp(),
      version: '1.0.0'
    });
    
    console.log('Book uploaded successfully:', bookId);
    return bookId;
    
  } catch (error) {
    console.error('Error uploading book:', error);
    throw error;
  }
}

/**
 * Get book content by ID
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Book content
 */
export async function getBook(bookId) {
  try {
    const bookDoc = await getDoc(doc(db, 'books', bookId));
    
    if (bookDoc.exists()) {
      return bookDoc.data();
    } else {
      throw new Error('Book not found');
    }
  } catch (error) {
    console.error('Error getting book:', error);
    throw error;
  }
}

/**
 * Get all books for ChatGPT context
 * @param {Object} options - Query options
 * @returns {Promise<Array>} All books with their content
 */
export async function getAllBooksForContext(options = {}) {
  try {
    const { limit: queryLimit = 10, orderBy: orderField = 'lastUpdated' } = options;
    
    const booksSnapshot = await getDocs(
      query(
        collection(db, 'books'), 
        orderBy(orderField, 'desc'),
        limit(queryLimit)
      )
    );
    
    const books = booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Retrieved ${books.length} books for ChatGPT context`);
    return books;
    
  } catch (error) {
    console.error('Error getting all books for context:', error);
    throw error;
  }
}

// ============================================================================
// INTELLIGENT CONTENT SEARCH
// ============================================================================

/**
 * Search book content based on user query and context
 * Uses advanced keyword matching and relevance scoring
 * @param {string} userQuery - User's question
 * @param {Object} userData - User's profile data
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Relevant book sections
 */
export async function searchBookContent(userQuery, userData, options = {}) {
  try {
    const { maxResults = 5, minRelevanceScore = 1 } = options;
    
    // Extract keywords from user query
    const keywords = extractKeywords(userQuery);
    
    // Get user context
    const birthCard = userData.birthCard;
    const age = userData.age;
    
    // Search for relevant content
    const relevantSections = await queryRelevantContent(keywords, birthCard, age);
    
    // Filter by relevance score and limit results
    return relevantSections
      .filter(section => section.relevanceScore >= minRelevanceScore)
      .slice(0, maxResults);
    
  } catch (error) {
    console.error('Error searching book content:', error);
    throw error;
  }
}

/**
 * Get book content optimized for specific birth card
 * @param {string} birthCard - User's birth card
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Card-specific content
 */
export async function getContentForBirthCard(birthCard, options = {}) {
  try {
    const { includeGeneral = true, maxResults = 10 } = options;
    
    // Query for card-specific content
    const cardSpecificQuery = query(
      collection(db, 'books'),
      where('applicableCards', 'array-contains', birthCard),
      orderBy('lastUpdated', 'desc'),
      limit(maxResults)
    );
    
    let results = [];
    const cardSpecificSnapshot = await getDocs(cardSpecificQuery);
    
    // Extract card-specific sections
    cardSpecificSnapshot.forEach(doc => {
      const bookData = doc.data();
      const relevantSections = extractRelevantSections(bookData, [], birthCard);
      results.push(...relevantSections);
    });
    
    // If no card-specific content found and includeGeneral is true, get general content
    if (results.length === 0 && includeGeneral) {
      const generalQuery = query(
        collection(db, 'books'),
        where('applicableCards', 'array-contains', 'all'),
        orderBy('lastUpdated', 'desc'),
        limit(maxResults)
      );
      
      const generalSnapshot = await getDocs(generalQuery);
      generalSnapshot.forEach(doc => {
        const bookData = doc.data();
        const relevantSections = extractRelevantSections(bookData, [], birthCard);
        results.push(...relevantSections);
      });
    }
    
    return results.slice(0, maxResults);
    
  } catch (error) {
    console.error('Error getting content for birth card:', error);
    throw error;
  }
}

// ============================================================================
// CONTENT PROCESSING AND VALIDATION
// ============================================================================

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
    // Cardology book format
    processedData.contentType = 'cardology';
    processedData.cards = processCardologyContent(bookData.cards);
    processedData.applicableCards = extractApplicableCards(bookData.cards);
  } else if (bookData.chapters) {
    // Structured book format
    processedData.contentType = 'structured';
    processedData.chapters = processStructuredContent(bookData.chapters);
    processedData.applicableCards = bookData.applicableCards || ['all'];
  } else {
    // Simple content format
    processedData.contentType = 'simple';
    processedData.applicableCards = bookData.applicableCards || ['all'];
  }
  
  // Extract global keywords
  processedData.keywords = extractGlobalKeywords(processedData);
  
  // Calculate metadata
  processedData.metadata = calculateContentMetadata(processedData);
  
  // Add processing timestamp
  processedData.processedAt = new Date().toISOString();
  
  console.log('Book content processing completed:', processedData.metadata);
  return processedData;
}

/**
 * Process cardology-specific content
 * @param {Array} cards - Array of card data
 * @returns {Array} Processed cards
 */
function processCardologyContent(cards) {
  return cards.map((card, index) => {
    console.log(`Processing card ${index}:`, card.cardName || card.title);
    
    return {
      ...card,
      keywords: extractKeywords(
        `${card.cardName || card.title || ''} ${card.cardSymbol || ''} 
         ${card.highVibration || ''} ${card.lowVibration || ''} 
         ${card.description || ''} ${card.content || ''}`
      ),
      cardTypes: [card.cardSymbol, 'all'].filter(Boolean),
      businessTopics: card.businessTopics || ['cardology', 'business-strategy'],
      wordCount: calculateWordCount(card),
      processedAt: new Date().toISOString()
    };
  });
}

/**
 * Process structured book content (chapters/sections)
 * @param {Array} chapters - Array of chapter data
 * @returns {Array} Processed chapters
 */
function processStructuredContent(chapters) {
  return chapters.map((chapter, chapterIndex) => {
    const processedChapter = {
      ...chapter,
      chapterId: chapter.chapterId || `ch${chapterIndex + 1}`,
      keywords: extractKeywords(chapter.title + ' ' + (chapter.content || '')),
      wordCount: calculateWordCount(chapter)
    };
    
    if (chapter.sections) {
      processedChapter.sections = chapter.sections.map((section, sectionIndex) => ({
        ...section,
        sectionId: section.sectionId || `ch${chapterIndex + 1}-s${sectionIndex + 1}`,
        keywords: extractKeywords(section.title + ' ' + (section.content || '')),
        wordCount: calculateWordCount(section)
      }));
    }
    
    return processedChapter;
  });
}

// ============================================================================
// SEARCH AND RELEVANCE ALGORITHMS
// ============================================================================

/**
 * Query relevant content from all books
 * @param {Array<string>} keywords - Search keywords
 * @param {string} birthCard - User's birth card
 * @param {number} age - User's age
 * @returns {Promise<Array>} Relevant content sections
 */
async function queryRelevantContent(keywords, birthCard, age) {
  try {
    // Get all books (could be optimized with better indexing)
    const allBooksSnapshot = await getDocs(
      query(collection(db, 'books'), orderBy('lastUpdated', 'desc'))
    );
    
    const relevantSections = [];
    
    allBooksSnapshot.forEach(doc => {
      const bookData = doc.data();
      const sections = extractRelevantSections(bookData, keywords, birthCard, age);
      relevantSections.push(...sections);
    });
    
    // Sort by relevance score
    return relevantSections
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
    
  } catch (error) {
    console.error('Error querying relevant content:', error);
    return [];
  }
}

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract keywords from text with improved algorithm
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
 * Calculate word count for content object
 * @param {Object} contentObj - Object containing text content
 * @returns {number} Total word count
 */
function calculateWordCount(contentObj) {
  let totalText = '';
  
  // Collect all text fields
  Object.values(contentObj).forEach(value => {
    if (typeof value === 'string') {
      totalText += ' ' + value;
    }
  });
  
  return totalText.trim().split(/\s+/).length;
}

/**
 * Calculate content metadata
 * @param {Object} bookData - Processed book data
 * @returns {Object} Metadata object
 */
function calculateContentMetadata(bookData) {
  const metadata = {
    contentType: bookData.contentType,
    totalWords: 0,
    lastProcessed: new Date().toISOString()
  };
  
  if (bookData.contentType === 'cardology') {
    metadata.totalCards = bookData.cards?.length || 0;
    metadata.totalWords = bookData.cards?.reduce((sum, card) => sum + (card.wordCount || 0), 0) || 0;
  } else if (bookData.contentType === 'structured') {
    metadata.totalChapters = bookData.chapters?.length || 0;
    metadata.totalSections = bookData.chapters?.reduce((sum, chapter) => 
      sum + (chapter.sections?.length || 0), 0) || 0;
    metadata.totalWords = calculateWordCount(bookData);
  } else {
    metadata.totalWords = calculateWordCount(bookData);
  }
  
  return metadata;
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

/**
 * Get all books for admin/management purposes
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of all books with metadata
 */
export async function getAllBooks(options = {}) {
  try {
    const { includeContent = false, limit: queryLimit = 50 } = options;
    
    const booksQuery = includeContent 
      ? query(collection(db, 'books'), orderBy('lastUpdated', 'desc'), limit(queryLimit))
      : query(collection(db, 'books'), orderBy('lastUpdated', 'desc'), limit(queryLimit));
    
    const booksSnapshot = await getDocs(booksQuery);
    
    return booksSnapshot.docs.map(doc => {
      const data = doc.data();
      return includeContent ? { id: doc.id, ...data } : {
        id: doc.id,
        bookId: data.bookId,
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        metadata: data.metadata,
        lastUpdated: data.lastUpdated,
        createdAt: data.createdAt
      };
    });
    
  } catch (error) {
    console.error('Error getting all books:', error);
    throw error;
  }
}

// Export convenience functions for backward compatibility
export { uploadBook as uploadBookContent };
export { getBook as getBookContent };
export { searchBookContent as getRelevantBookContent };