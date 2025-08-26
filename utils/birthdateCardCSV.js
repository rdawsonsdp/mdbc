/**
 * Birth Card CSV Data Retrieval
 * Implements STEP 1 logic from the specification
 */

import { parseCSV, findRowWhere } from './csvParser.js';

let birthdateCardData = null;

/**
 * Load and parse birthdate to card CSV data
 * @returns {Promise<Array<Object>>} Parsed CSV data
 */
async function loadBirthdateCardData() {
  if (birthdateCardData) return birthdateCardData;
  
  try {
    const response = await fetch('/data/Birthdate to Card.csv');
    if (!response.ok) {
      throw new Error(`Failed to load Birthdate to Card.csv: ${response.status}`);
    }
    
    const csvContent = await response.text();
    birthdateCardData = parseCSV(csvContent);
    
    console.log(`Loaded ${birthdateCardData.length} birthdate to card records`);
    return birthdateCardData;
    
  } catch (error) {
    console.error('Error loading birthdate to card data:', error);
    return [];
  }
}

/**
 * Get birth card from date using CSV data
 * Implements STEP 1 from specification
 * @param {number} month - Month (1-12)
 * @param {number} day - Day (1-31) 
 * @returns {Promise<Object>} Birth card data
 */
export async function getBirthCardFromDateCSV(month, day) {
  try {
    // Convert month number to month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[month - 1];
    const dateKey = `${monthName} ${day}`;
    
    console.log(`Looking up birth card for date key: "${dateKey}"`);
    
    // Load data
    const data = await loadBirthdateCardData();
    if (!data || data.length === 0) {
      console.warn('No birthdate card data available');
      return { card: 'Unknown', name: 'Unknown Card' };
    }
    
    // Find row matching the date
    const row = findRowWhere(data, {
      'Date': dateKey
    });
    
    if (!row) {
      console.warn(`No birth card found for date "${dateKey}"`);
      return { card: 'Unknown', name: 'Unknown Card' };
    }
    
    const birthCardRaw = row['Card'];
    const cardName = row['Card Name'] || birthCardRaw;
    
    console.log(`Birth card found: "${birthCardRaw}" (${cardName})`);
    
    return { 
      card: birthCardRaw,  // Already in correct format like "A♥"
      name: cardName,
      dateKey: dateKey
    };
    
  } catch (error) {
    console.error('Error fetching birth card:', error);
    return { card: 'Unknown', name: 'Unknown Card' };
  }
}

