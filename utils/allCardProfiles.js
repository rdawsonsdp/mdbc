/**
 * All Card Profiles Loader
 * 
 * Loads ALL 52 card profiles into memory for instant querying
 * Used to answer questions like "What does my Long Range card say?"
 */

import { parseCSV } from './csvParser.js';

let allCardProfiles = null;

/**
 * Load and cache ALL card profiles from CSV
 * @returns {Promise<Object>} Object keyed by card (e.g., { "A♥": {...}, "2♠": {...} })
 */
export async function loadAllCardProfiles() {
  if (allCardProfiles) {
    return allCardProfiles;
  }

  try {
    const response = await fetch('/data/MDBC Card Profiles.csv');
    if (!response.ok) {
      throw new Error(`Failed to load card profiles: ${response.status}`);
    }

    const csvContent = await response.text();
    const data = parseCSV(csvContent);

    // Convert array to object keyed by card for fast lookup
    allCardProfiles = {};
    
    data.forEach(row => {
      const card = row['Card'];
      if (card) {
        allCardProfiles[card] = {
          card: card,
          description: cleanText(row['Description'] || ''),
          zoneOfGenius: cleanText(row['Zone of Genius'] || ''),
          howToMotivate: cleanText(row[' How to Motivate'] || row['How to Motivate'] || '')
        };
      }
    });

    console.log(`✅ Loaded ${Object.keys(allCardProfiles).length} card profiles into session`);
    return allCardProfiles;

  } catch (error) {
    console.error('❌ Error loading all card profiles:', error);
    return {};
  }
}

/**
 * Get profile for a specific card
 * @param {string} card - Card to lookup (e.g., "A♥", "K♠")
 * @returns {Object|null} Card profile or null if not found
 */
export function getCardProfile(card) {
  if (!allCardProfiles) {
    console.warn('Card profiles not loaded yet. Call loadAllCardProfiles() first.');
    return null;
  }

  return allCardProfiles[card] || null;
}

/**
 * Clean text from CSV (remove quotes, extra whitespace)
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/^"|"$/g, '') // Remove surrounding quotes
    .trim();
}

/**
 * Format card profile for chat response
 * @param {Object} profile - Card profile object
 * @param {string} context - Context (e.g., "Long Range", "Birth Card", "Mercury Period")
 * @returns {string} Formatted markdown text
 */
export function formatCardProfileForChat(profile, context = '') {
  if (!profile) return null;

  let response = '';

  // Add context header
  if (context) {
    response += `**Your ${context}:** ${profile.card}\n\n`;
  } else {
    response += `**${profile.card}**\n\n`;
  }

  // Add description
  if (profile.description) {
    response += `${profile.description}\n\n`;
  }

  // Add Zone of Genius
  if (profile.zoneOfGenius) {
    response += `**Zone of Genius:**\n${profile.zoneOfGenius}\n\n`;
  }

  // Add How to Motivate
  if (profile.howToMotivate) {
    response += `**How to Motivate:**\n${profile.howToMotivate}`;
  }

  return response.trim();
}

/**
 * Search for a card profile by partial name
 * Useful for queries like "what does the ace of hearts say?"
 * @param {string} searchTerm - Card name to search for
 * @returns {Object|null} Card profile or null
 */
export function searchCardByName(searchTerm) {
  if (!allCardProfiles) return null;

  const term = searchTerm.toLowerCase().trim();

  // Create a mapping of common card names
  const cardNameMap = {
    'ace of hearts': 'A♥',
    'ace of diamonds': 'A♦',
    'ace of clubs': 'A♣',
    'ace of spades': 'A♠',
    'two of hearts': '2♥',
    'two of diamonds': '2♦',
    'two of clubs': '2♣',
    'two of spades': '2♠',
    'three of hearts': '3♥',
    'three of diamonds': '3♦',
    'three of clubs': '3♣',
    'three of spades': '3♠',
    'four of hearts': '4♥',
    'four of diamonds': '4♦',
    'four of clubs': '4♣',
    'four of spades': '4♠',
    'five of hearts': '5♥',
    'five of diamonds': '5♦',
    'five of clubs': '5♣',
    'five of spades': '5♠',
    'six of hearts': '6♥',
    'six of diamonds': '6♦',
    'six of clubs': '6♣',
    'six of spades': '6♠',
    'seven of hearts': '7♥',
    'seven of diamonds': '7♦',
    'seven of clubs': '7♣',
    'seven of spades': '7♠',
    'eight of hearts': '8♥',
    'eight of diamonds': '8♦',
    'eight of clubs': '8♣',
    'eight of spades': '8♠',
    'nine of hearts': '9♥',
    'nine of diamonds': '9♦',
    'nine of clubs': '9♣',
    'nine of spades': '9♠',
    'ten of hearts': '10♥',
    'ten of diamonds': '10♦',
    'ten of clubs': '10♣',
    'ten of spades': '10♠',
    'jack of hearts': 'J♥',
    'jack of diamonds': 'J♦',
    'jack of clubs': 'J♣',
    'jack of spades': 'J♠',
    'queen of hearts': 'Q♥',
    'queen of diamonds': 'Q♦',
    'queen of clubs': 'Q♣',
    'queen of spades': 'Q♠',
    'king of hearts': 'K♥',
    'king of diamonds': 'K♦',
    'king of clubs': 'K♣',
    'king of spades': 'K♠',
  };

  // Try direct lookup from map
  const cardSymbol = cardNameMap[term];
  if (cardSymbol && allCardProfiles[cardSymbol]) {
    return allCardProfiles[cardSymbol];
  }

  // Try direct symbol lookup (e.g., "9♠")
  if (allCardProfiles[searchTerm]) {
    return allCardProfiles[searchTerm];
  }

  return null;
}

