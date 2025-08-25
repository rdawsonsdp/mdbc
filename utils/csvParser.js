/**
 * CSV parsing utilities for MDBC card data
 * Handles CSV files with proper string parsing and normalization
 */

/**
 * Simple CSV parser that handles quoted strings with newlines
 * @param {string} csvContent - Raw CSV content
 * @returns {Array<Object>} Parsed rows as objects
 */
export function parseCSV(csvContent) {
  const lines = [];
  const rows = [];
  let currentLine = '';
  let inQuotes = false;
  
  // Split into lines while respecting quoted content
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine.trim());
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  
  // Add the last line if there's content
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  // Remove BOM if present and filter empty lines
  const cleanLines = lines
    .map(line => line.replace(/^\uFEFF/, ''))
    .filter(line => line.length > 0);
  
  if (cleanLines.length === 0) return [];
  
  // Parse headers
  const headers = parseCSVLine(cleanLines[0]);
  
  // Parse data rows
  for (let i = 1; i < cleanLines.length; i++) {
    const values = parseCSVLine(cleanLines[i]);
    if (values.length > 0) {
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      rows.push(row);
    }
  }
  
  return rows;
}

/**
 * Parse a single CSV line respecting quoted content
 * @param {string} line - CSV line to parse
 * @returns {Array<string>} Parsed values
 */
function parseCSVLine(line) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Handle escaped quotes
      if (inQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue);
  
  return values;
}

/**
 * Normalize birth card format for CSV matching
 * Converts display format to CSV format
 * @param {string} birthCard - Birth card in display format (e.g., "K ♠", "King of Spades")
 * @returns {string} Normalized card for CSV lookup
 */
export function normalizeBirthCardForCSV(birthCard) {
  if (!birthCard) return '';
  
  // Handle different input formats
  let card = birthCard.toString().trim();
  
  // If it's already in short format (e.g., "K♠"), return as-is
  if (/^[2-9JQKA][♠♣♦♥]$/.test(card)) {
    return card;
  }
  
  // If it has spaces (e.g., "K ♠"), remove them
  if (/^[2-9JQKA]\s+[♠♣♦♥]$/.test(card)) {
    return card.replace(/\s+/g, '');
  }
  
  // Convert from full name format
  const cardMap = {
    'Ace': 'A', 'Two': '2', 'Three': '3', 'Four': '4', 'Five': '5',
    'Six': '6', 'Seven': '7', 'Eight': '8', 'Nine': '9', 'Ten': '10',
    'Jack': 'J', 'Queen': 'Q', 'King': 'K'
  };
  
  const suitMap = {
    'Hearts': '♥', 'Diamonds': '♦', 'Clubs': '♣', 'Spades': '♠',
    'Heart': '♥', 'Diamond': '♦', 'Club': '♣', 'Spade': '♠'
  };
  
  // Parse "King of Spades" format
  const fullNameMatch = card.match(/^(\w+)\s+of\s+(\w+)$/i);
  if (fullNameMatch) {
    const [, rank, suit] = fullNameMatch;
    const normalizedRank = cardMap[rank] || rank;
    const normalizedSuit = suitMap[suit] || suit;
    return normalizedRank + normalizedSuit;
  }
  
  // Return as-is if no conversion needed
  return card;
}

/**
 * Trim headers and remove empty columns
 * @param {Array<string>} headers - Raw headers array
 * @returns {Array<string>} Cleaned headers
 */
export function trimHeaders(headers) {
  return headers
    .map(h => h.trim())
    .filter(h => h.length > 0);
}

/**
 * Find row in data array matching conditions
 * @param {Array<Object>} data - Data array to search
 * @param {Object} conditions - Conditions to match (key: value pairs)
 * @returns {Object|null} First matching row or null
 */
export function findRowWhere(data, conditions) {
  return data.find(row => {
    return Object.entries(conditions).every(([key, value]) => {
      return row[key] === value;
    });
  }) || null;
}

/**
 * Format card name for image path
 * @param {string} card - Card in format "K♠"
 * @returns {string} Slug for image filename
 */
export function cardToSlug(card) {
  if (!card) return 'card-back';
  
  const suitMap = {
    '♠': 'spades',
    '♣': 'clubs', 
    '♦': 'diamonds',
    '♥': 'hearts'
  };
  
  const rankMap = {
    'A': 'ace',
    '2': '2', '3': '3', '4': '4', '5': '5',
    '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
    'J': 'jack',
    'Q': 'queen', 
    'K': 'king'
  };
  
  // Parse card (e.g., "K♠" -> "king-of-spades")
  const match = card.match(/^([2-9JQKA]|10)([♠♣♦♥])$/);
  if (!match) return 'card-back';
  
  const [, rank, suit] = match;
  const rankName = rankMap[rank] || rank.toLowerCase();
  const suitName = suitMap[suit] || 'spades';
  
  return `${rankName}-of-${suitName}`;
}