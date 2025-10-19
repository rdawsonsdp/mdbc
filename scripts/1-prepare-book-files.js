#!/usr/bin/env node
/**
 * Prepare Book Files from CSV/JSON Data for Vector Store
 * 
 * This script converts your existing cardology data (CSV/JSON)
 * into formatted text files optimized for OpenAI Vector Store.
 * 
 * Sources:
 * - lib/data/MDBC Card Profiles.csv
 * - lib/data/cardToActivities.json
 * - lib/data/planetaryPeriods.json
 * - lib/data/yearlyForecasts.json
 * 
 * Usage:
 *   node scripts/1-prepare-book-files.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'lib', 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'books');

/**
 * Parse CSV file
 */
async function parseCSV(filepath) {
  const content = await fs.readFile(filepath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  let currentRow = [];
  let inQuotes = false;
  let currentField = '';
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // End of line
    if (!inQuotes) {
      currentRow.push(currentField.trim());
      
      if (currentRow.length === headers.length && currentRow.some(field => field)) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = currentRow[index];
        });
        data.push(obj);
      }
      
      currentRow = [];
      currentField = '';
    } else {
      currentField += '\n';
    }
  }
  
  return data;
}

/**
 * Format Card Profiles into text
 */
async function formatCardProfiles() {
  console.log('📚 Processing Card Profiles...');
  
  const csvPath = path.join(DATA_DIR, 'MDBC Card Profiles.csv');
  const profiles = await parseCSV(csvPath);
  
  let content = `# MDBC Card Profiles - Comprehensive Business Guide

This book contains detailed personality profiles and business guidance for all 52 playing cards in the cardology system. Each card represents unique strengths, challenges, and business approaches.

---

`;

  for (const profile of profiles) {
    const card = profile.Card || profile.card || 'Unknown Card';
    const description = profile.Description || '';
    const zoneOfGenius = profile['Zone of Genius'] || profile.zoneOfGenius || '';
    const motivation = profile['How to Motivate'] || profile.howToMotivate || '';
    
    content += `## ${card} Profile\n\n`;
    
    if (description) {
      content += `### Description\n\n${description.replace(/\n\n/g, '\n\n')}\n\n`;
    }
    
    if (zoneOfGenius) {
      content += `### Zone of Genius\n\n${zoneOfGenius.replace(/\n\n/g, '\n\n')}\n\n`;
    }
    
    if (motivation) {
      content += `### Motivation & Business Applications\n\n${motivation.replace(/\n\n/g, '\n\n')}\n\n`;
    }
    
    content += `**Card:** ${card}\n`;
    content += `**Category:** Cardology Business Profile\n\n`;
    content += `---\n\n`;
  }
  
  console.log(`✅ Processed ${profiles.length} card profiles`);
  return content;
}

/**
 * Format Card Activities into text
 */
async function formatCardActivities() {
  console.log('📚 Processing Card Activities...');
  
  const jsonPath = path.join(DATA_DIR, 'cardToActivities.json');
  const jsonContent = await fs.readFile(jsonPath, 'utf8');
  const activities = JSON.parse(jsonContent);
  
  let content = `# Card-Specific Entrepreneurial Activations

This book provides specific entrepreneurial guidance and business strategies for each card. When a particular card is active in your spread or represents your birth card, these are the aligned actions and focus areas.

---

`;

  const cards = Object.keys(activities);
  
  for (const card of cards) {
    const activation = activities[card].entrepreneurialActivation || '';
    
    content += `## ${card} - Entrepreneurial Activation\n\n`;
    
    if (activation) {
      // Parse out focus and aligned actions
      const parts = activation.split('Aligned Actions:');
      const focus = parts[0].replace('Focus:', '').trim();
      const actions = parts[1] ? parts[1].trim() : '';
      
      if (focus) {
        content += `### Focus Areas\n\n${focus}\n\n`;
      }
      
      if (actions) {
        content += `### Aligned Actions\n\n${actions}\n\n`;
      }
    }
    
    content += `**Card:** ${card}\n`;
    content += `**Category:** Business Strategy & Activation\n\n`;
    content += `---\n\n`;
  }
  
  console.log(`✅ Processed ${cards.length} card activations`);
  return content;
}

/**
 * Format Planetary Periods into text
 */
async function formatPlanetaryPeriods() {
  console.log('📚 Processing Planetary Periods...');
  
  const jsonPath = path.join(DATA_DIR, 'planetaryPeriods.json');
  const jsonContent = await fs.readFile(jsonPath, 'utf8');
  const periods = JSON.parse(jsonContent);
  
  let content = `# Planetary Periods & Business Timing

This book explains the planetary periods system in cardology and how different planetary influences affect business decisions, timing, and strategy throughout the year.

---

## Understanding Planetary Periods

Each year of your life is influenced by a specific planetary energy. Understanding these periods helps you time major business decisions, launches, and strategic pivots for maximum alignment and success.

---

`;

  // Group by card if data is structured that way, otherwise list all periods
  if (Array.isArray(periods)) {
    for (const period of periods) {
      content += `## Age ${period.age || 'Unknown'} - ${period.planet || 'Planetary'} Period\n\n`;
      
      if (period.description) {
        content += `${period.description}\n\n`;
      }
      
      if (period.businessGuidance) {
        content += `### Business Guidance\n\n${period.businessGuidance}\n\n`;
      }
      
      if (period.timing) {
        content += `**Timing:** ${period.timing}\n\n`;
      }
      
      content += `---\n\n`;
    }
  } else {
    // Handle object structure
    for (const [key, value] of Object.entries(periods)) {
      content += `## ${key}\n\n`;
      
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          content += `### ${subKey}\n\n${subValue}\n\n`;
        }
      } else {
        content += `${value}\n\n`;
      }
      
      content += `---\n\n`;
    }
  }
  
  console.log(`✅ Processed planetary periods`);
  return content;
}

/**
 * Format Yearly Forecasts into text
 */
async function formatYearlyForecasts() {
  console.log('📚 Processing Yearly Forecasts...');
  
  const jsonPath = path.join(DATA_DIR, 'yearlyForecasts.json');
  const jsonContent = await fs.readFile(jsonPath, 'utf8');
  const forecasts = JSON.parse(jsonContent);
  
  let content = `# Yearly Business Forecasts

This book provides yearly forecasts and guidance for each card, helping you understand what themes, opportunities, and challenges to expect in any given year.

---

`;

  if (Array.isArray(forecasts)) {
    for (const forecast of forecasts) {
      content += `## ${forecast.card || 'Card'} - ${forecast.year || 'Year'} Forecast\n\n`;
      
      if (forecast.overview) {
        content += `### Overview\n\n${forecast.overview}\n\n`;
      }
      
      if (forecast.businessOpportunities) {
        content += `### Business Opportunities\n\n${forecast.businessOpportunities}\n\n`;
      }
      
      if (forecast.challenges) {
        content += `### Potential Challenges\n\n${forecast.challenges}\n\n`;
      }
      
      if (forecast.advice) {
        content += `### Strategic Advice\n\n${forecast.advice}\n\n`;
      }
      
      content += `---\n\n`;
    }
  } else {
    for (const [card, forecast] of Object.entries(forecasts)) {
      content += `## ${card} Forecast\n\n`;
      
      if (typeof forecast === 'object') {
        for (const [key, value] of Object.entries(forecast)) {
          const title = key.replace(/([A-Z])/g, ' $1').trim();
          content += `### ${title}\n\n${value}\n\n`;
        }
      } else {
        content += `${forecast}\n\n`;
      }
      
      content += `---\n\n`;
    }
  }
  
  console.log(`✅ Processed yearly forecasts`);
  return content;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Preparing Book Files from Data Sources\n');
    console.log('='.repeat(60) + '\n');
    
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
    
    // Process each data source
    const books = [
      {
        filename: 'card-profiles.txt',
        generator: formatCardProfiles,
        title: 'MDBC Card Profiles'
      },
      {
        filename: 'card-activations.txt',
        generator: formatCardActivities,
        title: 'Entrepreneurial Activations'
      },
      {
        filename: 'planetary-periods.txt',
        generator: formatPlanetaryPeriods,
        title: 'Planetary Periods Guide'
      },
      {
        filename: 'yearly-forecasts.txt',
        generator: formatYearlyForecasts,
        title: 'Yearly Forecasts'
      }
    ];
    
    const exportedFiles = [];
    
    for (const book of books) {
      try {
        const content = await book.generator();
        const filepath = path.join(OUTPUT_DIR, book.filename);
        
        await fs.writeFile(filepath, content, 'utf8');
        
        const stats = await fs.stat(filepath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        console.log(`✅ ${book.filename}`);
        console.log(`   Title: ${book.title}`);
        console.log(`   Size: ${sizeKB} KB\n`);
        
        exportedFiles.push({
          filename: book.filename,
          title: book.title,
          size: sizeKB
        });
        
      } catch (error) {
        console.error(`❌ Error creating ${book.filename}:`, error.message);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Export Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${exportedFiles.length} book files`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('');
    
    console.log('📄 Created Files:');
    for (const file of exportedFiles) {
      console.log(`   - ${file.filename} (${file.size} KB)`);
    }
    
    console.log('\n✅ Book preparation complete!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Review the files in ./data/books/');
    console.log('   2. Run: node scripts/2-setup-vector-store.js');
    console.log('   3. This will upload the files to OpenAI Vector Store');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();

