/**
 * MDBC Card Profiles CSV Data Retrieval
 * Handles birth card profile information from MDBC Card Profiles.csv
 */

import { parseCSV, findRowWhere } from './csvParser.js';

let cardProfilesData = null;

/**
 * Load and parse MDBC card profiles CSV data
 * @returns {Promise<Array<Object>>} Parsed CSV data
 */
async function loadCardProfilesData() {
  if (cardProfilesData) return cardProfilesData;
  
  try {
    const response = await fetch('/data/MDBC Card Profiles.csv');
    if (!response.ok) {
      throw new Error(`Failed to load MDBC Card Profiles.csv: ${response.status}`);
    }
    
    const csvContent = await response.text();
    cardProfilesData = parseCSV(csvContent);
    
    console.log(`Loaded ${cardProfilesData.length} card profile records`);
    console.log('First profile record:', cardProfilesData[0]);
    console.log('Available headers:', cardProfilesData.length > 0 ? Object.keys(cardProfilesData[0]) : 'No data');
    return cardProfilesData;
    
  } catch (error) {
    console.error('Error loading card profiles data:', error);
    return [];
  }
}

/**
 * Get birth card profile from MDBC Card Profiles.csv
 * @param {string} card - Birth card (e.g., "A♥", "K♠")
 * @returns {Promise<Object>} Birth card profile data
 */
export async function getBirthCardProfile(card) {
  try {
    console.log(`Looking up birth card profile for: "${card}"`);
    
    // Load data
    const data = await loadCardProfilesData();
    if (!data || data.length === 0) {
      console.warn('No card profiles data available');
      return null;
    }
    
    // Log available cards for debugging
    const availableCards = data.map(row => row['Card']).filter(Boolean);
    console.log('Available cards in CSV:', availableCards.slice(0, 5));
    
    // Find row matching the card
    const row = findRowWhere(data, {
      'Card': card
    });
    
    if (!row) {
      console.warn(`No profile found for card "${card}". Available cards:`, availableCards);
      return null;
    }
    
    // Clean and normalize the row data
    const description = row['Description'] || '';
    const zoneOfGenius = row['Zone of Genius'] || '';
    const howToMotivate = row[' How to Motivate'] || row['How to Motivate'] || '';
    
    const profile = {
      card: card,
      description: description.replace(/^"|"$/g, '').trim(), // Remove surrounding quotes
      zoneOfGenius: zoneOfGenius.replace(/^"|"$/g, '').trim(),
      howToMotivate: howToMotivate.replace(/^"|"$/g, '').trim()
    };
    
    console.log(`Birth card profile found for ${card}:`, profile);
    return profile;
    
  } catch (error) {
    console.error('Error fetching birth card profile:', error);
    return null;
  }
}

/**
 * Format birth card profile for modal display
 * @param {Object} profile - Profile object from getBirthCardProfile
 * @returns {string} Formatted profile content for modal
 */
export function formatBirthCardProfileForModal(profile) {
  if (!profile) return 'Birth card profile not available.';
  
  let content = '';
  
  if (profile.description) {
    content += profile.description;
  }
  
  if (profile.zoneOfGenius) {
    // Check if zoneOfGenius already contains "Zone of Genius:" to avoid duplication
    const zoneContent = profile.zoneOfGenius.includes('Zone of Genius:') 
      ? profile.zoneOfGenius 
      : `**Zone of Genius:**\n${profile.zoneOfGenius}`;
    content += `\n\n${zoneContent}`;
  }
  
  if (profile.howToMotivate) {
    // Check if howToMotivate already contains "How to Motivate:" to avoid duplication
    const motivateContent = profile.howToMotivate.includes('How to Motivate:') || profile.howToMotivate.includes('Motivation:')
      ? profile.howToMotivate 
      : `**How to Motivate:**\n${profile.howToMotivate}`;
    content += `\n\n${motivateContent}`;
  }
  
  return content || 'Birth card profile not available.';
}