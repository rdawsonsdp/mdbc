import planetaryPeriods from '../lib/data/planetaryPeriods.json';

export function getPlanetaryPeriodCard(birthdate) {
  // birthdate format: "January 1"
  const periods = planetaryPeriods[birthdate];
  if (!periods) {
    return null;
  }
  
  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentDateStr = `${currentMonth}/${currentDay}`;
  
  // Check which period we're in
  const planetNames = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  
  for (let i = 0; i < planetNames.length; i++) {
    const planetName = planetNames[i];
    const periodStart = periods.periods[planetName];
    if (!periodStart) continue;
    
    const [month, day] = periodStart.split('/').map(n => parseInt(n));
    const periodDate = new Date(now.getFullYear(), month - 1, day);
    
    // Check if this is the next period start date after current date
    if (i < planetNames.length - 1) {
      const nextPlanet = planetNames[i + 1];
      const nextPeriodStart = periods.periods[nextPlanet];
      if (nextPeriodStart) {
        const [nextMonth, nextDay] = nextPeriodStart.split('/').map(n => parseInt(n));
        const nextPeriodDate = new Date(now.getFullYear(), nextMonth - 1, nextDay);
        
        // Adjust for year boundary
        if (nextPeriodDate < periodDate) {
          nextPeriodDate.setFullYear(nextPeriodDate.getFullYear() + 1);
        }
        
        if (now >= periodDate && now < nextPeriodDate) {
          return {
            planet: planetName.charAt(0).toUpperCase() + planetName.slice(1),
            card: periods.card,
            startDate: periodStart,
            endDate: nextPeriodStart
          };
        }
      }
    } else {
      // Last period (Neptune) - check if we're after its start
      if (now >= periodDate) {
        return {
          planet: 'Neptune',
          card: periods.card,
          startDate: periodStart,
          endDate: periods.periods.mercury // Cycles back to Mercury
        };
      }
    }
  }
  
  // Default to Mercury if no match found
  return {
    planet: 'Mercury',
    card: periods.card,
    startDate: periods.periods.mercury,
    endDate: periods.periods.venus
  };
}

export function getAllPlanetaryPeriods(birthdate) {
  const periods = planetaryPeriods[birthdate];
  if (!periods) {
    return [];
  }
  
  const planetNames = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  return planetNames.map((planet, index) => {
    const nextPlanet = planetNames[index + 1] || 'mercury';
    return {
      planet: planet.charAt(0).toUpperCase() + planet.slice(1),
      card: periods.card,
      startDate: periods.periods[planet],
      endDate: periods.periods[nextPlanet]
    };
  });
}