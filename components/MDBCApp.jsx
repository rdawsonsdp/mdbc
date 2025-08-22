'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getBirthCardFromDate } from '../utils/birthCardLookup';
import { getForecastForAge } from '../utils/yearlyForecastLookup';
import { getCardActions } from '../utils/actionLookup';
import { getAllPlanetaryPeriods } from '../utils/planetaryPeriodLookup';
import cardActivities from '../lib/data/cardToActivities.json';

// Enhanced Card component with flip animation and scrollable descriptions
const FlippableCard = ({ card, title, description, imageUrl, isCurrent = false, cardType = 'default' }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="relative">
      {title && <h3 className="text-lg font-bold mb-2 text-center text-gray-800">{title}</h3>}
      <div 
        className={`card-container ${isFlipped ? 'flipped' : ''} ${isCurrent ? 'current-card' : ''}`}
        onClick={handleCardClick}
        style={{ width: '150px', height: '210px' }}
      >
        <div className="card-inner">
          <div className="card-front">
            <Image 
              src={imageUrl} 
              alt={card}
              width={150}
              height={210}
              className={`w-full h-full object-cover rounded-lg shadow-lg card-hover shimmer-hover ${
                isCurrent ? 'ring-4 ring-purple-400 ring-opacity-60' : ''
              }`}
            />
          </div>
          <div className="card-back bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-xl border border-gray-200">
            <div className="card-description text-sm text-gray-700 leading-relaxed">
              <div className="font-semibold text-purple-700 mb-2 text-center border-b border-gray-200 pb-2">
                {card} - {cardType === 'birth' ? 'Birth Card' : cardType === 'planetary' ? 'Planetary Influence' : 'Strategic Card'}
              </div>
              <div className="space-y-2">
                {description ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: description.replace(/\n/g, '<br>').replace(/\. /g, '.<br><br>') 
                  }} />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🃏</div>
                    <p>Card description coming soon...</p>
                  </div>
                )}
              </div>
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emotionalIntent, setEmotionalIntent] = useState('practical');
  const [notification, setNotification] = useState(null);
  const [sparkleElements, setSparkleElements] = useState([]);

  // Load saved profiles and conversations from localStorage
  useEffect(() => {
    const savedProfilesData = localStorage.getItem('savedProfiles');
    if (savedProfilesData) {
      setSavedProfiles(JSON.parse(savedProfilesData));
    }
    
    const savedConvsData = localStorage.getItem('savedConversations');
    if (savedConvsData) {
      setSavedConversations(JSON.parse(savedConvsData));
    }
  }, []);

  // Helper function to convert month name to index (0-11)
  const getMonthIndex = (monthName) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(monthName);
  };

  const handleSkipCarousel = () => {
    setStep('form');
  };

  const handleSubmit = async () => {
    const dateKey = `${month} ${parseInt(day)}`;
    const birthCardData = getBirthCardFromDate(dateKey);
    setBirthCard(birthCardData);
    
    // Calculate age properly accounting for whether birthday has passed this year
    const today = new Date();
    const birthDate = new Date(parseInt(year), getMonthIndex(month), parseInt(day));
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    
    // Check if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
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
      content: `Welcome! I'm your Cardology Business Coach. With your ${birthCardData.name} birth card, you have unique entrepreneurial gifts waiting to be activated. I'm here to decode your million-dollar blueprint using your birth card, yearly spreads, and planetary cycles. Let's unlock your aligned path to business success. What would you like to explore first?`
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
    
    // Trigger sparkle effect and notification
    triggerSparkle('save-profile-btn');
    showNotification('✨ Added to your Saved Profiles.');
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
    // Remove any spaces and convert card format (e.g., "A ♥" to "AH", "10 ♦" to "10D")
    const cleanCard = card.replace(/\s+/g, '');
    const suit = cleanCard.slice(-1);
    const rank = cleanCard.slice(0, -1);
    const suitMap = { '♥': 'H', '♦': 'D', '♣': 'C', '♠': 'S' };
    return `/cards/${rank}${suitMap[suit] || 'S'}.png`;
  };

  const getSystemPrompt = (intent) => {
    const basePrompt = "You are a purpose-driven business strategist who uses Cardology to guide entrepreneurs. Use birth cards, yearly and planetary spreads, planetary cycles, and cardology knowledge to offer actionable insight into growth, alignment, and income potential.";
    
    const toneVariations = {
      supportive: `${basePrompt} Speak with encouraging, nurturing guidance that builds confidence and offers emotional support. Your tone is warm, understanding, and uplifting while maintaining strategic focus.`,
      practical: `${basePrompt} Speak with grounded clarity, sharp wit, and the energy of a million-dollar mindset. Focus on actionable business strategies and concrete steps they can take immediately.`,
      educational: `${basePrompt} Speak with deep wisdom and teaching energy. Share deeper Cardology knowledge and business development insights. Explain the 'why' behind your guidance and help them understand the foundations.`,
      gentle: `${basePrompt} Speak with a soft, patient, emotionally sensitive tone. Be compassionate and understanding, especially when addressing challenges or setbacks. Your guidance is tender yet powerful.`,
      empowering: `${basePrompt} Speak with strengths-focused confidence building energy. Emphasize their natural gifts, celebrate their potential, and help them see their power. Your tone is bold, inspiring, and achievement-oriented.`
    };
    
    return toneVariations[intent] || toneVariations.practical;
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    
    // In a real implementation, this would be an API call with getSystemPrompt(emotionalIntent)
    // For now, simulate GPT response with cardology context and selected tone
    setTimeout(() => {
      const toneResponses = {
        supportive: `I see such beautiful potential in your ${birthCard.name} birth card! This card is like a loving blueprint that shows your natural entrepreneurial gifts. You're in your ${age}-year cycle where the ${yearlyCards[0]?.type || 'Long Range'} card (${yearlyCards[0]?.card || ''}) is gently opening new doors for you. Trust in your journey - you have everything within you to succeed. What feels most important to explore right now?`,
        practical: `Your ${birthCard.name} birth card is a million-dollar blueprint, period. Here's what's happening: In your ${age}-year cycle, the ${yearlyCards[0]?.type || 'Long Range'} card (${yearlyCards[0]?.card || ''}) is creating specific income opportunities. Let's cut to the chase - what concrete business challenge do you need solved right now?`,
        educational: `Your ${birthCard.name} birth card carries ancient wisdom about entrepreneurial mastery. In Cardology, this card represents specific archetypal energies that govern business success. Currently, your ${age}-year cycle activates the ${yearlyCards[0]?.type || 'Long Range'} card (${yearlyCards[0]?.card || ''}), which teaches us about timing and strategic alignment. Would you like to understand the deeper meaning behind these energetic patterns?`,
        gentle: `I want you to know that your ${birthCard.name} birth card holds such tender wisdom about your path. Sometimes the journey can feel overwhelming, and that's completely okay. Right now, in your ${age}-year cycle, the ${yearlyCards[0]?.type || 'Long Range'} card (${yearlyCards[0]?.card || ''}) is offering gentle guidance for your next steps. Take all the time you need - what would feel most supportive to explore together?`,
        empowering: `Your ${birthCard.name} birth card is PURE POWER! You were born with an entrepreneurial signature that's designed for massive success. In your ${age}-year cycle, the ${yearlyCards[0]?.type || 'Long Range'} card (${yearlyCards[0]?.card || ''}) is literally activating your millionaire frequency right now. You're unstoppable when you align with these energies. What bold vision are you ready to manifest?`
      };
      
      const response = {
        role: 'assistant',
        content: toneResponses[emotionalIntent] || toneResponses.practical
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000);
  };

  const saveConversation = () => {
    if (!activeConversation) {
      // Create new conversation
      const conversation = {
        id: Date.now(),
        name: `Chat ${new Date().toLocaleDateString()}`,
        messages: chatMessages,
        timestamp: new Date(),
        profileId: savedProfiles.find(p => 
          p.name === name && p.month === month && p.day === day && p.year === year
        )?.id
      };
      const updated = [...savedConversations, conversation];
      setSavedConversations(updated);
      setActiveConversation(conversation);
      localStorage.setItem('savedConversations', JSON.stringify(updated));
      // Trigger sparkle effect and notification for new conversation
      triggerSparkle('save-conversation-btn');
      showNotification('✨ Added to your Saved Conversations.');
    } else {
      // Update existing conversation
      const updated = savedConversations.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, messages: chatMessages, timestamp: new Date() }
          : conv
      );
      setSavedConversations(updated);
      localStorage.setItem('savedConversations', JSON.stringify(updated));
      // Show update notification
      showNotification('💾 Conversation updated.');
    }
  };

  // Carousel slides data
  const carouselSlides = [
    {
      emoji: '🃏',
      title: 'Your Card Is Your Business Blueprint',
      subtitle: 'You were born with the strategy. We\'re here to decode it.',
      content: 'Your birth card reveals your strengths, blind spots, marketing style, and growth path. No fluff—just aligned, purpose-driven clarity to build your business without burnout.'
    },
    {
      emoji: '🗓️',
      title: 'Get Forecasts That Actually Mean Something',
      subtitle: 'Your age activates new energies every year.',
      content: 'Your yearly spread shows you exactly what to focus on right now—from what to build to what to release. It\'s business planning with divine timing.'
    },
    {
      emoji: '🚀',
      title: 'Scale with Soul, Not Stress',
      subtitle: 'Custom insights. Real results. Card-based strategy.',
      content: 'You\'ll get your birth card profile, yearly forecast cards, and aligned actions that help you grow a business that actually loves you back. Let\'s get you decoded.'
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (step === 'landing') {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [step, carouselSlides.length]);

  // Notification and sparkle functions
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const triggerSparkle = (elementId) => {
    setSparkleElements(prev => [...prev, elementId]);
    setTimeout(() => {
      setSparkleElements(prev => prev.filter(id => id !== elementId));
    }, 1000);
  };

  // Function to determine current planetary period
  const getCurrentPlanetaryPeriod = () => {
    const today = new Date();
    const currentDate = `${today.getMonth() + 1}/${today.getDate()}`;
    
    for (let i = 0; i < planetaryPeriods.length; i++) {
      const period = planetaryPeriods[i];
      const nextPeriod = planetaryPeriods[i + 1] || planetaryPeriods[0];
      
      if (isDateInRange(currentDate, period.startDate, nextPeriod.startDate)) {
        return period.planet;
      }
    }
    return null;
  };

  const isDateInRange = (date, start, end) => {
    const [currentMonth, currentDay] = date.split('/').map(Number);
    const [startMonth, startDay] = start.split('/').map(Number);
    const [endMonth, endDay] = end.split('/').map(Number);
    
    const currentDayOfYear = currentMonth * 31 + currentDay;
    const startDayOfYear = startMonth * 31 + startDay;
    const endDayOfYear = endMonth * 31 + endDay;
    
    if (startDayOfYear <= endDayOfYear) {
      return currentDayOfYear >= startDayOfYear && currentDayOfYear < endDayOfYear;
    } else {
      return currentDayOfYear >= startDayOfYear || currentDayOfYear < endDayOfYear;
    }
  };

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Million Dollar Birth Card</h1>
        <div className="w-full max-w-2xl">
          {/* Carousel */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 relative overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" 
                 style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {carouselSlides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{slide.emoji}</div>
                    <h2 className="text-2xl font-bold mb-2 text-primary">{slide.title}</h2>
                    <h3 className="text-lg font-semibold mb-4 text-secondary">{slide.subtitle}</h3>
                    <p className="text-gray-700 leading-relaxed">{slide.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'bg-primary w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Skip button */}
          <button
            onClick={handleSkipCarousel}
            className="w-full bg-primary text-white px-6 py-3 rounded-xl shadow hover:bg-gray-800 transition ripple"
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
            placeholder="Name/Business Name"
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
              <label className="block text-sm font-medium mb-2">Saved Profiles</label>
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
            Show Me My Million Dollar Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-purple-50 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-600">Name/Business Name</p>
                <p className="text-xl font-semibold">{name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-xl font-semibold">{month} {day}, {year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-16 p-2 border border-gray-300 rounded text-black text-center"
                  />
                  <button
                    onClick={() => {
                      const newAge = age;
                      getForecastForAge(birthCard.card, newAge).then(setYearlyCards);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    id="save-profile-btn"
                    onClick={saveProfile}
                    className={`text-sm text-blue-600 hover:underline shimmer-hover ${sparkleElements.includes('save-profile-btn') ? 'sparkle' : ''}`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      // Find and delete current profile if it exists
                      const currentProfile = savedProfiles.find(p => 
                        p.name === name && 
                        p.month === month && 
                        p.day === day && 
                        p.year === year
                      );
                      if (currentProfile) {
                        deleteProfile(currentProfile.id);
                      }
                      setStep('form');
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Strategic Outlook */}
        <section className="bg-purple-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-2 text-center text-purple-600">Yearly Energetic Outlook</h2>
          <p className="text-center text-gray-600 mb-6">{name}&apos;s energetic outlook for age {age}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
            {/* Birth Card */}
            {birthCard && (
              <FlippableCard
                card={birthCard.card}
                title="Birth Card"
                description={cardActivities[birthCard.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(birthCard.card)}
                cardType="birth"
              />
            )}
            {/* Show only specific cards from yearly forecast */}
            {yearlyCards.filter(item => 
              ['Long Range', 'Pluto', 'Result', 'Support', 'Development'].includes(item.type)
            ).map((item, idx) => (
              <FlippableCard
                key={idx}
                card={item.card}
                title={item.type}
                description={cardActivities[item.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(item.card)}
                cardType="strategic"
              />
            ))}
          </div>
        </section>

        {/* Planetary Periods */}
        <section className="bg-purple-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-2 text-center text-purple-600">Card Ruling Each 52-day Planetary Period</h2>
          <p className="text-center text-gray-600 mb-6">Current planetary influences throughout the year</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center">
            {planetaryPeriods.map((period, idx) => {
              // Convert date format from "1/25" to "Jan 25"
              const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const [month, day] = dateStr.split('/');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${monthNames[parseInt(month) - 1]} ${day}`;
              };
              
              // Get the corresponding card from yearly forecast based on planet name
              const planetNameLower = period.planet.toLowerCase();
              const yearlyCard = yearlyCards.find(card => card.type.toLowerCase() === planetNameLower);
              const cardToDisplay = yearlyCard?.card || period.card;
              
              return (
                <div key={idx} className="text-center">
                  <p className="text-sm font-medium mb-1">{formatDate(period.startDate)}</p>
                  <p className="text-sm text-purple-600 font-semibold mb-2">{period.planet}</p>
                  <FlippableCard
                    card={cardToDisplay}
                    description={cardActivities[cardToDisplay]?.entrepreneurialActivation}
                    imageUrl={getCardImageUrl(cardToDisplay)}
                    cardType="planetary"
                    isCurrent={getCurrentPlanetaryPeriod() === period.planet}
                  />
                </div>
              );
            })}
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
                {savedConversations
                  .filter(conv => {
                    // Show only conversations for current profile
                    const currentProfile = savedProfiles.find(p => 
                      p.name === name && p.month === month && p.day === day && p.year === year
                    );
                    return conv.profileId === currentProfile?.id;
                  })
                  .map(conv => (
                    <div
                      key={conv.id}
                      className={`p-2 rounded cursor-pointer text-sm flex items-center justify-between group ${
                        activeConversation?.id === conv.id ? 'bg-purple-100' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div
                        onClick={() => {
                          setActiveConversation(conv);
                          setChatMessages(conv.messages);
                        }}
                        className="flex-1"
                      >
                        {conv.name}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newName = prompt('Rename conversation:', conv.name);
                            if (newName) {
                              const updated = savedConversations.map(c => 
                                c.id === conv.id ? { ...c, name: newName } : c
                              );
                              setSavedConversations(updated);
                              localStorage.setItem('savedConversations', JSON.stringify(updated));
                            }
                          }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this conversation?')) {
                              const updated = savedConversations.filter(c => c.id !== conv.id);
                              setSavedConversations(updated);
                              localStorage.setItem('savedConversations', JSON.stringify(updated));
                              if (activeConversation?.id === conv.id) {
                                setActiveConversation(null);
                                setChatMessages([{
                                  role: 'assistant',
                                  content: `Welcome! I'm your Cardology Business Coach. With your ${birthCard.name} birth card, you have unique entrepreneurial gifts waiting to be activated. I'm here to decode your million-dollar blueprint using your birth card, yearly spreads, and planetary cycles. Let's unlock your aligned path to business success. What would you like to explore first?`
                                }]);
                              }
                            }
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                }
                {savedConversations.filter(conv => {
                  const currentProfile = savedProfiles.find(p => 
                    p.name === name && p.month === month && p.day === day && p.year === year
                  );
                  return conv.profileId === currentProfile?.id;
                }).length === 0 && (
                  <p className="text-gray-500 text-sm">No saved conversations</p>
                )}
              </div>
            </div>
            
            {/* Chat Window */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
              <div className="h-64 overflow-y-auto mb-2 border border-gray-200 rounded p-4">
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
              
              {/* Emotional Intent Selector */}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2 text-gray-700">Coaching Tone:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'practical', label: 'Practical', desc: 'Actionable strategies' },
                    { key: 'supportive', label: 'Supportive', desc: 'Encouraging guidance' },
                    { key: 'educational', label: 'Educational', desc: 'Deep wisdom' },
                    { key: 'gentle', label: 'Gentle', desc: 'Soft & patient' },
                    { key: 'empowering', label: 'Empowering', desc: 'Confidence building' }
                  ].map(tone => (
                    <button
                      key={tone.key}
                      onClick={() => setEmotionalIntent(tone.key)}
                      className={`px-3 py-1 text-sm rounded-full border transition ${
                        emotionalIntent === tone.key
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }`}
                      title={tone.desc}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
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
                  id="save-conversation-btn"
                  onClick={saveConversation}
                  className={`bg-secondary text-primary px-3 py-3 rounded-lg hover:bg-yellow-500 ml-1 shimmer-hover ${sparkleElements.includes('save-conversation-btn') ? 'sparkle' : ''}`}
                  title="Save Conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Notification Toast */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}
    </div>
  );
}