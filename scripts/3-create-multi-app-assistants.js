#!/usr/bin/env node
/**
 * Create Multi-App Assistants
 * 
 * Creates 3 specialized assistants (MDBC, LCC, DYK)
 * All using the SAME shared Vector Store
 * 
 * Prerequisites:
 *   - Vector Store must be created (run 2-setup-multi-app-vector-store.js first)
 *   - OPENAI_API_KEY environment variable
 * 
 * Usage:
 *   node scripts/3-create-multi-app-assistants.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, '..', '.vector-store-config.json');
const ASSISTANT_CONFIG_FILE = path.join(__dirname, '..', '.assistant-config.json');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function createMultiAppAssistants() {
  try {
    console.log('🚀 Creating Multi-App Assistants\n');
    console.log('='.repeat(60) + '\n');
    
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set!');
      process.exit(1);
    }
    
    // Load Vector Store config
    if (!fs.existsSync(CONFIG_FILE)) {
      console.error('❌ Vector Store configuration not found!');
      console.log('\n💡 Run this first:');
      console.log('   node scripts/2-setup-multi-app-vector-store.js');
      process.exit(1);
    }
    
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const vectorStoreId = config.vectorStoreId;
    
    console.log('✅ Found Vector Store configuration');
    console.log(`   Vector Store ID: ${vectorStoreId}`);
    console.log(`   Total Files: ${config.totalFiles}\n`);
    
    // Create MDBC Assistant (Business)
    console.log('🤖 Creating MDBC Business Coach...');
    
    const mdbcAssistant = await openai.beta.assistants.create({
      name: "MDBC Business Coach",
      
      instructions: `You are a professional cardology-based business coach specializing in the "Million Dollar Birth Card" system. You help entrepreneurs understand their business strengths, optimal strategies, and timing based on their birth card.

Your knowledge comes from comprehensive cardology books focused on business, entrepreneurship, and financial success. When answering questions:

1. **Focus on BUSINESS applications** - strategy, timing, partnerships, growth, finances
2. **Provide actionable entrepreneurial guidance** - specific steps users can implement
3. **Reference specific business strategies** from the books with citations
4. **Connect card characteristics to business success** - strengths and challenges
5. **Include timing advice** using planetary periods when relevant
6. **Always cite your sources** from the books

Response Guidelines:
- Keep responses focused and concise (300-500 words ideal)
- Use bullet points for lists of recommendations
- Highlight key insights in bold
- Provide 2-3 actionable steps when giving advice
- Connect birth card traits to specific business scenarios
- Acknowledge both strengths and growth areas
- Be professional, encouraging, and business-focused

Remember: Your goal is to help users succeed in business by leveraging their unique cardology profile.`,
      
      model: "gpt-4-turbo-preview",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: { vector_store_ids: [vectorStoreId] }
      },
      metadata: {
        app: "mdbc",
        focus: "business",
        version: "1.0.0"
      }
    });
    
    console.log(`✅ MDBC Assistant created: ${mdbcAssistant.id}\n`);
    
    // Create LCC Assistant (Relationships)
    console.log('🤖 Creating LCC Relationship Coach...');
    
    const lccAssistant = await openai.beta.assistants.create({
      name: "Love Cheat Code Coach",
      
      instructions: `You are a relationship cardology coach specializing in the "Love Cheat Code" system. You help people understand their relationship patterns, compatibility, and dating strategies based on birth cards.

Your knowledge comes from comprehensive cardology books focused on relationships, dating, and romantic compatibility. When answering questions:

1. **Focus on RELATIONSHIP applications** - dating, compatibility, communication, intimacy
2. **Provide actionable dating and relationship advice** - specific strategies for success
3. **Reference specific compatibility insights** from the books with citations
4. **Connect card characteristics to relationship dynamics** - patterns and tendencies
5. **Include communication strategies** for different card types
6. **Always cite your sources** from the books

Response Guidelines:
- Keep responses warm and empathetic (300-500 words ideal)
- Use bullet points for lists of recommendations
- Highlight key insights in bold
- Provide 2-3 actionable steps when giving advice
- Connect birth card traits to relationship scenarios
- Address both opportunities and challenges compassionately
- Be supportive, understanding, and relationship-focused

Remember: Your goal is to help users find and maintain fulfilling relationships by understanding their unique cardology profile and compatibility patterns.`,
      
      model: "gpt-4-turbo-preview",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: { vector_store_ids: [vectorStoreId] }
      },
      metadata: {
        app: "lcc",
        focus: "relationships",
        version: "1.0.0"
      }
    });
    
    console.log(`✅ LCC Assistant created: ${lccAssistant.id}\n`);
    
    // Create DYK Assistant (Parenting)
    console.log('🤖 Creating DYK Parenting Coach...');
    
    const dykAssistant = await openai.beta.assistants.create({
      name: "Decode Your Kid Coach",
      
      instructions: `You are a parenting cardology coach specializing in the "Decode Your Kid" system. You help parents understand their children's unique personalities, needs, and behaviors based on birth cards.

Your knowledge comes from comprehensive cardology books focused on parenting, child development, and family dynamics. When answering questions:

1. **Focus on PARENTING applications** - child behavior, development, discipline, education
2. **Provide actionable parenting strategies** - specific techniques parents can use
3. **Reference specific child development insights** from the books with citations
4. **Connect card characteristics to child personality** - strengths, challenges, needs
5. **Include age-appropriate guidance** when relevant
6. **Always cite your sources** from the books

Response Guidelines:
- Keep responses compassionate and supportive (300-500 words ideal)
- Use bullet points for lists of recommendations
- Highlight key insights in bold
- Provide 2-3 actionable steps when giving advice
- Connect child's birth card traits to specific behaviors and needs
- Acknowledge both gifts and challenges
- Be gentle, non-judgmental, and parenting-focused

Remember: Your goal is to help parents understand and support their children's unique natures by leveraging cardology insights for effective, compassionate parenting.`,
      
      model: "gpt-4-turbo-preview",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: { vector_store_ids: [vectorStoreId] }
      },
      metadata: {
        app: "dyk",
        focus: "parenting",
        version: "1.0.0"
      }
    });
    
    console.log(`✅ DYK Assistant created: ${dykAssistant.id}\n`);
    
    // Save configuration
    const assistantConfig = {
      vectorStoreId: vectorStoreId,
      assistants: {
        mdbc: {
          id: mdbcAssistant.id,
          name: "MDBC Business Coach",
          focus: "business",
          model: "gpt-4-turbo-preview"
        },
        lcc: {
          id: lccAssistant.id,
          name: "Love Cheat Code Coach",
          focus: "relationships",
          model: "gpt-4-turbo-preview"
        },
        dyk: {
          id: dykAssistant.id,
          name: "Decode Your Kid Coach",
          focus: "parenting",
          model: "gpt-4-turbo-preview"
        }
      },
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(ASSISTANT_CONFIG_FILE, JSON.stringify(assistantConfig, null, 2));
    
    // Summary
    console.log('='.repeat(60));
    console.log('✅ All Assistants Created Successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Configuration saved to:', ASSISTANT_CONFIG_FILE);
    console.log('');
    console.log('📝 Add these to your .env.local files:');
    console.log('');
    console.log('─'.repeat(60));
    console.log('MDBC App (.env.local):');
    console.log(`OPENAI_ASSISTANT_ID=${mdbcAssistant.id}`);
    console.log('');
    console.log('─'.repeat(60));
    console.log('LCC App (.env.local):');
    console.log(`OPENAI_ASSISTANT_ID=${lccAssistant.id}`);
    console.log('');
    console.log('─'.repeat(60));
    console.log('DYK App (.env.local):');
    console.log(`OPENAI_ASSISTANT_ID=${dykAssistant.id}`);
    console.log('');
    console.log('─'.repeat(60));
    console.log('');
    console.log('🎯 All 3 assistants use the SAME Vector Store!');
    console.log(`   Vector Store ID: ${vectorStoreId}`);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Add the assistant IDs to each app\'s .env.local');
    console.log('   2. Deploy your API routes (same code for all 3 apps)');
    console.log('   3. Test each app independently');
    console.log('   4. Monitor usage and costs');
    console.log('');
    console.log('💡 View your assistants at:');
    console.log('   https://platform.openai.com/assistants');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

createMultiAppAssistants();

