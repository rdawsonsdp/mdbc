#!/usr/bin/env node
/**
 * Setup Multi-App Vector Store
 * 
 * Creates ONE shared Vector Store for all apps (MDBC, LCC, DYK)
 * Uploads books from organized folders with proper tagging
 * 
 * Prerequisites:
 *   - OPENAI_API_KEY environment variable
 *   - Books organized in ./data/books/ structure:
 *     - shared/   (all apps)
 *     - mdbc/     (business)
 *     - lcc/      (relationships)
 *     - dyk/      (parenting)
 * 
 * Usage:
 *   node scripts/2-setup-multi-app-vector-store.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKS_DIR = path.join(__dirname, '..', 'data', 'books');
const CONFIG_FILE = path.join(__dirname, '..', '.vector-store-config.json');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function uploadBooksFromFolder(vectorStoreId, folderPath, appTag) {
  const files = fs.readdirSync(folderPath);
  const uploadedFiles = [];
  
  for (const filename of files) {
    if (filename.startsWith('.')) continue; // Skip hidden files
    
    const filepath = path.join(folderPath, filename);
    const stats = fs.statSync(filepath);
    
    if (stats.isFile()) {
      try {
        // Step 1: Upload file to OpenAI Files
        const fileStream = fs.createReadStream(filepath);
        const openaiFile = await openai.files.create({
          file: fileStream,
          purpose: 'assistants'
        });
        
        // Step 2: Add file to Vector Store
        const vectorStoreFile = await openai.vectorStores.files.create(
          vectorStoreId,
          { file_id: openaiFile.id }
        );
        
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`   ✅ ${filename} (${sizeKB} KB) - ${appTag}`);
        
        uploadedFiles.push({
          filename,
          fileId: openaiFile.id,
          vectorStoreFileId: vectorStoreFile.id,
          size: stats.size,
          app: appTag
        });
        
      } catch (error) {
        console.error(`   ❌ Failed to upload ${filename}:`, error.message);
      }
    }
  }
  
  return uploadedFiles;
}

async function setupMultiAppVectorStore() {
  try {
    console.log('🚀 Setting Up Multi-App Vector Store\n');
    console.log('='.repeat(60) + '\n');
    
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set!');
      console.log('\n💡 Add to .env.local:');
      console.log('   OPENAI_API_KEY=sk-...');
      process.exit(1);
    }
    
    // Check for existing config
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      console.log('⚠️  Found existing Vector Store configuration:');
      console.log(`   Vector Store ID: ${config.vectorStoreId}`);
      console.log(`   Created: ${config.createdAt}`);
      console.log('');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Create a new Vector Store? (y/N): ', resolve);
      });
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('\n✅ Using existing configuration');
        return;
      }
      console.log('');
    }
    
    // Create shared Vector Store
    console.log('📦 Creating Shared Vector Store for All Apps...');
    
    const vectorStore = await openai.vectorStores.create({
      name: "Cardology Multi-App Knowledge Base",
      expires_after: {
        anchor: "last_active_at",
        days: 365
      }
    });
    
    console.log(`✅ Vector Store created: ${vectorStore.id}`);
    console.log(`   Name: ${vectorStore.name}\n`);
    
    // Track all uploaded files
    const allUploadedFiles = [];
    
    // Upload shared books (for all apps)
    const sharedPath = path.join(BOOKS_DIR, 'shared');
    if (fs.existsSync(sharedPath)) {
      console.log('📤 Uploading SHARED books (MDBC + LCC + DYK)...');
      const sharedFiles = await uploadBooksFromFolder(
        vectorStore.id,
        sharedPath,
        'all apps'
      );
      allUploadedFiles.push(...sharedFiles);
      console.log('');
    } else {
      console.log('⚠️  No ./data/books/shared/ folder found\n');
    }
    
    // Upload MDBC books
    const mdbcPath = path.join(BOOKS_DIR, 'mdbc');
    if (fs.existsSync(mdbcPath)) {
      console.log('📤 Uploading MDBC books (Business)...');
      const mdbcFiles = await uploadBooksFromFolder(
        vectorStore.id,
        mdbcPath,
        'MDBC only'
      );
      allUploadedFiles.push(...mdbcFiles);
      console.log('');
    } else {
      console.log('⚠️  No ./data/books/mdbc/ folder found\n');
    }
    
    // Upload LCC books
    const lccPath = path.join(BOOKS_DIR, 'lcc');
    if (fs.existsSync(lccPath)) {
      console.log('📤 Uploading LCC books (Relationships)...');
      const lccFiles = await uploadBooksFromFolder(
        vectorStore.id,
        lccPath,
        'LCC only'
      );
      allUploadedFiles.push(...lccFiles);
      console.log('');
    } else {
      console.log('⚠️  No ./data/books/lcc/ folder found\n');
    }
    
    // Upload DYK books
    const dykPath = path.join(BOOKS_DIR, 'dyk');
    if (fs.existsSync(dykPath)) {
      console.log('📤 Uploading DYK books (Parenting)...');
      const dykFiles = await uploadBooksFromFolder(
        vectorStore.id,
        dykPath,
        'DYK only'
      );
      allUploadedFiles.push(...dykFiles);
      console.log('');
    } else {
      console.log('⚠️  No ./data/books/dyk/ folder found\n');
    }
    
    // Wait for processing
    console.log('⏳ Waiting for OpenAI to process files...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get file status
    const vectorStoreFiles = await openai.vectorStores.files.list(vectorStore.id);
    
    // Save configuration
    const config = {
      vectorStoreId: vectorStore.id,
      createdAt: new Date().toISOString(),
      apps: ['mdbc', 'lcc', 'dyk'],
      totalFiles: allUploadedFiles.length,
      files: allUploadedFiles,
      status: vectorStoreFiles.data[0]?.status || 'processing'
    };
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Multi-App Vector Store Setup Complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Vector Store ID: ${vectorStore.id}`);
    console.log(`   Total Files: ${allUploadedFiles.length}`);
    console.log(`   Apps Supported: MDBC, LCC, DYK`);
    console.log(`   Configuration: ${CONFIG_FILE}`);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('');
    console.log('1. Create app-specific assistants:');
    console.log('   node scripts/3-create-multi-app-assistants.js');
    console.log('');
    console.log('2. Or manually create assistants at:');
    console.log('   https://platform.openai.com/assistants');
    console.log(`   Use Vector Store ID: ${vectorStore.id}`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

setupMultiAppVectorStore();

