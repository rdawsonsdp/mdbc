const fs = require('fs');
const path = require('path');

function csvToJson(csvText, hasHeaders = true) {
  const lines = csvText.trim().split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = hasHeaders ? lines[0].split(',').map(h => h.trim().replace(/^﻿/, '')) : [];
  const startIdx = hasHeaders ? 1 : 0;
  
  return lines.slice(startIdx).map(line => {
    const values = line.split(',').map(v => v.trim());
    if (!hasHeaders) return values;
    
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
}

// Convert Birthdate to Card
const birthdateData = fs.readFileSync(path.join(__dirname, '../lib/data/Birthdate to Card.csv'), 'utf8');
const birthdateJson = csvToJson(birthdateData);
const birthdateMap = {};
birthdateJson.forEach(row => {
  birthdateMap[row.Date] = { card: row.Card, name: row['Card Name'] };
});
fs.writeFileSync(path.join(__dirname, '../lib/data/birthdateToCard.json'), JSON.stringify(birthdateMap, null, 2));

// Convert Card to Activities
const activitiesData = fs.readFileSync(path.join(__dirname, '../lib/data/Card to Activities MDBC.csv'), 'utf8');
const activitiesJson = csvToJson(activitiesData);
const activitiesMap = {};
activitiesJson.forEach(row => {
  if (row.Card) {
    activitiesMap[row.Card] = {
      entrepreneurialActivation: row['Entrepreneurial Activation'] || ''
    };
  }
});
fs.writeFileSync(path.join(__dirname, '../lib/data/cardToActivities.json'), JSON.stringify(activitiesMap, null, 2));

// Convert Yearly Forecasts
const yearlyData = fs.readFileSync(path.join(__dirname, '../lib/data/Yearly Forecasts.csv'), 'utf8');
const yearlyJson = csvToJson(yearlyData);
const yearlyMap = {};
yearlyJson.forEach(row => {
  if (!yearlyMap[row['Birth Card']]) {
    yearlyMap[row['Birth Card']] = {};
  }
  yearlyMap[row['Birth Card']][row.AGE] = {
    mercury: row.Mercury,
    venus: row.Venus,
    mars: row.Mars,
    jupiter: row.Jupiter,
    saturn: row['Saturn ']?.trim() || row.Saturn,
    uranus: row.Uranus,
    neptune: row.Neptune,
    longRange: row['LONG RANGE'],
    pluto: row.PLUTO,
    result: row.RESULT,
    support: row.SUPPORT,
    development: row.DEVELOPMENT
  };
});
fs.writeFileSync(path.join(__dirname, '../lib/data/yearlyForecasts.json'), JSON.stringify(yearlyMap, null, 2));

// Convert Planetary Periods
const planetaryData = fs.readFileSync(path.join(__dirname, '../lib/data/Planetary Periods.csv'), 'utf8');
const planetaryJson = csvToJson(planetaryData);
const planetaryMap = {};
planetaryJson.forEach(row => {
  if (row.BIRTHDAY && row.CARD) {
    planetaryMap[row.BIRTHDAY] = {
      card: row.CARD.trim(),
      periods: {
        mercury: row.MERCURY,
        venus: row.VENUS,
        mars: row.MARS,
        jupiter: row.JUPITER,
        saturn: row.SATURN,
        uranus: row.URANUS,
        neptune: row.NEPTUNE
      }
    };
  }
});
fs.writeFileSync(path.join(__dirname, '../lib/data/planetaryPeriods.json'), JSON.stringify(planetaryMap, null, 2));

console.log('CSV files converted to JSON successfully!');