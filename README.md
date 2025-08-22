# Million Dollar Birth Card (MDBC)

A Next.js application for cardology-based business strategy and personal insights.

## Features

- **Landing Page** with carousel skip functionality
- **Birth Card Reading** with name and birthdate input
- **Card Flip Animations** with 3D effects and descriptions
- **Yearly Strategic Spread** - personalized card layout
- **52-Day Energetic Business Cycles** - planetary period cards
- **Business Coach Chat** - AI-powered cardology guidance
- **Profile Management** - save and load readings
- **Responsive Design** - mobile and desktop optimized

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Data**: JSON converted from CSV files
- **Animations**: CSS transforms and transitions
- **Storage**: Local storage for profiles and conversations

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rdawsonsdp/mdbc.git
   cd mdbc
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Deploy automatically with zero configuration
3. Environment variables (if needed) can be set in Vercel dashboard

## Data Structure

- `lib/data/birthdateToCard.json` - Birth date to card mappings
- `lib/data/cardToActivities.json` - Card descriptions and activations
- `lib/data/yearlyForecasts.json` - Age-based card forecasts
- `lib/data/planetaryPeriods.json` - 52-day cycle data

## License

Private project - All rights reserved.