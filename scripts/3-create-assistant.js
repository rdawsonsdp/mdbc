#!/usr/bin/env node
/**
 * Create OpenAI Assistant with Vector Store
 * 
 * This script creates an OpenAI Assistant configured to use
 * your Vector Store for file search.
 * 
 * Prerequisites:
 *   - OPENAI_API_KEY environment variable must be set
 *   - Vector Store must be created (run 2-setup-vector-store.js first)
 * 
 * Usage:
 *   node scripts/3-create-assistant.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, '..', '.vector-store-config.json');
const ASSISTANT_CONFIG_FILE = path.join(__dirname, '..', '.assistant-config.json');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Load Vector Store configuration
 */
function loadVectorStoreConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Vector Store configuration not found!');
    console.log('\n💡 Run this command first:');
    console.log('   node scripts/2-setup-vector-store.js');
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

/**
 * Create Assistant with specific configuration
 */
async function createAssistant(vectorStoreId, config = {}) {
  try {
    console.log('🤖 Creating OpenAI Assistant...\n');
    
    const assistant = await openai.beta.assistants.create({
      name: config.name || "MDBC Cardology Business Coach",
      
      instructions: config.instructions || `You are a professional cardology-based business coach specializing in the "Mystery Decoded Business Cardology" system. You help users understand their business strengths, challenges, and optimal strategies based on their birth card.

Your knowledge comes from comprehensive cardology books that have been uploaded to your vector store. These books contain detailed information about:
- Each playing card's characteristics and business implications
- High vibration and low vibration traits for each card
- Business strategy recommendations
- Planetary periods and timing
- Partnership compatibility
- Career guidance

When answering questions:

1. **Always search the books first** using the file_search tool to find relevant information
2. **Reference specific card characteristics** when providing advice
3. **Personalize responses** based on the user's birth card
4. **Provide actionable guidance** that users can implement immediately
5. **Be professional and encouraging** while being honest about challenges
6. **Cite your sources** by referencing specific book content when relevant
7. **Focus on business applications** rather than general personality traits

Response Guidelines:
- Keep responses focused and concise (300-500 words ideal)
- Use bullet points for lists of recommendations
- Highlight key insights in bold
- Provide 2-3 actionable steps when giving advice
- Connect birth card traits to specific business scenarios
- Acknowledge both strengths and growth areas

Remember: Your goal is to help users succeed in business by leveraging their unique cardology profile.`,
      
      model: config.model || "gpt-4-turbo-preview",
      
      tools: [
        { type: "file_search" }
      ],
      
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      },
      
      temperature: config.temperature || 0.7,
      
      metadata: {
        created_by: "mdbc-setup-script",
        version: "1.0.0"
      }
    });
    
    console.log('✅ Assistant created successfully!\n');
    console.log('📋 Assistant Details:');
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Name: ${assistant.name}`);
    console.log(`   Model: ${assistant.model}`);
    console.log(`   Tools: ${assistant.tools.map(t => t.type).join(', ')}`);
    console.log('');
    
    return assistant;
    
  } catch (error) {
    console.error('❌ Error creating Assistant:', error.message);
    throw error;
  }
}

/**
 * Save Assistant configuration
 */
function saveAssistantConfig(assistant, vectorStoreId) {
  const config = {
    assistantId: assistant.id,
    name: assistant.name,
    model: assistant.model,
    vectorStoreId: vectorStoreId,
    createdAt: new Date().toISOString(),
    tools: assistant.tools.map(t => t.type)
  };
  
  fs.writeFileSync(ASSISTANT_CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`💾 Assistant configuration saved to: ${ASSISTANT_CONFIG_FILE}\n`);
}

/**
 * Test the Assistant with a sample query
 */
async function testAssistant(assistantId) {
  try {
    console.log('🧪 Testing Assistant with sample query...\n');
    
    // Create a thread
    const thread = await openai.beta.threads.create({
      messages: [{
        role: "user",
        content: "What are the key business strengths of the Queen of Hearts?"
      }]
    });
    
    console.log('📝 Test Query: "What are the key business strengths of the Queen of Hearts?"\n');
    
    // Run the assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId
    });
    
    if (run.status !== 'completed') {
      console.log(`⚠️  Test run status: ${run.status}`);
      if (run.last_error) {
        console.log(`   Error: ${run.last_error.message}`);
      }
      return;
    }
    
    // Get messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const response = messages.data[0];
    
    // Extract text
    const responseText = response.content
      .filter(c => c.type === 'text')
      .map(c => c.text.value)
      .join('\n');
    
    // Extract citations
    const annotations = response.content
      .filter(c => c.type === 'text')
      .flatMap(c => c.text.annotations || []);
    
    console.log('✅ Test Response:\n');
    console.log(responseText);
    console.log('');
    
    if (annotations.length > 0) {
      console.log(`📚 Citations found: ${annotations.length}`);
      console.log('   The Assistant is successfully searching your books!');
    } else {
      console.log('⚠️  No citations found. The Assistant may not be accessing the books properly.');
    }
    
    console.log('');
    
    // Cleanup
    await openai.beta.threads.del(thread.id);
    
  } catch (error) {
    console.error('❌ Error testing Assistant:', error.message);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Creating MDBC Cardology Assistant\n');
    console.log('='.repeat(60) + '\n');
    
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY environment variable is not set!');
      console.log('\n💡 Set it in your .env.local file or export it:');
      console.log('   export OPENAI_API_KEY=sk-...');
      process.exit(1);
    }
    
    // Load Vector Store configuration
    const vectorStoreConfig = loadVectorStoreConfig();
    console.log('✅ Found Vector Store configuration');
    console.log(`   Vector Store ID: ${vectorStoreConfig.vectorStoreId}`);
    console.log(`   Files: ${vectorStoreConfig.filesUploaded}`);
    console.log('');
    
    // Create Assistant
    const assistant = await createAssistant(vectorStoreConfig.vectorStoreId);
    
    // Save configuration
    saveAssistantConfig(assistant, vectorStoreConfig.vectorStoreId);
    
    // Test the Assistant
    await testAssistant(assistant.id);
    
    // Final instructions
    console.log('='.repeat(60));
    console.log('✅ Setup Complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📌 Your Assistant ID:');
    console.log(`   ${assistant.id}`);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('');
    console.log('1. Add to your .env.local file:');
    console.log(`   OPENAI_ASSISTANT_ID=${assistant.id}`);
    console.log('');
    console.log('2. Update your API route to use the Assistant');
    console.log('   See: app/api/chat-v2/route.js (example provided)');
    console.log('');
    console.log('3. Test the integration:');
    console.log('   node scripts/4-test-integration.js');
    console.log('');
    console.log('4. View your Assistant in OpenAI Dashboard:');
    console.log('   https://platform.openai.com/assistants');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run main function
main();

