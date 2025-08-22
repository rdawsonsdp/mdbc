import cardActivities from '../lib/data/cardToActivities.json';

export async function getCardActions(card) {
  const activities = cardActivities[card];
  if (!activities) {
    return { supportiveAction: 'No specific activation found for this card.' };
  }
  
  return {
    supportiveAction: activities.entrepreneurialActivation || 'No specific activation found for this card.'
  };
}