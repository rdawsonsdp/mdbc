#!/usr/bin/env node
/**
 * Setup OpenAI Vector Store and Upload Books
 * 
 * This script:
 * 1. Creates a new OpenAI Vector Store
 * 2. Uploads all book files from ./data/books/
 * 3. Saves the Vector Store ID for later use
 * 
 * Prerequisites:
 *   - OPENAI_API_KEY environment variable must be set
 *   - Book files must exist in ./data/books/ (run 1-export-books-to-files.js first)
 * 
 * Usage:
 *   node scripts/2-setup-vector-store.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKS_DIR = path.join(__dirname, '..', 'data', 'books');
const CONFIG_FILE = path.join(__dirname, '..', '.vector-store-config.json');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get all book files from the books directory
 */
function getBookFiles() {
  try {
    const files = fs.readdirSync(BOOKS_DIR);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    return txtFiles.map(file => ({
      name: file,
      path: path.join(BOOKS_DIR, file),
      size: fs.statSync(path.join(BOOKS_DIR, file)).size
    }));
  } catch (error) {
    console.error('❌ Error reading books directory:', error.message);
    console.log('\n💡 Make sure you run 1-export-books-to-files.js first!');
    process.exit(1);
  }
}

/**
 * Create Vector Store
 */
async function createVectorStore() {
  try {
    console.log('📦 Creating OpenAI Vector Store...');
    
    const vectorStore = await openai.beta.vectorStores.create({
      name: "MDBC Cardology Books",
      expires_after: {
        anchor: "last_active_at",
        days: 365  // Keep active for 1 year from last use
      }
    });
    
    console.log(`✅ Vector Store created: ${vectorStore.id}`);
    console.log(`   Name: ${vectorStore.name}`);
    console.log(`   Status: ${vectorStore.status}`);
    console.log('');
    
    return vectorStore;
  } catch (error) {
    console.error('❌ Error creating Vector Store:', error.message);
    throw error;
  }
}

/**
 * Upload files to Vector Store
 */
async function uploadFiles(vectorStoreId, files) {
  try {
    console.log(`📤 Uploading ${files.length} files to Vector Store...\n`);
    
    const fileStreams = files.map(file => fs.createReadStream(file.path));
    
    // Upload in batch and wait for processing
    const fileBatch = await openai.beta.vectorStores.fileBatches.uploadAndPoll(
      vectorStoreId,
      { files: fileStreams }
    );
    
    console.log('✅ Upload complete!');
    console.log(`   Total files: ${fileBatch.file_counts.total}`);
    console.log(`   Completed: ${fileBatch.file_counts.completed}`);
    console.log(`   Failed: ${fileBatch.file_counts.failed}`);
    console.log(`   Status: ${fileBatch.status}`);
    console.log('');
    
    return fileBatch;
  } catch (error) {
    console.error('❌ Error uploading files:', error.message);
    throw error;
  }
}

/**
 * Get detailed file information
 */
async function getVectorStoreFiles(vectorStoreId) {
  try {
    const files = await openai.beta.vectorStores.files.list(vectorStoreId);
    return files.data;
  } catch (error) {
    console.error('❌ Error getting file list:', error.message);
    return [];
  }
}

/**
 * Save configuration for later use
 */
function saveConfig(vectorStoreId, files, uploadedFiles) {
  const config = {
    vectorStoreId,
    createdAt: new Date().toISOString(),
    filesUploaded: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    files: files.map(file => ({
      name: file.name,
      size: file.size
    })),
    uploadedFileIds: uploadedFiles.map(file => file.id)
  };
  
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`💾 Configuration saved to: ${CONFIG_FILE}`);
}

/**
 * Check if Vector Store already exists
 */
function checkExistingConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return config;
  }
  return null;
}

/**
 * Main setup function
 */
async function setupVectorStore() {
  try {
    console.log('🚀 Setting up OpenAI Vector Store for MDBC\n');
    console.log('='.repeat(60) + '\n');
    
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY environment variable is not set!');
      console.log('\n💡 Set it in your .env.local file or export it:');
      console.log('   export OPENAI_API_KEY=sk-...');
      process.exit(1);
    }
    
    // Check for existing configuration
    const existingConfig = checkExistingConfig();
    if (existingConfig) {
      console.log('⚠️  Found existing Vector Store configuration:');
      console.log(`   Vector Store ID: ${existingConfig.vectorStoreId}`);
      console.log(`   Created: ${existingConfig.createdAt}`);
      console.log(`   Files: ${existingConfig.filesUploaded}`);
      console.log('');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Do you want to create a new Vector Store? (y/N): ', resolve);
      });
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('\n✅ Using existing Vector Store configuration.');
        console.log(`   Vector Store ID: ${existingConfig.vectorStoreId}`);
        console.log('\n💡 Update your .env.local file:');
        console.log(`   VECTOR_STORE_ID=${existingConfig.vectorStoreId}`);
        return;
      }
      
      console.log('');
    }
    
    // Get book files
    const files = getBookFiles();
    
    if (files.length === 0) {
      console.error('❌ No book files found in ./data/books/');
      console.log('\n💡 Run this command first:');
      console.log('   node scripts/1-export-books-to-files.js');
      process.exit(1);
    }
    
    console.log(`📚 Found ${files.length} book files:`);
    files.forEach(file => {
      const sizeKB = (file.size / 1024).toFixed(2);
      console.log(`   - ${file.name} (${sizeKB} KB)`);
    });
    console.log('');
    
    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`📊 Total size: ${totalSizeMB} MB\n`);
    
    // Estimate costs
    const storageCostPerMonth = (totalSize / 1024 / 1024 / 1024) * 0.10 * 30; // $0.10/GB/day
    console.log(`💰 Estimated storage cost: $${storageCostPerMonth.toFixed(2)}/month\n`);
    
    // Create Vector Store
    const vectorStore = await createVectorStore();
    
    // Upload files
    const fileBatch = await uploadFiles(vectorStore.id, files);
    
    if (fileBatch.file_counts.failed > 0) {
      console.warn('⚠️  Some files failed to upload. Check the error logs.');
    }
    
    // Get detailed file information
    console.log('📋 Getting file details...');
    const uploadedFiles = await getVectorStoreFiles(vectorStore.id);
    
    // Save configuration
    saveConfig(vectorStore.id, files, uploadedFiles);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Vector Store setup complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📌 Vector Store ID:');
    console.log(`   ${vectorStore.id}`);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('');
    console.log('1. Update your .env.local file:');
    console.log(`   VECTOR_STORE_ID=${vectorStore.id}`);
    console.log('');
    console.log('2. Create an Assistant:');
    console.log('   node scripts/3-create-assistant.js');
    console.log('');
    console.log('3. Or manually create an Assistant at:');
    console.log('   https://platform.openai.com/assistants');
    console.log('   - Use the Vector Store ID above');
    console.log('   - Enable "File Search" tool');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run setup
setupVectorStore();

