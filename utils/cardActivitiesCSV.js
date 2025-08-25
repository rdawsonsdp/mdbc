/**
 * Card Activities CSV Data Retrieval
 * Implements STEP 5 logic from the specification
 * Fixes the broken JSON parsing by going directly to CSV
 */

import { parseCSV, findRowWhere } from './csvParser.js';

let cardActivitiesData = null;

/**
 * Load and parse card activities CSV data
 * @returns {Promise<Array<Object>>} Parsed CSV data
 */
async function loadCardActivitiesData() {
  if (cardActivitiesData) return cardActivitiesData;
  
  try {
    const response = await fetch('/data/Card to Activities MDBC.csv');
    if (!response.ok) {
      throw new Error(`Failed to load Card to Activities MDBC.csv: ${response.status}`);
    }
    
    const csvContent = await response.text();
    cardActivitiesData = parseCSV(csvContent);
    
    console.log(`Loaded ${cardActivitiesData.length} card activity records`);
    return cardActivitiesData;
    
  } catch (error) {
    console.error('Error loading card activities data:', error);
    return [];
  }
}

/**
 * Get entrepreneurial activation text for a specific card
 * @param {string} card - Card in any format (e.g., "K♠", "K ♠", "King of Spades")
 * @returns {Promise<string>} Entrepreneurial activation text or empty string
 */
export async function getCardActivation(card) {
  if (!card || card.trim() === '') {
    return '';
  }
  
  try {
    const data = await loadCardActivitiesData();
    if (!data || data.length === 0) {
      console.warn('No card activities data available');
      return '';
    }
    
    // Try to find the card by direct match first
    let row = findRowWhere(data, { 'Card': card.trim() });
    
    // If not found, try with normalized card format (remove spaces)
    if (!row && card.includes(' ')) {
      const normalizedCard = card.replace(/\s+/g, '');
      row = findRowWhere(data, { 'Card': normalizedCard });
    }
    
    // If still not found, try to find by searching for card symbol
    if (!row) {
      row = data.find(r => r.Card && r.Card.trim() === card.trim());
    }
    
    if (!row) {
      console.warn(`No activation found for card "${card}"`);
      return '';
    }
    
    const activation = row['Entrepreneurial Activation'] || '';
    return activation.trim();
    
  } catch (error) {
    console.error(`Error getting activation for card "${card}":`, error);
    return '';
  }
}

/**
 * Get activations for multiple cards (bulk lookup)
 * Implements the for-each logic from STEP 5
 * @param {Array<string>} cards - Array of card names
 * @returns {Promise<Object>} Object mapping card names to activation text
 */
export async function getActivationsForCards(cards) {
  const activations = {};
  
  for (const card of cards) {
    if (card && card.trim() !== '') {
      activations[card] = await getCardActivation(card);
    }
  }
  
  return activations;
}

/**
 * Get activations for a complete forecast
 * Takes a forecast object and returns activations for all non-empty cards
 * @param {Object} forecast - Forecast object with Mercury, Venus, etc.
 * @returns {Promise<Object>} Object with same structure but activation text values
 */
export async function getActivationsForForecast(forecast) {
  if (!forecast || typeof forecast !== 'object') {
    return {};
  }
  
  const activations = {};
  const periods = [
    'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
    'LongRange', 'Pluto', 'Result', 'Support', 'Development'
  ];
  
  for (const period of periods) {
    const card = forecast[period];
    if (card && card.trim() !== '') {
      activations[period] = await getCardActivation(card);
    } else {
      activations[period] = '';
    }
  }
  
  return activations;
}

/**
 * Create a proper cardToActivities.json replacement object
 * Loads all card activities and returns as a clean object
 * @returns {Promise<Object>} Clean card to activities mapping
 */
export async function generateCardToActivitiesObject() {
  try {
    const data = await loadCardActivitiesData();
    const activities = {};
    
    for (const row of data) {
      const card = row.Card?.trim();
      const activation = row['Entrepreneurial Activation']?.trim();
      
      if (card && activation) {
        activities[card] = {
          entrepreneurialActivation: activation
        };
      }
    }
    
    console.log(`Generated activities object with ${Object.keys(activities).length} cards`);
    return activities;
    
  } catch (error) {
    console.error('Error generating card to activities object:', error);
    return {};
  }
}

/**
 * Helper function to check if card has activation data
 * @param {string} card - Card to check
 * @returns {Promise<boolean>} True if card has activation data
 */
export async function hasCardActivation(card) {
  const activation = await getCardActivation(card);
  return activation.length > 0;
}