// Debug version of book storage to identify upload issues

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
 * Debug version of upload book content
 */
export async function uploadBookContentDebug(bookData) {
  console.log('🔍 Starting book upload debug...');
  console.log('📚 Book data received:', bookData);
  
  try {
    // Step 1: Check if Firestore is connected
    console.log('🔗 Checking Firestore connection...');
    console.log('📊 Firestore instance:', db);
    
    // Step 2: Generate book ID
    const bookId = bookData.bookId || `book-${Date.now()}`;
    console.log('🆔 Generated book ID:', bookId);
    
    // Step 3: Validate book structure
    console.log('✅ Validating book structure...');
    const validatedData = validateBookStructureDebug(bookData);
    console.log('✅ Validation passed:', validatedData);
    
    // Step 4: Process content
    console.log('⚙️ Processing book content...');
    const processedData = await processBookContentDebug(validatedData);
    console.log('⚙️ Processing completed:', processedData);
    
    // Step 5: Prepare document data
    const documentData = {
      ...processedData,
      bookId,
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    console.log('📄 Document data prepared:', documentData);
    
    // Step 6: Try to write to Firestore
    console.log('💾 Attempting to write to Firestore...');
    const docRef = doc(db, 'bookContent', bookId);
    console.log('📝 Document reference:', docRef);
    
    await setDoc(docRef, documentData);
    console.log('✅ Successfully uploaded to Firestore!');
    
    return bookId;
    
  } catch (error) {
    console.error('❌ Error in book upload debug:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Debug version of book structure validation
 */
function validateBookStructureDebug(bookData) {
  console.log('🔍 Validating book structure...');
  
  const requiredFields = ['title', 'chapters'];
  
  requiredFields.forEach(field => {
    if (!bookData[field]) {
      console.error(`❌ Missing required field: ${field}`);
      throw new Error(`Missing required field: ${field}`);
    }
    console.log(`✅ Field ${field} present:`, bookData[field]);
  });
  
  // Validate chapters structure
  if (!Array.isArray(bookData.chapters)) {
    console.error('❌ Chapters must be an array');
    throw new Error('Chapters must be an array');
  }
  console.log('✅ Chapters is array with length:', bookData.chapters.length);
  
  bookData.chapters.forEach((chapter, index) => {
    console.log(`🔍 Validating chapter ${index}:`, chapter);
    
    if (!chapter.title || !chapter.sections) {
      console.error(`❌ Chapter ${index} missing required fields`);
      throw new Error(`Chapter ${index} missing required fields`);
    }
    
    if (!Array.isArray(chapter.sections)) {
      console.error(`❌ Chapter ${index} sections must be an array`);
      throw new Error(`Chapter ${index} sections must be an array`);
    }
    
    console.log(`✅ Chapter ${index} validation passed`);
  });
  
  console.log('✅ All validation passed');
  return bookData;
}

/**
 * Debug version of content processing
 */
async function processBookContentDebug(bookData) {
  console.log('⚙️ Processing book content...');
  
  const processedData = { ...bookData };
  
  // Process each chapter and section
  processedData.chapters = bookData.chapters.map((chapter, chapterIndex) => {
    console.log(`⚙️ Processing chapter ${chapterIndex}:`, chapter.title);
    
    return {
      ...chapter,
      sections: chapter.sections.map((section, sectionIndex) => {
        console.log(`⚙️ Processing section ${sectionIndex}:`, section.title);
        
        const processedSection = {
          ...section,
          // Extract keywords from content
          keywords: extractKeywordsDebug(section.content + ' ' + section.title),
          // Ensure cardTypes is an array
          cardTypes: Array.isArray(section.cardTypes) ? section.cardTypes : ['all'],
          // Ensure businessTopics is an array
          businessTopics: Array.isArray(section.businessTopics) ? section.businessTopics : ['general'],
          // Add word count
          wordCount: section.content.split(' ').length,
          // Add processing timestamp
          processedAt: new Date().toISOString()
        };
        
        console.log(`✅ Section ${sectionIndex} processed:`, processedSection);
        return processedSection;
      })
    };
  });
  
  // Calculate total statistics
  processedData.metadata = {
    totalChapters: processedData.chapters.length,
    totalSections: processedData.chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0),
    totalWords: processedData.chapters.reduce((sum, chapter) => 
      sum + chapter.sections.reduce((sectionSum, section) => sectionSum + section.wordCount, 0), 0
    ),
    lastProcessed: new Date().toISOString()
  };
  
  console.log('✅ Content processing completed:', processedData.metadata);
  return processedData;
}

/**
 * Debug version of keyword extraction
 */
function extractKeywordsDebug(text) {
  console.log('🔍 Extracting keywords from:', text.substring(0, 100) + '...');
  
  if (!text) {
    console.log('⚠️ No text provided for keyword extraction');
    return [];
  }
  
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
  
  console.log('✅ Keywords extracted:', keywords);
  return keywords;
}

/**
 * Test Firestore connection
 */
export async function testFirestoreConnection() {
  console.log('🔍 Testing Firestore connection...');
  
  try {
    // Try to read from a test collection
    const testQuery = query(collection(db, 'test'), limit(1));
    const snapshot = await getDocs(testQuery);
    console.log('✅ Firestore connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}
