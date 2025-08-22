import yearlyForecasts from '../lib/data/yearlyForecasts.json';

export async function getForecastForAge(birthCard, age) {
  const cardForecasts = yearlyForecasts[birthCard];
  if (!cardForecasts || !cardForecasts[age]) {
    return [];
  }
  
  const forecast = cardForecasts[age];
  const cards = [
    { card: forecast.mercury, type: 'Mercury' },
    { card: forecast.venus, type: 'Venus' },
    { card: forecast.mars, type: 'Mars' },
    { card: forecast.jupiter, type: 'Jupiter' },
    { card: forecast.saturn, type: 'Saturn' },
    { card: forecast.uranus, type: 'Uranus' },
    { card: forecast.neptune, type: 'Neptune' },
    { card: forecast.longRange, type: 'Long Range' },
    { card: forecast.pluto, type: 'Pluto' },
    { card: forecast.result, type: 'Result' },
    { card: forecast.support, type: 'Support' },
    { card: forecast.development, type: 'Development' }
  ].filter(item => item.card && item.card !== 'None');
  
  return cards;
}