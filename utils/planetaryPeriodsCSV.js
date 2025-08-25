/**
 * Planetary Periods CSV Data Retrieval  
 * Implements STEP 4 logic from the specification
 */

import { parseCSV, normalizeBirthCardForCSV, findRowWhere, cardToSlug } from './csvParser.js';

let planetaryPeriodsData = null;

/**
 * Load and parse planetary periods CSV data
 * @returns {Promise<Array<Object>>} Parsed CSV data
 */
async function loadPlanetaryPeriodsData() {
  if (planetaryPeriodsData) return planetaryPeriodsData;
  
  try {
    const response = await fetch('/data/Planetary Periods.csv');
    if (!response.ok) {
      throw new Error(`Failed to load Planetary Periods.csv: ${response.status}`);
    }
    
    const csvContent = await response.text();
    planetaryPeriodsData = parseCSV(csvContent);
    
    console.log(`Loaded ${planetaryPeriodsData.length} planetary period records`);
    return planetaryPeriodsData;
    
  } catch (error) {
    console.error('Error loading planetary periods data:', error);
    return [];
  }
}

/**
 * Get start dates for planetary periods based on birthday
 * @param {string} birthDate - Birth date in "Month Day" format (e.g., "January 1")
 * @returns {Promise<Object>} Object mapping period names to start dates
 */
export async function getPlanetaryPeriodStartDates(birthDate) {
  try {
    const data = await loadPlanetaryPeriodsData();
    if (!data || data.length === 0) {
      console.warn('No planetary periods data available');
      return {};
    }
    
    // Find row by birthday (assuming BIRTHDAY column matches "Month Day" format)
    const row = findRowWhere(data, {
      'BIRTHDAY': birthDate
    });
    
    if (!row) {
      console.warn(`No planetary periods found for birthday "${birthDate}"`);
      return {};
    }
    
    // Build start dates object
    const startDates = {
      Mercury: row["MERCURY"] || '',
      Venus: row["VENUS"] || '',
      Mars: row["MARS"] || '',
      Jupiter: row["JUPITER"] || '',
      Saturn: row["SATURN"] || '',
      Uranus: row["URANUS"] || '',
      Neptune: row["NEPTUNE"] || ''
    };
    
    console.log('Planetary period start dates:', startDates);
    return startDates;
    
  } catch (error) {
    console.error('Error fetching planetary period start dates:', error);
    return {};
  }
}

/**
 * Get card image path with fallback
 * @param {string} card - Card in format "K♠"
 * @returns {string} Image path
 */
export function getCardImagePath(card) {
  if (!card || card.trim() === '') {
    return '/cards/card-back.png';
  }
  
  // Convert card format (e.g., "K♠" -> "KS.png")
  const cardMapping = {
    '♠': 'S', '♣': 'C', '♦': 'D', '♥': 'H'
  };
  
  const match = card.match(/^([2-9JQKA]|10)([♠♣♦♥])$/);
  if (!match) return '/cards/card-back.png';
  
  const [, rank, suit] = match;
  const suitCode = cardMapping[suit] || 'S';
  
  return `/cards/${rank}${suitCode}.png`;
}

/**
 * Determine current planetary period based on today's date
 * Returns the latest period whose start date ≤ today among planetary periods
 * @param {Object} startDates - Start dates object from getPlanetaryPeriodStartDates
 * @returns {string|null} Current period name or null
 */
export function getCurrentPlanetaryPeriod(startDates) {
  const today = new Date();
  const currentDateString = formatDateForComparison(today);
  
  // Planetary periods only (not strategic outlook cards)
  const planetaryPeriods = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
  
  let currentPeriod = null;
  let latestStartDate = null;
  
  for (const period of planetaryPeriods) {
    const startDateString = startDates[period];
    if (!startDateString) continue;
    
    try {
      const startDate = parsePlanetaryDate(startDateString, today.getFullYear());
      
      // Check if this period has started (start date ≤ today)
      if (startDate <= today) {
        // Check if this is the latest period that has started
        if (!latestStartDate || startDate > latestStartDate) {
          latestStartDate = startDate;
          currentPeriod = period;
        }
      }
    } catch (error) {
      console.warn(`Invalid start date for ${period}: ${startDateString}`);
    }
  }
  
  return currentPeriod;
}

/**
 * Parse planetary period date string to Date object
 * Handles formats like "1/1", "12/30", etc.
 * @param {string} dateString - Date string from CSV
 * @param {number} year - Year to use for the date
 * @returns {Date} Parsed date
 */
function parsePlanetaryDate(dateString, year) {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Invalid date string');
  }
  
  const parts = dateString.split('/');
  if (parts.length !== 2) {
    throw new Error('Date must be in MM/DD format');
  }
  
  const month = parseInt(parts[0], 10) - 1; // JavaScript months are 0-based
  const day = parseInt(parts[1], 10);
  
  if (isNaN(month) || isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
    throw new Error('Invalid month or day values');
  }
  
  return new Date(year, month, day);
}

/**
 * Format date for comparison purposes
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateForComparison(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Format start date for display with 2-digit year
 * @param {string} startDate - Start date string like "1/1"
 * @returns {string} Formatted display string like "Jan 1 '25"
 */
export function formatStartDateForDisplay(startDate) {
  if (!startDate) return '';
  
  try {
    const currentYear = new Date().getFullYear();
    const date = parsePlanetaryDate(startDate, currentYear);
    
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const twoDigitYear = currentYear.toString().slice(-2);
    
    return `${month} ${day} '${twoDigitYear}`;
    
  } catch (error) {
    console.warn(`Error formatting start date "${startDate}":`, error);
    return startDate; // Return original if parsing fails
  }
}

/**
 * Enrich forecast data with planetary period information
 * Combines yearly forecast with start dates and current period detection
 * @param {Object} forecast - Forecast from fetchYearlyForecastData
 * @param {string} birthDate - Birth date for period lookup
 * @returns {Promise<Object>} Enriched data with periods array and currentPeriod
 */
export async function enrichForecastWithPlanetaryPeriods(forecast, birthDate) {
  try {
    // Get start dates for this birthday
    const startDates = await getPlanetaryPeriodStartDates(birthDate);
    
    // Determine current period
    const currentPeriod = getCurrentPlanetaryPeriod(startDates);
    
    // Build enriched periods array
    const PERIOD_ORDER = [
      "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
      "LongRange", "Pluto", "Result", "Support", "Development"
    ];
    
    const periods = PERIOD_ORDER.map(period => {
      const card = forecast[period];
      if (!card) return null;
      
      const isPlanetary = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"].includes(period);
      const isStrategic = ["LongRange", "Pluto", "Result", "Support", "Development"].includes(period);
      
      return {
        period,
        card,
        displayName: period === "LongRange" ? "Long Range" : period,
        isPlanetary,
        isStrategic,
        startDate: isPlanetary ? startDates[period] : null,
        formattedStartDate: isPlanetary ? formatStartDateForDisplay(startDates[period]) : null,
        imagePath: getCardImagePath(card),
        isCurrent: period === currentPeriod
      };
    }).filter(Boolean);
    
    return {
      periods,
      currentPeriod,
      startDates
    };
    
  } catch (error) {
    console.error('Error enriching forecast with planetary periods:', error);
    return {
      periods: [],
      currentPeriod: null,
      startDates: {}
    };
  }
}