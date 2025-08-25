# Enhanced CSV-Based Card Retrieval System

## Overview
This implementation provides a comprehensive CSV-based card retrieval system that follows the exact specification provided. It replaces the broken JSON parsing with direct CSV access for accurate data retrieval.

## Architecture

### Core Components

#### 1. **CSV Parser (`utils/csvParser.js`)**
- Robust CSV parsing with quoted string support
- Birth card normalization for consistent matching
- Card-to-slug conversion for image paths
- Row finding utilities

#### 2. **Yearly Forecasts System (`utils/yearlyForecastsCSV.js`)**
- **STEP 3 Implementation**: Fetches yearly forecast data from CSV
- Exact birth card + age matching logic
- Returns all 12 forecast fields (Mercury-Neptune + Long Range-Development)
- Input: Birth card (any format), Age
- Output: Complete forecast object

#### 3. **Planetary Periods System (`utils/planetaryPeriodsCSV.js`)**
- **STEP 4 Implementation**: Enriches forecast with dates and current period
- Parses start dates from Planetary Periods CSV
- Current period detection algorithm
- Date formatting with 2-digit years
- Input: Birthday, Forecast data
- Output: Enriched periods with dates and current status

#### 4. **Card Activities System (`utils/cardActivitiesCSV.js`)**
- **STEP 5 Implementation**: Pulls activation & alignment info
- Direct CSV access (fixes broken JSON parsing)
- Bulk lookup functionality
- Entrepreneurial activation text retrieval
- Input: Card names
- Output: Activation descriptions

#### 5. **Master Integration (`utils/enhancedCardSystem.js`)**
- Unified interface combining all systems
- Complete enhanced card data retrieval
- Validation utilities
- Fallback error handling

## Data Flow

```
User Input (Birth Card, Age, Birth Date)
    ↓
Step 3: Yearly Forecasts CSV → Get forecast cards for all periods
    ↓
Step 4: Planetary Periods CSV → Add start dates & detect current period
    ↓
Step 5: Card Activities CSV → Add activation descriptions
    ↓
Enhanced Card Data → UI Display with modals
```

## API Reference

### Primary Functions

```javascript
// Get complete enhanced data for a user
await getEnhancedCardData(birthCard, age, birthDate)

// Get just strategic outlook cards
await getStrategicOutlookCards(birthCard, age)

// Get planetary periods with dates
await getPlanetaryPeriodCards(birthCard, age, birthDate)

// Validate CSV file access
await validateCSVAccess()
```

### Data Structure

```javascript
{
  forecast: {
    Mercury: "K♠", Venus: "Q♥", Mars: "J♦", // ... all periods
  },
  birthCard: {
    card: "A♥", normalized: "A♥", activation: "Focus: Personal motivation...",
    imagePath: "/cards/png/ace-of-hearts.png"
  },
  planetaryPeriods: [
    { period: "Mercury", card: "K♠", startDate: "1/1", 
      formattedStartDate: "Jan 1 '25", isCurrent: true, activation: "..." }
  ],
  strategicOutlook: [
    { period: "LongRange", displayName: "Long Range", card: "Q♦", activation: "..." }
  ],
  currentPeriod: "Mercury",
  activations: { Mercury: "...", Venus: "...", /* all periods */ }
}
```

## UI Integration

### Enhanced Features
1. **CSV Data Loading**: Direct CSV access with fallback to legacy JSON
2. **Loading States**: Shows spinner while loading enhanced data
3. **Enhanced Modals**: Uses CSV activation data in card modals
4. **Current Period Highlighting**: Accurate current period detection
5. **Fallback System**: Graceful degradation if CSV files unavailable

### Card Sections
- **Birth Card**: Enhanced with CSV activation data
- **Strategic Outlook**: Long Range, Pluto, Result, Support, Development with CSV data
- **Planetary Periods**: Mercury-Neptune with start dates and current highlighting

## File Structure

```
utils/
├── csvParser.js              # Core CSV parsing utilities
├── yearlyForecastsCSV.js     # Step 3: Yearly forecast retrieval
├── planetaryPeriodsCSV.js    # Step 4: Planetary periods with dates
├── cardActivitiesCSV.js      # Step 5: Card activities from CSV
└── enhancedCardSystem.js     # Master integration system

lib/data/
├── Yearly Forecasts.csv      # Birth card + age → forecast cards
├── Planetary Periods.csv     # Birthday → period start dates  
├── Card to Activities MDBC.csv # Card → entrepreneurial activation
└── [legacy JSON files]       # Backup/fallback data

components/
└── MDBCApp.jsx              # Updated with enhanced card system
```

## CSV Data Requirements

### 1. Yearly Forecasts.csv
- Columns: `Birth Card`, `AGE`, `Mercury`, `Venus`, `Mars`, `Jupiter`, `Saturn`, `Uranus`, `Neptune`, `LONG RANGE`, `PLUTO`, `RESULT`, `SUPPORT`, `DEVELOPMENT`
- Birth cards in format: `A♥`, `K♠`, `Q♦`, etc.
- Ages as strings: `"0"`, `"25"`, `"99"`

### 2. Planetary Periods.csv  
- Columns: `BIRTHDAY`, `CARD`, `MERCURY`, `VENUS`, `MARS`, `JUPITER`, `SATURN`, `URANUS`, `NEPTUNE`
- Birthdays in format: `"January 1"`, `"December 25"`, etc.
- Dates in MM/DD format: `"1/1"`, `"12/25"`, etc.

### 3. Card to Activities MDBC.csv
- Columns: `Card`, `Entrepreneurial Activation`
- Cards in format: `A♥`, `K♠`, `Q♦`, etc.
- Activations as full text with newlines and formatting

## Features Implemented

✅ **STEP 3**: Yearly forecast data retrieval with exact CSV matching  
✅ **STEP 4**: Planetary periods with start dates and current period detection  
✅ **STEP 5**: Card activities integration with entrepreneurial activation  
✅ **Enhanced Modals**: CSV data integration in flip modals  
✅ **Current Period Highlighting**: Accurate detection and display  
✅ **Loading States**: Professional loading indicators  
✅ **Error Handling**: Graceful fallbacks to legacy system  
✅ **Validation**: CSV file accessibility checking  

## Usage

### For Users
The enhanced system provides:
- More accurate card data from authoritative CSV sources
- Real-time current period detection
- Enhanced modal descriptions with entrepreneurial activation
- Professional loading states and error handling

### For Developers  
- Run `validateCSVs()` to check CSV file accessibility
- Enhanced card data available in `enhancedCardData` state
- Legacy system maintained as fallback
- Console logging for debugging

## Testing

```javascript
// In browser console:
await validateCSVAccess(); // Check CSV files
```

The system includes comprehensive error handling and will fall back to the legacy JSON system if CSV files are inaccessible.