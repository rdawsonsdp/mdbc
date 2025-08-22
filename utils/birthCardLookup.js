import birthCardData from '../lib/data/birthdateToCard.json';

export function getBirthCardFromDate(dateKey) {
  // dateKey format: "January 1" or "February 29"
  const card = birthCardData[dateKey];
  if (!card) {
    console.error(`No birth card found for date: ${dateKey}`);
    return { card: 'Unknown', name: 'Unknown Card' };
  }
  return card;
}