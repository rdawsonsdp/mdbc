#!/usr/bin/env node
/**
 * Export Firestore Books to Text Files for Vector Store
 * 
 * This script exports all books from your Firestore database to
 * formatted text files that can be uploaded to OpenAI's Vector Store.
 * 
 * Usage:
 *   node scripts/1-export-books-to-files.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';

// Firebase configuration (will use your existing config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const OUTPUT_DIR = './data/books';

/**
 * Format book data into a well-structured text format for vector embeddings
 */
function formatBookForVectorStore(book) {
  let content = '';
  
  // Title and metadata
  content += `# ${book.title}\n\n`;
  
  if (book.description) {
    content += `${book.description}\n\n`;
    content += `---\n\n`;
  }
  
  // Handle different content types
  if (book.contentType === 'cardology' && book.cards) {
    content += formatCardologyContent(book.cards);
  } else if (book.contentType === 'structured' && book.chapters) {
    content += formatStructuredContent(book.chapters);
  } else if (book.content) {
    content += formatSimpleContent(book.content);
  }
  
  // Add searchable metadata at the end
  content += `\n\n---\n\n`;
  content += `**Book Metadata**\n`;
  content += `- Book ID: ${book.bookId}\n`;
  content += `- Content Type: ${book.contentType}\n`;
  content += `- Applicable Cards: ${book.applicableCards?.join(', ') || 'All'}\n`;
  
  if (book.metadata) {
    if (book.metadata.totalCards) {
      content += `- Total Cards: ${book.metadata.totalCards}\n`;
    }
    if (book.metadata.totalChapters) {
      content += `- Total Chapters: ${book.metadata.totalChapters}\n`;
    }
    if (book.metadata.totalWords) {
      content += `- Total Words: ${book.metadata.totalWords}\n`;
    }
  }
  
  return content;
}

/**
 * Format cardology-specific content
 */
function formatCardologyContent(cards) {
  let content = '## Card Profiles\n\n';
  
  for (const card of cards) {
    // Card header
    content += `### ${card.cardName || 'Card'} (${card.cardSymbol || ''})\n\n`;
    
    // Description
    if (card.description) {
      content += `${card.description}\n\n`;
    }
    
    // High vibration
    if (card.highVibration) {
      content += `**High Vibration Characteristics:**\n`;
      content += `${card.highVibration}\n\n`;
    }
    
    // Low vibration
    if (card.lowVibration) {
      content += `**Low Vibration Characteristics:**\n`;
      content += `${card.lowVibration}\n\n`;
    }
    
    // Additional content
    if (card.content) {
      content += `**Detailed Guidance:**\n`;
      content += `${card.content}\n\n`;
    }
    
    // Business topics
    if (card.businessTopics && card.businessTopics.length > 0) {
      content += `**Relevant Business Topics:** ${card.businessTopics.join(', ')}\n\n`;
    }
    
    // Card-specific attributes
    if (card.personality) {
      content += `**Personality Traits:** ${card.personality}\n\n`;
    }
    
    if (card.strengths) {
      content += `**Key Strengths:** ${card.strengths}\n\n`;
    }
    
    if (card.challenges) {
      content += `**Common Challenges:** ${card.challenges}\n\n`;
    }
    
    if (card.businessApplications) {
      content += `**Business Applications:** ${card.businessApplications}\n\n`;
    }
    
    // Separator between cards
    content += `---\n\n`;
  }
  
  return content;
}

/**
 * Format structured content (chapters and sections)
 */
function formatStructuredContent(chapters) {
  let content = '';
  
  for (const chapter of chapters) {
    // Chapter header
    content += `## ${chapter.title}\n\n`;
    
    // Chapter content (if exists at chapter level)
    if (chapter.content) {
      content += `${chapter.content}\n\n`;
    }
    
    // Process sections
    if (chapter.sections && chapter.sections.length > 0) {
      for (const section of chapter.sections) {
        content += `### ${section.title}\n\n`;
        
        if (section.content) {
          content += `${section.content}\n\n`;
        }
        
        // Add section metadata if available
        if (section.cardTypes && section.cardTypes.length > 0) {
          content += `*Applicable to: ${section.cardTypes.join(', ')}*\n\n`;
        }
      }
    }
    
    content += `---\n\n`;
  }
  
  return content;
}

/**
 * Format simple text content
 */
function formatSimpleContent(content) {
  return `## Content\n\n${content}\n\n`;
}

/**
 * Get all books from Firestore
 */
async function getAllBooksFromFirestore() {
  try {
    console.log('📚 Fetching all books from Firestore...');
    
    const booksCollection = collection(db, 'books');
    const booksSnapshot = await getDocs(booksCollection);
    
    const books = [];
    booksSnapshot.forEach(doc => {
      books.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${books.length} books in Firestore`);
    return books;
    
  } catch (error) {
    console.error('❌ Error fetching books from Firestore:', error);
    throw error;
  }
}

/**
 * Main export function
 */
async function exportBooks() {
  try {
    console.log('🚀 Starting book export process...\n');
    
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}\n`);
    
    // Get all books from Firestore
    const books = await getAllBooksFromFirestore();
    
    if (books.length === 0) {
      console.log('⚠️  No books found in Firestore. Make sure you have uploaded books.');
      return;
    }
    
    console.log('\n📝 Exporting books to text files...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const exportedFiles = [];
    
    // Export each book
    for (const book of books) {
      try {
        // Format book content
        const content = formatBookForVectorStore(book);
        
        // Create safe filename
        const filename = (book.bookId || book.title || `book-${book.id}`)
          .replace(/[^a-z0-9]/gi, '-')
          .toLowerCase()
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const filepath = path.join(OUTPUT_DIR, `${filename}.txt`);
        
        // Write to file
        await fs.writeFile(filepath, content, 'utf8');
        
        // Get file stats
        const stats = await fs.stat(filepath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        console.log(`✅ ${filename}.txt`);
        console.log(`   Title: ${book.title}`);
        console.log(`   Size: ${sizeKB} KB`);
        console.log(`   Content Type: ${book.contentType}`);
        
        if (book.metadata) {
          if (book.metadata.totalCards) {
            console.log(`   Cards: ${book.metadata.totalCards}`);
          }
          if (book.metadata.totalChapters) {
            console.log(`   Chapters: ${book.metadata.totalChapters}`);
          }
        }
        
        console.log('');
        
        exportedFiles.push({
          filename: `${filename}.txt`,
          filepath,
          title: book.title,
          size: sizeKB
        });
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error exporting book "${book.title}":`, error.message);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Export Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successfully exported: ${successCount} books`);
    console.log(`❌ Failed: ${errorCount} books`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('');
    
    // List all exported files
    console.log('📄 Exported Files:');
    for (const file of exportedFiles) {
      console.log(`   - ${file.filename} (${file.size} KB)`);
    }
    
    console.log('\n✅ Export complete!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Review the exported files in ./data/books/');
    console.log('   2. Run: node scripts/2-setup-vector-store.js');
    console.log('   3. This will upload the files to OpenAI Vector Store');
    
  } catch (error) {
    console.error('\n❌ Fatal error during export:', error);
    process.exit(1);
  }
}

// Run the export
exportBooks();

