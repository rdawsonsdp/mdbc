'use client'

import React, { useState, useEffect } from 'react';
import { getBirthCardFromDate } from '../utils/birthCardLookup';
import { getForecastForAge } from '../utils/yearlyForecastLookup';
import { getCardActions } from '../utils/actionLookup';
import { getAllPlanetaryPeriods } from '../utils/planetaryPeriodLookup';
import cardActivities from '../lib/data/cardToActivities.json';

// Card component with flip animation
const FlippableCard = ({ card, title, description, imageUrl }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative">
      {title && <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>}
      <div 
        className={`card-container ${isFlipped ? 'flipped' : ''} cursor-pointer`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ width: '150px', height: '210px' }}
      >
        <div className="card-inner">
          <div className="card-front">
            <img 
              src={imageUrl} 
              alt={card}
              className="w-full h-full object-cover rounded-lg shadow-lg card-hover"
            />
          </div>
          <div className="card-back bg-white rounded-lg shadow-lg p-4 flex items-center justify-center">
            <div className="text-sm text-gray-700" style={{ overflowY: 'auto', maxHeight: '180px' }}>
              {description || 'No description available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MDBCApp() {
  const [step, setStep] = useState('landing');
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [age, setAge] = useState(null);
  const [birthCard, setBirthCard] = useState(null);
  const [yearlyCards, setYearlyCards] = useState([]);
  const [planetaryPeriods, setPlanetaryPeriods] = useState([]);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [savedConversations, setSavedConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // Load saved profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedProfiles');
    if (saved) {
      setSavedProfiles(JSON.parse(saved));
    }
  }, []);

  const handleSkipCarousel = () => {
    setStep('form');
  };

  const handleSubmit = async () => {
    const dateKey = `${month} ${parseInt(day)}`;
    const birthCardData = getBirthCardFromDate(dateKey);
    setBirthCard(birthCardData);
    
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(year);
    const calculatedAge = currentYear - birthYear;
    setAge(calculatedAge);
    
    // Get yearly forecast
    const forecast = await getForecastForAge(birthCardData.card, calculatedAge);
    setYearlyCards(forecast);
    
    // Get planetary periods
    const periods = getAllPlanetaryPeriods(dateKey);
    setPlanetaryPeriods(periods);
    
    setStep('results');
    
    // Initialize chat with welcome message
    setChatMessages([{
      role: 'assistant',
      content: "Hi there! I'm your personal Business Coach. Ask me anything about your strategy, energy, or income cycles…"
    }]);
  };

  const saveProfile = () => {
    const profile = {
      id: Date.now(),
      name,
      birthDate: `${month} ${day}, ${year}`,
      month,
      day,
      year
    };
    const updated = [...savedProfiles, profile];
    setSavedProfiles(updated);
    localStorage.setItem('savedProfiles', JSON.stringify(updated));
  };

  const deleteProfile = (id) => {
    const updated = savedProfiles.filter(p => p.id !== id);
    setSavedProfiles(updated);
    localStorage.setItem('savedProfiles', JSON.stringify(updated));
  };

  const loadProfile = (profile) => {
    setName(profile.name);
    setMonth(profile.month);
    setDay(profile.day);
    setYear(profile.year);
    handleSubmit();
  };

  const getCardImageUrl = (card) => {
    if (!card) return '/cards/Joker.png';
    // Convert card format (e.g., "A♥" to "AH", "10♦" to "10D")
    const suit = card.slice(-1);
    const rank = card.slice(0, -1);
    const suitMap = { '♥': 'H', '♦': 'D', '♣': 'C', '♠': 'S' };
    return `/cards/${rank}${suitMap[suit] || 'S'}.png`;
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    
    // Simulate GPT response (in real app, this would be an API call)
    setTimeout(() => {
      const response = {
        role: 'assistant',
        content: `Based on your ${birthCard.name} birth card and current ${age} year cycle, here's what I see for your business strategy...`
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000);
  };

  const saveConversation = () => {
    const conversation = {
      id: Date.now(),
      name: `Conversation ${new Date().toLocaleDateString()}`,
      messages: chatMessages,
      timestamp: new Date()
    };
    setSavedConversations([...savedConversations, conversation]);
  };

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Million Dollar Birth Card</h1>
        <div className="w-full max-w-2xl">
          {/* Carousel placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-4">
            <p className="text-center text-gray-600">Welcome to MDBC</p>
          </div>
          <button
            onClick={handleSkipCarousel}
            className="w-full bg-primary text-white px-6 py-3 rounded-xl shadow hover:bg-gray-800 transition"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Enter Your Information</h2>
          
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-4 border border-secondary rounded-lg text-black"
          />
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="p-3 border border-secondary rounded-lg text-black"
            >
              <option value="">Month</option>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            
            <select 
              value={day} 
              onChange={(e) => setDay(e.target.value)}
              className="p-3 border border-secondary rounded-lg text-black"
            >
              <option value="">Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="p-3 border border-secondary rounded-lg text-black"
            >
              <option value="">Year</option>
              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {savedProfiles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Saved Readings</label>
              <select 
                onChange={(e) => {
                  const profile = savedProfiles.find(p => p.id === parseInt(e.target.value));
                  if (profile) loadProfile(profile);
                }}
                className="w-full p-3 border border-secondary rounded-lg text-black"
              >
                <option value="">Select a saved reading...</option>
                {savedProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} - {profile.birthDate}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={!name || !month || !day || !year}
            className="w-full bg-primary text-white px-6 py-3 rounded-xl shadow hover:bg-gray-800 transition disabled:opacity-50 ripple"
          >
            Reveal Birth Card Magic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Birth Card */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{name}'s Birth Card Reading</h1>
          <p className="text-lg mb-2">Born: {month} {day}, {year}</p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-20 p-2 border border-secondary rounded text-black text-center"
            />
            <span>years old</span>
            <button
              onClick={saveProfile}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 shimmer"
            >
              Save
            </button>
            <button
              onClick={() => setStep('form')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
          
          {birthCard && (
            <div className="flex justify-center mb-8">
              <FlippableCard
                card={birthCard.card}
                title="Birth Card"
                description={cardActivities[birthCard.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(birthCard.card)}
              />
            </div>
          )}
        </div>

        {/* Yearly Strategic Spread */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Yearly Strategic Spread</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
            {yearlyCards.map((item, idx) => (
              <FlippableCard
                key={idx}
                card={item.card}
                title={item.type}
                description={cardActivities[item.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(item.card)}
              />
            ))}
          </div>
        </section>

        {/* Planetary Periods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Your 52 Day Energetic Business Cycles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center">
            {planetaryPeriods.map((period, idx) => (
              <FlippableCard
                key={idx}
                card={period.card}
                title={`${period.planet} (${period.startDate})`}
                description={cardActivities[period.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(period.card)}
              />
            ))}
          </div>
        </section>

        {/* Chat Interface */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Cardology Business Coach</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Conversation List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-4">Conversations</h3>
              <div className="space-y-2">
                {savedConversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm"
                  >
                    {conv.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat Window */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
              <div className="h-96 overflow-y-auto mb-4 border border-gray-200 rounded p-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 p-3 border border-secondary rounded-lg text-black"
                />
                <button
                  onClick={sendChatMessage}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                >
                  Send
                </button>
                <button
                  onClick={saveConversation}
                  className="bg-secondary text-white px-4 py-3 rounded-lg hover:bg-yellow-600 shimmer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}