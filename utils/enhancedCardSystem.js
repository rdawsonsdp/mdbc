/**
 * Enhanced Card System - Master Integration
 * Combines all CSV-based data retrieval systems
 * Provides a unified interface for the UI components
 */

import { fetchYearlyForecastData, formatForecastForDisplay } from './yearlyForecastsCSV.js';
import { enrichForecastWithPlanetaryPeriods, getCardImagePath } from './planetaryPeriodsCSV.js';
import { getActivationsForForecast, getCardActivation } from './cardActivitiesCSV.js';
import { normalizeBirthCardForCSV } from './csvParser.js';

/**
 * Master function to get complete enhanced card data for a user
 * Implements all steps from the specification in one call
 * @param {string} birthCard - Birth card in any format
 * @param {number|string} age - User's age
 * @param {string} birthDate - Birth date in "Month Day" format
 * @returns {Promise<Object>} Complete enhanced card data
 */
export async function getEnhancedCardData(birthCard, age, birthDate) {
  console.log('Getting enhanced card data:', { birthCard, age, birthDate });
  
  try {
    // STEP 3: Fetch yearly forecast data from CSV
    const forecast = await fetchYearlyForecastData(birthCard, age);
    
    // STEP 4: Enrich with planetary periods and dates
    const { periods, currentPeriod, startDates } = await enrichForecastWithPlanetaryPeriods(forecast, birthDate);
    
    // STEP 5: Get activation info for all cards
    const activations = await getActivationsForForecast(forecast);
    
    // Get birth card activation separately
    const birthCardActivation = await getCardActivation(birthCard);
    
    // Format for display
    const enhancedData = {
      // Raw forecast data
      forecast,
      
      // Birth card info
      birthCard: {
        card: birthCard,
        normalized: normalizeBirthCardForCSV(birthCard),
        activation: birthCardActivation,
        imagePath: getCardImagePath(normalizeBirthCardForCSV(birthCard))
      },
      
      // Planetary periods (Mercury-Neptune) with dates
      planetaryPeriods: periods.filter(p => p.isPlanetary),
      
      // Strategic outlook (Long Range, Pluto, Result, Support, Development)
      strategicOutlook: periods.filter(p => p.isStrategic),
      
      // All periods in canonical order
      allPeriods: periods,
      
      // Current period info
      currentPeriod,
      startDates,
      
      // Activations for all cards
      activations,
      
      // Metadata
      age: Number(age),
      birthDate,
      generatedAt: new Date().toISOString()
    };
    
    console.log('Enhanced card data generated:', enhancedData);
    return enhancedData;
    
  } catch (error) {
    console.error('Error getting enhanced card data:', error);
    return getEmptyEnhancedData(birthCard, age, birthDate);
  }
}

/**
 * Get empty enhanced data structure (fallback)
 * @param {string} birthCard - Birth card
 * @param {number|string} age - Age
 * @param {string} birthDate - Birth date
 * @returns {Object} Empty data structure
 */
function getEmptyEnhancedData(birthCard, age, birthDate) {
  return {
    forecast: {},
    birthCard: {
      card: birthCard,
      normalized: normalizeBirthCardForCSV(birthCard),
      activation: '',
      imagePath: getCardImagePath(normalizeBirthCardForCSV(birthCard))
    },
    planetaryPeriods: [],
    strategicOutlook: [],
    allPeriods: [],
    currentPeriod: null,
    startDates: {},
    activations: {},
    age: Number(age),
    birthDate,
    generatedAt: new Date().toISOString(),
    error: true
  };
}

/**
 * Get enhanced data for just yearly strategic outlook cards
 * (Birth Card + Long Range, Pluto, Result, Support, Development)
 * @param {string} birthCard - Birth card
 * @param {number|string} age - Age
 * @returns {Promise<Array>} Array of strategic outlook cards with activations
 */
export async function getStrategicOutlookCards(birthCard, age) {
  try {
    const forecast = await fetchYearlyForecastData(birthCard, age);
    const activations = await getActivationsForForecast(forecast);
    
    // Birth card
    const birthCardData = {
      period: 'Birth',
      card: normalizeBirthCardForCSV(birthCard),
      displayName: 'Birth Card',
      type: 'birth',
      activation: await getCardActivation(birthCard),
      imagePath: getCardImagePath(normalizeBirthCardForCSV(birthCard))
    };
    
    // Strategic cards
    const strategicPeriods = ['LongRange', 'Pluto', 'Result', 'Support', 'Development'];
    const strategicCards = strategicPeriods.map(period => ({
      period,
      card: forecast[period],
      displayName: period === 'LongRange' ? 'Long Range' : period,
      type: 'strategic',
      activation: activations[period],
      imagePath: getCardImagePath(forecast[period])
    })).filter(card => card.card && card.card.trim() !== '');
    
    return [birthCardData, ...strategicCards];
    
  } catch (error) {
    console.error('Error getting strategic outlook cards:', error);
    return [];
  }
}

/**
 * Get enhanced data for planetary period cards with dates
 * @param {string} birthCard - Birth card
 * @param {number|string} age - Age  
 * @param {string} birthDate - Birth date in "Month Day" format
 * @returns {Promise<Array>} Array of planetary period cards with dates and activations
 */
export async function getPlanetaryPeriodCards(birthCard, age, birthDate) {
  try {
    const forecast = await fetchYearlyForecastData(birthCard, age);
    const { periods, currentPeriod } = await enrichForecastWithPlanetaryPeriods(forecast, birthDate);
    const activations = await getActivationsForForecast(forecast);
    
    return periods.filter(p => p.isPlanetary).map(period => ({
      ...period,
      activation: activations[period.period],
      isCurrent: period.period === currentPeriod
    }));
    
  } catch (error) {
    console.error('Error getting planetary period cards:', error);
    return [];
  }
}

/**
 * Validate that CSV files are accessible
 * @returns {Promise<Object>} Validation results
 */
export async function validateCSVAccess() {
  const results = {
    yearlyForecasts: false,
    planetaryPeriods: false,
    cardActivities: false,
    errors: []
  };
  
  try {
    const response1 = await fetch('/lib/data/Yearly Forecasts.csv');
    results.yearlyForecasts = response1.ok;
    if (!response1.ok) results.errors.push('Yearly Forecasts.csv not accessible');
  } catch (error) {
    results.errors.push(`Yearly Forecasts.csv error: ${error.message}`);
  }
  
  try {
    const response2 = await fetch('/lib/data/Planetary Periods.csv');
    results.planetaryPeriods = response2.ok;
    if (!response2.ok) results.errors.push('Planetary Periods.csv not accessible');
  } catch (error) {
    results.errors.push(`Planetary Periods.csv error: ${error.message}`);
  }
  
  try {
    const response3 = await fetch('/lib/data/Card to Activities MDBC.csv');
    results.cardActivities = response3.ok;
    if (!response3.ok) results.errors.push('Card to Activities MDBC.csv not accessible');
  } catch (error) {
    results.errors.push(`Card to Activities MDBC.csv error: ${error.message}`);
  }
  
  return results;
}