/**
 * Yearly Forecasts CSV Data Retrieval
 * Implements STEP 3 logic from the specification
 */

import { parseCSV, normalizeBirthCardForCSV, findRowWhere } from './csvParser.js';

let yearlyForecastsData = null;

/**
 * Load and parse yearly forecasts CSV data
 * @returns {Promise<Array<Object>>} Parsed CSV data
 */
async function loadYearlyForecastsData() {
  if (yearlyForecastsData) return yearlyForecastsData;
  
  try {
    const response = await fetch('/data/Yearly Forecasts.csv');
    if (!response.ok) {
      throw new Error(`Failed to load Yearly Forecasts.csv: ${response.status}`);
    }
    
    const csvContent = await response.text();
    yearlyForecastsData = parseCSV(csvContent);
    
    console.log(`Loaded ${yearlyForecastsData.length} yearly forecast records`);
    return yearlyForecastsData;
    
  } catch (error) {
    console.error('Error loading yearly forecasts data:', error);
    return [];
  }
}

/**
 * Fetch yearly forecast data for specific birth card and age
 * Implements the exact logic from STEP 3 specification
 * 
 * @param {string} birthCard - Birth card (e.g., "King of Spades", "K♠", "K ♠") 
 * @param {number|string} age - Age to look up
 * @returns {Promise<Object>} Forecast object with all periods
 */
export async function fetchYearlyForecastData(birthCard, age) {
  try {
    // Load data
    const data = await loadYearlyForecastsData();
    if (!data || data.length === 0) {
      console.warn('No yearly forecasts data available');
      return getEmptyForecast();
    }
    
    // Normalize inputs for CSV matching
    const bc = normalizeBirthCardForCSV(birthCard);  // exact match to CSV, e.g., "5♦"
    const a = String(Number(age));                   // compare as string
    
    console.log(`Looking up forecast for birth card: "${bc}", age: "${a}"`);
    console.log(`First few rows of data:`, data.slice(0, 3));
    console.log(`Headers:`, data.length > 0 ? Object.keys(data[0]) : 'No data');
    
    // Find the row where (Birth Card == bc) && (AGE == a)
    const row = findRowWhere(data, {
      'Birth Card': bc,
      'AGE': a
    });
    
    if (!row) {
      console.warn(`No forecast found for birth card "${bc}" at age "${a}"`);
      return getEmptyForecast();
    }
    
    // Build forecast object with exact CSV values
    const forecast = {
      Mercury:     cleanCardValue(row["Mercury"]),
      Venus:       cleanCardValue(row["Venus"]),
      Mars:        cleanCardValue(row["Mars"]),
      Jupiter:     cleanCardValue(row["Jupiter"]),
      Saturn:      cleanCardValue(row["Saturn"]),
      Uranus:      cleanCardValue(row["Uranus"]),
      Neptune:     cleanCardValue(row["Neptune"]),
      LongRange:   cleanCardValue(row["LONG RANGE"]),
      Pluto:       cleanCardValue(row["PLUTO"]),
      Result:      cleanCardValue(row["RESULT"]),
      Support:     cleanCardValue(row["SUPPORT"]),        
      Development: cleanCardValue(row["DEVELOPMENT"])     
    };
    
    console.log('Forecast retrieved:', forecast);
    return forecast;
    
  } catch (error) {
    console.error('Error fetching yearly forecast:', error);
    return getEmptyForecast();
  }
}

/**
 * Clean and validate card values from CSV
 * @param {string} value - Raw CSV value
 * @returns {string} Cleaned card value or empty string
 */
function cleanCardValue(value) {
  if (!value || value.trim() === '' || value.toLowerCase() === 'none') {
    return '';
  }
  return value.trim();
}

/**
 * Get empty forecast object
 * @returns {Object} Empty forecast with all fields
 */
function getEmptyForecast() {
  return {
    Mercury: '',
    Venus: '',
    Mars: '',
    Jupiter: '',
    Saturn: '',
    Uranus: '',
    Neptune: '',
    LongRange: '',
    Pluto: '',
    Result: '',
    Support: '',
    Development: ''
  };
}

/**
 * Get canonical period order as specified
 * @returns {Array<string>} Period names in canonical order
 */
export function getCanonicalPeriodOrder() {
  return [
    "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
    "LongRange", "Pluto", "Result", "Support", "Development"
  ];
}

/**
 * Convert forecast object to ordered array with period metadata
 * @param {Object} forecast - Forecast object from fetchYearlyForecastData
 * @returns {Array<Object>} Array of period objects with card, type, and name
 */
export function formatForecastForDisplay(forecast) {
  const order = getCanonicalPeriodOrder();
  const displayNames = {
    Mercury: "Mercury",
    Venus: "Venus", 
    Mars: "Mars",
    Jupiter: "Jupiter",
    Saturn: "Saturn",
    Uranus: "Uranus",
    Neptune: "Neptune",
    LongRange: "Long Range",
    Pluto: "Pluto",
    Result: "Result",
    Support: "Support",
    Development: "Development"
  };
  
  return order.map(period => ({
    period,
    card: forecast[period] || '',
    type: period,
    displayName: displayNames[period],
    isPlanetary: ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"].includes(period),
    isStrategic: ["LongRange", "Pluto", "Result", "Support", "Development"].includes(period)
  })).filter(item => item.card !== ''); // Only return periods with cards
}