#!/usr/bin/env node
/**
 * Test Vector Store Integration
 * 
 * This script tests the complete integration by:
 * 1. Running several test queries
 * 2. Measuring response quality
 * 3. Checking citation accuracy
 * 4. Comparing with expected results
 * 
 * Usage:
 *   node scripts/4-test-integration.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSISTANT_CONFIG_FILE = path.join(__dirname, '..', '.assistant-config.json');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Load Assistant configuration
 */
function loadAssistantConfig() {
  if (!fs.existsSync(ASSISTANT_CONFIG_FILE)) {
    console.error('❌ Assistant configuration not found!');
    console.log('\n💡 Run this command first:');
    console.log('   node scripts/3-create-assistant.js');
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(ASSISTANT_CONFIG_FILE, 'utf8'));
}

/**
 * Test queries with expected characteristics
 */
const TEST_QUERIES = [
  {
    query: "What are the business strengths of the Queen of Hearts?",
    birthCard: "Q♥",
    expectedKeywords: ["queen of hearts", "emotional", "leadership", "empathy", "team"],
    description: "Card-specific business strengths"
  },
  {
    query: "How should a 7 of Diamonds approach financial planning?",
    birthCard: "7♦",
    expectedKeywords: ["7 of diamonds", "financial", "money", "planning", "values"],
    description: "Card-specific financial advice"
  },
  {
    query: "What are the best business strategies for a King of Spades?",
    birthCard: "K♠",
    expectedKeywords: ["king of spades", "strategy", "leadership", "authority", "mastery"],
    description: "Strategic guidance for specific card"
  },
  {
    query: "When is the best time to start a new business venture?",
    birthCard: "A♣",
    expectedKeywords: ["timing", "planetary", "period", "cycle", "venture"],
    description: "Timing and planetary period guidance"
  },
  {
    query: "How can a Jack of Hearts and Queen of Spades work together in business?",
    birthCard: "J♥",
    expectedKeywords: ["partnership", "compatibility", "jack of hearts", "queen of spades", "collaboration"],
    description: "Partnership compatibility"
  }
];

/**
 * Run a single test query
 */
async function runTest(assistantId, testCase) {
  try {
    console.log('─'.repeat(60));
    console.log(`\n🧪 Test: ${testCase.description}`);
    console.log(`📝 Query: "${testCase.query}"`);
    console.log(`🎴 Birth Card: ${testCase.birthCard}\n`);
    
    const startTime = Date.now();
    
    // Create thread with context
    const thread = await openai.beta.threads.create({
      messages: [{
        role: "user",
        content: `Birth Card: ${testCase.birthCard}\n\nQuestion: ${testCase.query}`
      }]
    });
    
    // Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
      instructions: `The user's birth card is ${testCase.birthCard}. Provide specific guidance for this card.`
    });
    
    const duration = Date.now() - startTime;
    
    // Check run status
    if (run.status !== 'completed') {
      console.log(`❌ Test failed: ${run.status}`);
      if (run.last_error) {
        console.log(`   Error: ${run.last_error.message}`);
      }
      return {
        passed: false,
        duration,
        error: run.last_error?.message || run.status
      };
    }
    
    // Get response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const response = messages.data[0];
    
    const responseText = response.content
      .filter(c => c.type === 'text')
      .map(c => c.text.value)
      .join('\n');
    
    const annotations = response.content
      .filter(c => c.type === 'text')
      .flatMap(c => c.text.annotations || []);
    
    // Check for expected keywords
    const foundKeywords = testCase.expectedKeywords.filter(keyword =>
      responseText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const keywordScore = foundKeywords.length / testCase.expectedKeywords.length;
    const passed = keywordScore >= 0.6 && annotations.length > 0;
    
    // Display results
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📚 Citations: ${annotations.length}`);
    console.log(`🎯 Keyword match: ${foundKeywords.length}/${testCase.expectedKeywords.length} (${(keywordScore * 100).toFixed(0)}%)`);
    
    if (passed) {
      console.log(`✅ Test PASSED`);
    } else {
      console.log(`❌ Test FAILED`);
      if (keywordScore < 0.6) {
        console.log(`   Reason: Low keyword match (${(keywordScore * 100).toFixed(0)}%)`);
      }
      if (annotations.length === 0) {
        console.log(`   Reason: No citations (not using books)`);
      }
    }
    
    // Show response preview
    console.log(`\n📄 Response Preview:`);
    const preview = responseText.substring(0, 300);
    console.log(`   ${preview}${responseText.length > 300 ? '...' : ''}\n`);
    
    // Cleanup
    await openai.beta.threads.del(thread.id);
    
    return {
      passed,
      duration,
      citations: annotations.length,
      keywordScore,
      responseLength: responseText.length
    };
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}\n`);
    return {
      passed: false,
      error: error.message
    };
  }
}

/**
 * Main test function
 */
async function runTests() {
  try {
    console.log('🚀 Testing Vector Store Integration\n');
    console.log('='.repeat(60) + '\n');
    
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY environment variable is not set!');
      process.exit(1);
    }
    
    // Load Assistant configuration
    const assistantConfig = loadAssistantConfig();
    console.log('✅ Loaded Assistant configuration');
    console.log(`   Assistant ID: ${assistantConfig.assistantId}`);
    console.log(`   Model: ${assistantConfig.model}`);
    console.log(`   Vector Store: ${assistantConfig.vectorStoreId}\n`);
    
    // Run all tests
    const results = [];
    
    for (let i = 0; i < TEST_QUERIES.length; i++) {
      const testCase = TEST_QUERIES[i];
      const result = await runTest(assistantConfig.assistantId, testCase);
      results.push(result);
      
      // Small delay between tests
      if (i < TEST_QUERIES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60) + '\n');
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;
    const avgCitations = results.reduce((sum, r) => sum + (r.citations || 0), 0) / results.length;
    const avgKeywordScore = results.reduce((sum, r) => sum + (r.keywordScore || 0), 0) / results.length;
    
    console.log(`✅ Passed: ${passed}/${TEST_QUERIES.length} (${(passed / TEST_QUERIES.length * 100).toFixed(0)}%)`);
    console.log(`❌ Failed: ${failed}/${TEST_QUERIES.length}`);
    console.log(`⏱️  Avg Response Time: ${avgDuration.toFixed(0)}ms`);
    console.log(`📚 Avg Citations: ${avgCitations.toFixed(1)}`);
    console.log(`🎯 Avg Keyword Match: ${(avgKeywordScore * 100).toFixed(0)}%\n`);
    
    // Quality assessment
    if (passed === TEST_QUERIES.length && avgCitations >= 2 && avgKeywordScore >= 0.7) {
      console.log('🎉 Excellent! Vector Store integration is working perfectly!');
      console.log('   ✓ All tests passed');
      console.log('   ✓ Good citation usage');
      console.log('   ✓ High relevance scores');
    } else if (passed >= TEST_QUERIES.length * 0.8) {
      console.log('✅ Good! Vector Store integration is working well.');
      console.log('   Some minor improvements could be made.');
    } else if (passed >= TEST_QUERIES.length * 0.6) {
      console.log('⚠️  Fair. Vector Store integration needs improvement.');
      console.log('   Consider reviewing:');
      console.log('   - Book content quality and formatting');
      console.log('   - Assistant instructions');
      console.log('   - Test query expectations');
    } else {
      console.log('❌ Poor. Vector Store integration has issues.');
      console.log('   Action items:');
      console.log('   1. Check if books were uploaded correctly');
      console.log('   2. Verify Vector Store is linked to Assistant');
      console.log('   3. Review Assistant instructions');
      console.log('   4. Test manually in OpenAI Playground');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Review test results above');
    console.log('   2. If needed, refine book content or Assistant instructions');
    console.log('   3. Deploy to your application');
    console.log('   4. Monitor real-world performance\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run tests
runTests();

