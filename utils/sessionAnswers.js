/**
 * Session-based Quick Answers
 * 
 * This utility provides instant answers to common questions using
 * session state data, avoiding unnecessary API calls for simple queries.
 */

import { getCardProfile, formatCardProfileForChat } from './allCardProfiles.js';

/**
 * Checks if a question can be answered from session data
 * Returns the answer if available, or null if GPT is needed
 */
export function getQuickAnswer(question, userData) {
  if (!question || !userData) return null;

  const q = question.toLowerCase().trim();

  // Birth Card Questions
  if (
    q.includes('what is my birth card') ||
    q.includes('what\'s my birth card') ||
    q.includes('my birth card') && q.includes('?') ||
    q === 'birth card?'
  ) {
    return formatBirthCardAnswer(userData);
  }

  // Current Planetary Period Questions
  if (
    q.includes('what period am i in') ||
    q.includes('what planetary period') ||
    q.includes('current period') ||
    q.includes('which period') && q.includes('now') ||
    q.includes('what period') && (q.includes('currently') || q.includes('right now'))
  ) {
    return formatCurrentPeriodAnswer(userData);
  }

  // Yearly Cards Questions
  if (
    q.includes('what are my yearly cards') ||
    q.includes('my yearly cards') ||
    q.includes('yearly forecast') && q.includes('cards') ||
    q.includes('year spread') ||
    q.includes('what cards') && q.includes('this year')
  ) {
    return formatYearlyCardsAnswer(userData);
  }

  // Specific Yearly Card Questions - WITH CONTENT
  if (q.includes('long range') && (q.includes('say') || q.includes('mean') || q.includes('about'))) {
    return formatCardContent(userData, 'Long Range');
  }
  if (q.includes('pluto') && (q.includes('say') || q.includes('mean') || q.includes('about')) && !q.includes('period')) {
    return formatCardContent(userData, 'Pluto');
  }
  if (q.includes('result') && (q.includes('say') || q.includes('mean') || q.includes('about')) && !q.includes('period')) {
    return formatCardContent(userData, 'Result');
  }
  if (q.includes('environment') && (q.includes('say') || q.includes('mean') || q.includes('about'))) {
    return formatCardContent(userData, 'Environment');
  }
  if (q.includes('displacement') && (q.includes('say') || q.includes('mean') || q.includes('about'))) {
    return formatCardContent(userData, 'Displacement');
  }

  // Birth Card Content Question
  if ((q.includes('birth card') || q.includes('my card')) && (q.includes('say') || q.includes('mean') || q.includes('about'))) {
    return formatBirthCardContent(userData);
  }

  // Current Period Card Content
  if (q.includes('current') && q.includes('period') && (q.includes('say') || q.includes('mean') || q.includes('about'))) {
    return formatCurrentPeriodCardContent(userData);
  }

  // Specific Planetary Period Card Content (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune)
  const planetaryPeriods = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  for (const planet of planetaryPeriods) {
    if (q.includes(planet) && (q.includes('card') || q.includes('period')) && (q.includes('say') || q.includes('mean') || q.includes('about'))) {
      return formatPlanetaryPeriodCardContent(userData, planet);
    }
  }

  // Specific Yearly Card Questions - JUST THE CARD NAME
  if (q.includes('long range') && q.includes('card')) {
    return formatSpecificYearlyCard(userData, 'Long Range');
  }
  if (q.includes('pluto') && q.includes('card') && !q.includes('period')) {
    return formatSpecificYearlyCard(userData, 'Pluto');
  }
  if (q.includes('result') && q.includes('card') && !q.includes('period')) {
    return formatSpecificYearlyCard(userData, 'Result');
  }
  if (q.includes('environment') && q.includes('card')) {
    return formatSpecificYearlyCard(userData, 'Environment');
  }
  if (q.includes('displacement') && q.includes('card')) {
    return formatSpecificYearlyCard(userData, 'Displacement');
  }

  // All Planetary Periods
  if (
    q.includes('all') && q.includes('period') ||
    q.includes('list') && q.includes('period') ||
    q.includes('show') && q.includes('period') ||
    q.includes('what are') && q.includes('period')
  ) {
    return formatAllPeriodsAnswer(userData);
  }

  // Specific Period Start Date
  const periodMatch = q.match(/when does my (mercury|venus|mars|jupiter|saturn|uranus|neptune) period/i);
  if (periodMatch) {
    return formatPeriodStartDate(userData, periodMatch[1]);
  }

  // Age Question
  if (
    q.includes('how old am i') ||
    q.includes('what is my age') ||
    q.includes('what\'s my age') ||
    q === 'my age?'
  ) {
    return formatAgeAnswer(userData);
  }

  // No quick answer available - needs GPT
  return null;
}

/**
 * Format birth card answer
 */
function formatBirthCardAnswer(userData) {
  if (!userData.birthCard) return null;

  return `Your birth card is the **${userData.birthCard}**.

This is your core identity card in cardology - it represents your innate gifts, challenges, and life purpose.

💡 *Would you like to know more about what this card means for your business strategy?*`;
}

/**
 * Format current planetary period answer
 */
function formatCurrentPeriodAnswer(userData) {
  const currentPeriod = userData.planetaryPeriods?.find(p => p.isCurrent);
  
  if (!currentPeriod) {
    return `I don't have your current planetary period data loaded. Please make sure your birthdate is entered correctly.`;
  }

  const planet = currentPeriod.displayName || currentPeriod.planet;
  const card = currentPeriod.card;
  const startDate = currentPeriod.formattedStartDate || currentPeriod.startDate;

  return `You are currently in your **${planet} period** with the **${card}**.

📅 **Started:** ${startDate}
⏱️ **Duration:** 52 days

Each planetary period brings different energies and opportunities. Your ${planet} period with the ${card} has specific implications for your business timing and strategy.

💡 *Would you like to know what this period means for your business?*`;
}

/**
 * Format yearly cards answer
 */
function formatYearlyCardsAnswer(userData) {
  if (!userData.yearlyCards || userData.yearlyCards.length === 0) {
    return `I don't have your yearly forecast cards loaded. Please make sure your birthdate and age are entered correctly.`;
  }

  let response = `**Your Yearly Forecast Cards (Age ${userData.age}):**\n\n`;

  userData.yearlyCards.forEach(card => {
    response += `• **${card.type}:** ${card.card}\n`;
  });

  response += `\nThese cards represent the major themes and energies influencing your year.

💡 *Would you like me to interpret what these cards mean for your business strategy this year?*`;

  return response;
}

/**
 * Format specific yearly card
 */
function formatSpecificYearlyCard(userData, cardType) {
  const yearlyCard = userData.yearlyCards?.find(c => c.type === cardType);

  if (!yearlyCard) {
    return `I don't have your ${cardType} card data loaded. Please make sure your birthdate and age are entered correctly.`;
  }

  return `Your **${cardType} Card** for this year (age ${userData.age}) is the **${yearlyCard.card}**.

💡 *Would you like to know what this card means for your business?*`;
}

/**
 * Format all planetary periods
 */
function formatAllPeriodsAnswer(userData) {
  if (!userData.planetaryPeriods || userData.planetaryPeriods.length === 0) {
    return `I don't have your planetary periods data loaded. Please make sure your birthdate is entered correctly.`;
  }

  let response = `**Your Planetary Periods This Year:**\n\n`;
  response += `Each period lasts 52 days and brings different energies.\n\n`;

  userData.planetaryPeriods.forEach(period => {
    const isCurrent = period.isCurrent || false;
    const marker = isCurrent ? ' ← **CURRENT PERIOD**' : '';
    const displayName = period.displayName || period.planet;
    const card = period.card;
    const startDate = period.formattedStartDate || period.startDate || '';

    response += `• **${displayName}:** ${card} (starts ${startDate})${marker}\n`;
  });

  response += `\n💡 *Would you like to explore what a specific period means for your business timing?*`;

  return response;
}

/**
 * Format specific period start date
 */
function formatPeriodStartDate(userData, planetName) {
  const period = userData.planetaryPeriods?.find(p => 
    p.planet?.toLowerCase() === planetName.toLowerCase() ||
    p.displayName?.toLowerCase().includes(planetName.toLowerCase())
  );

  if (!period) {
    return `I don't have your ${planetName} period data loaded.`;
  }

  const startDate = period.formattedStartDate || period.startDate;
  const card = period.card;
  const isCurrent = period.isCurrent;

  let response = `Your **${period.displayName || planetName} period** starts on **${startDate}**.

**Card:** ${card}
**Duration:** 52 days`;

  if (isCurrent) {
    response += `\n\n✨ This is your **CURRENT PERIOD** right now!`;
  }

  response += `\n\n💡 *Would you like to know what this period means for your business strategy?*`;

  return response;
}

/**
 * Format age answer
 */
function formatAgeAnswer(userData) {
  if (!userData.age) {
    return `I don't have your age data loaded. Please make sure your birthdate is entered.`;
  }

  return `You are **${userData.age} years old**.`;
}

/**
 * Format card content (description, zone of genius, how to motivate)
 */
function formatCardContent(userData, cardType) {
  const yearlyCard = userData.yearlyCards?.find(c => c.type === cardType);

  if (!yearlyCard) {
    return `I don't have your ${cardType} card data loaded.`;
  }

  const profile = getCardProfile(yearlyCard.card);

  if (!profile) {
    return `Your **${cardType} Card** is the **${yearlyCard.card}**.

I have the card identified, but the detailed profile content isn't loaded yet. 

💡 *Ask me to interpret what this card means for your business and I'll consult the knowledge base.*`;
  }

  return formatCardProfileForChat(profile, `${cardType} Card (Age ${userData.age})`);
}

/**
 * Format birth card content
 */
function formatBirthCardContent(userData) {
  if (!userData.birthCard) {
    return `I don't have your birth card data loaded.`;
  }

  const profile = getCardProfile(userData.birthCard);

  if (!profile) {
    return `Your birth card is the **${userData.birthCard}**.

The detailed profile content isn't loaded yet.

💡 *Ask me to interpret what this card means for your business and I'll consult the knowledge base.*`;
  }

  return formatCardProfileForChat(profile, 'Birth Card');
}

/**
 * Format current period card content
 */
function formatCurrentPeriodCardContent(userData) {
  const currentPeriod = userData.planetaryPeriods?.find(p => p.isCurrent);
  
  if (!currentPeriod) {
    return `I don't have your current planetary period data loaded.`;
  }

  const profile = getCardProfile(currentPeriod.card);

  if (!profile) {
    const planet = currentPeriod.displayName || currentPeriod.planet;
    return `Your current **${planet} period** card is the **${currentPeriod.card}**.

The detailed profile content isn't loaded yet.

💡 *Ask me to interpret what this period means for your business and I'll consult the knowledge base.*`;
  }

  const planet = currentPeriod.displayName || currentPeriod.planet;
  const startDate = currentPeriod.formattedStartDate || currentPeriod.startDate;

  let response = `**Your Current ${planet} Period Card:** ${currentPeriod.card}\n`;
  response += `**Started:** ${startDate} • **Duration:** 52 days\n\n`;
  response += formatCardProfileForChat(profile, '');

  return response;
}

/**
 * Format specific planetary period card content
 * Handles: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune
 */
function formatPlanetaryPeriodCardContent(userData, planetName) {
  if (!userData.planetaryPeriods || userData.planetaryPeriods.length === 0) {
    return `I don't have your planetary periods data loaded.`;
  }

  // Find the period - match by planet name or displayName
  const period = userData.planetaryPeriods.find(p => {
    const pName = (p.planet || '').toLowerCase();
    const pDisplayName = (p.displayName || '').toLowerCase();
    return pName.includes(planetName) || pDisplayName.includes(planetName);
  });

  if (!period) {
    return `I couldn't find your ${planetName.charAt(0).toUpperCase() + planetName.slice(1)} period data.`;
  }

  const profile = getCardProfile(period.card);

  if (!profile) {
    const planet = period.displayName || period.planet;
    return `Your **${planet} period** card is the **${period.card}**.

The detailed profile content isn't loaded yet.

💡 *Ask me to interpret what this period means for your business and I'll consult the knowledge base.*`;
  }

  const planet = period.displayName || period.planet;
  const startDate = period.formattedStartDate || period.startDate;
  const isCurrent = period.isCurrent;

  let response = `**Your ${planet} Period Card:** ${period.card}\n`;
  response += `**Starts:** ${startDate} • **Duration:** 52 days`;
  
  if (isCurrent) {
    response += ` ✨ **CURRENT PERIOD**`;
  }
  
  response += `\n\n`;
  response += formatCardProfileForChat(profile, '');

  return response;
}

/**
 * Check if a question is simple enough for quick answer
 */
export function canAnswerQuickly(question) {
  if (!question) return false;
  
  const q = question.toLowerCase().trim();
  
  const quickPatterns = [
    'what is my',
    'what\'s my',
    'my birth card',
    'what period am i',
    'what are my',
    'how old am i',
    'when does my',
    'list',
    'show me'
  ];
  
  return quickPatterns.some(pattern => q.includes(pattern));
}

