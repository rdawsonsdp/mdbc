'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getBirthCardFromDateCSV } from '../utils/birthdateCardCSV';
import { getForecastForAge } from '../utils/yearlyForecastLookup';
import { getAllPlanetaryPeriods } from '../utils/planetaryPeriodLookup';
import cardActivities from '../lib/data/cardToActivities.json';
import { getEnhancedCardData, validateCSVAccess } from '../utils/enhancedCardSystem.js';

// Enhanced Card component with flip animation and scrollable descriptions
const FlippableCard = ({ card, title, description, imageUrl, isCurrent = false, cardType = 'default', onCardClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(card, cardType);
    } else {
      setIsFlipped(!isFlipped);
      // Add haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <div className="relative">
      {title && <h3 className="text-lg font-bold mb-2 text-center text-gray-800">{title}</h3>}
      <div 
        className={`card-container ${isFlipped ? 'flipped' : ''} ${isCurrent ? 'current-card' : ''}`}
        onClick={handleCardClick}
        style={{ width: '100px', height: '140px' }}
      >
        <div className="card-inner">
          <div className="card-front">
            <Image 
              src={imageUrl} 
              alt={card}
              width={100}
              height={140}
              className={`w-full h-full object-cover rounded-lg shadow-lg card-hover shimmer-hover card-shimmer card-glow mobile-feedback fade-in ${
                isCurrent ? 'ring-4 ring-gold-400 ring-opacity-60' : ''
              }`}
            />
          </div>
          <div className="card-back bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-xl border border-gray-200">
            <div className="card-description text-sm text-gray-700 leading-relaxed">
              <div className="font-semibold text-navy-700 mb-2 text-center border-b border-gold-300 pb-2">
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
  const [notification, setNotification] = useState(null);
  const [sparkleElements, setSparkleElements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enhancedCardData, setEnhancedCardData] = useState(null);
  const [isLoadingEnhancedData, setIsLoadingEnhancedData] = useState(false);
  const [csvValidation, setCsvValidation] = useState(null);
  
  // Debug function to validate CSV access
  const validateCSVs = async () => {
    const validation = await validateCSVAccess();
    setCsvValidation(validation);
    console.log('CSV Validation Results:', validation);
    showNotification(`CSV Access: ${validation.errors.length === 0 ? '✅ All files accessible' : '❌ Some files missing'}`);
  };

  // Card Modal component
  const CardModal = ({ card, type, isOpen, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [cardDescription, setCardDescription] = useState('');

    useEffect(() => {
      if (isOpen && card) {
        setIsFlipped(false);
        
        // Use enhanced activation data if available
        if (selectedCard?.activation) {
          setCardDescription(selectedCard.activation);
        } else {
          // Fall back to legacy card activities data
          const cardData = cardActivities[card];
          if (cardData) {
            if (type === 'birth') {
              setCardDescription(cardData.entrepreneurialActivation || cardData.description || 'Birth card description not available.');
            } else if (type === 'forecast' || type === 'planetary') {
              setCardDescription(cardData.entrepreneurialActivation || cardData.description || 'Card description not available.');
            }
          } else {
            setCardDescription('Card description not available.');
          }
        }
      }
    }, [card, type, isOpen]);

    const handleFlip = () => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setIsFlipped(!isFlipped);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
        <div className="relative w-[260px] h-[360px] sm:w-[320px] sm:h-[440px]" onClick={(e) => e.stopPropagation()}>
          <div className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`} onClick={handleFlip}>
            {/* Front Side */}
            <div className="absolute w-full h-full backface-hidden rounded-lg shadow-xl cursor-pointer">
              <Image 
                src={getCardImageUrl(card)} 
                alt={card}
                width={320}
                height={440}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            {/* Back Side */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-lg shadow-xl p-4 overflow-hidden flex flex-col cursor-pointer">
              <h2 className="font-semibold text-lg mb-2 text-navy-800">{card}</h2>
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="text-sm whitespace-pre-line text-gray-700" dangerouslySetInnerHTML={{ 
                  __html: cardDescription.replace(/\\n/g, '<br>').replace(/\\. /g, '.<br><br>') 
                }} />
              </div>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-red-400 z-50">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

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

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= carouselSlides.length) {
        // If we're at the last slide, go to the form
        setStep('form');
        return prev; // Keep current slide index unchanged
      }
      return nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleSubmit = async () => {
    const dateKey = `${month} ${parseInt(day)}`;
    
    // Use CSV-based birth card lookup (STEP 1)
    const monthIndex = getMonthIndex(month) + 1; // Convert to 1-12
    const birthCardData = await getBirthCardFromDateCSV(monthIndex, parseInt(day));
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
    
    // Get enhanced card data from CSV system
    setIsLoadingEnhancedData(true);
    try {
      const enhancedData = await getEnhancedCardData(
        birthCardData.card,
        calculatedAge,
        dateKey,
        parseInt(year)
      );
      setEnhancedCardData(enhancedData);
      console.log('Enhanced card data loaded:', enhancedData);
    } catch (error) {
      console.error('Error loading enhanced card data:', error);
    }
    setIsLoadingEnhancedData(false);
    
    // Keep legacy data for backward compatibility
    const forecast = await getForecastForAge(birthCardData.card, calculatedAge);
    setYearlyCards(forecast);
    
    const periods = getAllPlanetaryPeriods(dateKey);
    setPlanetaryPeriods(periods);
    
    setStep('results');
    
    // Initialize chat with welcome message
    setChatMessages([{
      role: 'assistant',
      content: `Welcome! I am your Cardology Business Coach, I'm here to help you activate your entrepreneurial gifts and decode your million-dollar blueprint using your birth card, yearly spreads, and planetary cycles—so you can unlock your most aligned path to business success.`
    }]);
  };

  const saveProfile = () => {
    // Check if profile already exists
    const existingProfile = savedProfiles.find(p => 
      p.name === name && 
      p.month === month && 
      p.day === day && 
      p.year === year
    );
    
    if (existingProfile) {
      showNotification('⚠️ Profile already exists in saved profiles.');
      return;
    }
    
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

  const loadProfile = async (profile) => {
    setName(profile.name);
    setMonth(profile.month);
    setDay(profile.day);
    setYear(profile.year);
    
    // Automatically generate the reading with profile data
    const dateKey = `${profile.month} ${parseInt(profile.day)}`;
    
    // Use CSV-based birth card lookup (STEP 1)
    const monthIndex = getMonthIndex(profile.month) + 1;
    const birthCardData = await getBirthCardFromDateCSV(monthIndex, parseInt(profile.day));
    setBirthCard(birthCardData);
    
    // Calculate age properly accounting for whether birthday has passed this year
    const today = new Date();
    const birthDate = new Date(parseInt(profile.year), getMonthIndex(profile.month), parseInt(profile.day));
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
      content: `Welcome! I am your Cardology Business Coach, I'm here to help you activate your entrepreneurial gifts and decode your million-dollar blueprint using your birth card, yearly spreads, and planetary cycles—so you can unlock your most aligned path to business success.`
    }]);
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
    
    // Simulate GPT response with cardology context
    setTimeout(() => {
      const response = {
        role: 'assistant',
        content: `Your ${birthCard.name} birth card is a million-dollar blueprint. Here's what's happening: In your ${age}-year cycle, the ${yearlyCards[0]?.type || 'Long Range'} card (${yearlyCards[0]?.card || ''}) is creating specific opportunities. What would you like to explore about your cardology insights?`
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

  // Removed auto-advance carousel - now manual navigation only

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

  // Card modal handlers
  const handleCardClick = (card, type) => {
    setSelectedCard({ card, type });
    setIsModalOpen(true);
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };
  
  // Enhanced card modal handler with CSV data
  const handleEnhancedCardClick = async (card, type, period = null) => {
    let activation = '';
    
    if (enhancedCardData && period) {
      activation = enhancedCardData.activations[period] || '';
    }
    
    setSelectedCard({ card, type, period, activation });
    setIsModalOpen(true);
    
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
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
            
            {/* Navigation arrows and indicators */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevSlide}
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <div className="flex space-x-2">
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
              
              <button
                onClick={nextSlide}
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
                aria-label="Next slide"
              >
                Next
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Skip text */}
          <div className="text-center">
            <button
              onClick={handleSkipCarousel}
              className="text-gray-600 hover:text-primary transition-colors underline"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Enter Your Information</h2>
          
          {savedProfiles.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Saved Profiles</label>
              <select 
                onChange={(e) => {
                  const profile = savedProfiles.find(p => p.id === parseInt(e.target.value));
                  if (profile) loadProfile(profile);
                }}
                className="w-full p-3 border border-secondary rounded-lg text-black"
              >
                <option value="">-- Select Saved Profile --</option>
                {savedProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} - {profile.birthDate}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              placeholder="Enter name/business name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-secondary rounded-lg text-black"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Birth Date</label>
            <div className="grid grid-cols-3 gap-2">
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
          </div>
          
          {/* Save and Delete Profile Buttons */}
          {name && month && day && year && (
            <div className="mb-6 flex gap-2 justify-center">
              <button
                onClick={() => {
                  saveProfile();
                  showNotification('✨ Profile saved successfully!');
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                </svg>
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
                    showNotification('🗑️ Profile deleted successfully!');
                  } else {
                    showNotification('❌ No matching profile found to delete.');
                  }
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
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
        {/* Navigation and Instructions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setStep('form')}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Form
          </button>
          <p className="text-gray-600 text-sm">Click cards to flip and view details</p>
        </div>
        
        {/* Header Section */}
        <div className="bg-cream-100 p-6 rounded-lg mb-8 border border-gold-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-600">Name/Business Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xl font-semibold p-2 border border-navy-300 rounded text-black bg-white"
                  />
                ) : (
                  <p className="text-xl font-semibold">{name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                {isEditing ? (
                  <div className="flex gap-1">
                    <select 
                      value={month} 
                      onChange={(e) => setMonth(e.target.value)}
                      className="p-2 border border-navy-300 rounded text-black text-sm"
                    >
                      <option value="">Month</option>
                      {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                        <option key={m} value={m}>{m.slice(0,3)}</option>
                      ))}
                    </select>
                    <select 
                      value={day} 
                      onChange={(e) => setDay(e.target.value)}
                      className="p-2 border border-navy-300 rounded text-black text-sm"
                    >
                      <option value="">Day</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                    <select 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)}
                      className="p-2 border border-navy-300 rounded text-black text-sm"
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xl font-semibold">{month} {day}, {year}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={age}
                    onChange={async (e) => {
                      const newAge = parseInt(e.target.value);
                      setAge(newAge);
                      
                      // Update yearly forecasts when age changes
                      if (birthCard && newAge && !isNaN(newAge)) {
                        const forecast = await getForecastForAge(birthCard.card, newAge);
                        setYearlyCards(forecast);
                        
                        // Update enhanced card data which includes planetary period dates
                        const dateKey = `${month} ${parseInt(day)}`;
                        setIsLoadingEnhancedData(true);
                        try {
                          const enhancedData = await getEnhancedCardData(
                            birthCard.card,
                            newAge,
                            dateKey,
                            parseInt(year)
                          );
                          setEnhancedCardData(enhancedData);
                          console.log('Enhanced card data updated for new age:', enhancedData);
                        } catch (error) {
                          console.error('Error updating enhanced card data:', error);
                        }
                        setIsLoadingEnhancedData(false);
                        
                        // Update legacy planetary periods
                        const periods = getAllPlanetaryPeriods(dateKey);
                        setPlanetaryPeriods(periods);
                        
                        showNotification(`📅 Forecast updated for age ${newAge}`);
                      }
                    }}
                    className="w-16 p-2 border border-navy-300 rounded text-black text-center"
                    min="1"
                    max="120"
                  />
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          // Save changes and regenerate entire reading
                          setIsEditing(false);
                          
                          // Regenerate everything with new data
                          const dateKey = `${month} ${parseInt(day)}`;
                          
                          // Use CSV-based birth card lookup (STEP 1)
                          const monthIndex = getMonthIndex(month) + 1;
                          const birthCardData = await getBirthCardFromDateCSV(monthIndex, parseInt(day));
                          setBirthCard(birthCardData);
                          
                          // Recalculate age properly
                          const today = new Date();
                          const birthDate = new Date(parseInt(year), getMonthIndex(month), parseInt(day));
                          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                          
                          // Check if birthday hasn't occurred yet this year
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            calculatedAge--;
                          }
                          
                          setAge(calculatedAge);
                          
                          // Get new yearly forecast
                          const forecast = await getForecastForAge(birthCardData.card, calculatedAge);
                          setYearlyCards(forecast);
                          
                          // Get new planetary periods
                          const periods = getAllPlanetaryPeriods(dateKey);
                          setPlanetaryPeriods(periods);
                          
                          // Update enhanced card data which includes planetary period dates
                          setIsLoadingEnhancedData(true);
                          try {
                            const enhancedData = await getEnhancedCardData(
                              birthCardData.card,
                              calculatedAge,
                              dateKey,
                              parseInt(year)
                            );
                            setEnhancedCardData(enhancedData);
                            console.log('Enhanced card data updated after save:', enhancedData);
                          } catch (error) {
                            console.error('Error updating enhanced card data:', error);
                          }
                          setIsLoadingEnhancedData(false);
                          
                          // Reset chat with new welcome message
                          setChatMessages([{
                            role: 'assistant',
                            content: `Welcome! I am your Cardology Business Coach, I'm here to help you activate your entrepreneurial gifts and decode your million-dollar blueprint using your birth card, yearly spreads, and planetary cycles—so you can unlock your most aligned path to business success.`
                          }]);
                          
                          showNotification('✨ Information updated and reading refreshed!');
                        }}
                        className="px-3 py-1 bg-gold-600 text-white rounded hover:bg-gold-700 transition-colors text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // Could restore previous values if needed
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 bg-navy-600 text-white rounded hover:bg-navy-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        id="save-profile-btn"
                        onClick={() => {
                          saveProfile();
                          showNotification('✨ Profile saved successfully!');
                        }}
                        className={`px-3 py-1 bg-gold-600 text-white rounded hover:bg-gold-700 transition-colors text-sm shimmer-hover ${sparkleElements.includes('save-profile-btn') ? 'sparkle' : ''}`}
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
                            showNotification('🗑️ Profile deleted successfully!');
                          }
                          setStep('form');
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Strategic Outlook */}
        <section className="bg-cream-100 p-6 rounded-lg mb-8 border border-gold-200">
          <h2 className="text-2xl font-bold mb-2 text-center text-navy-600">Yearly Strategic Outlook</h2>
          <p className="text-center text-gray-600 mb-6">{name} Strategic Outlook for {age}</p>
          
          {isLoadingEnhancedData && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy-600 mr-3"></div>
                <span className="text-navy-600">Loading enhanced card data...</span>
              </div>
            </div>
          )}
          
          {/* Debug: Show enhanced data status */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center py-2">
              <button onClick={validateCSVs} className="text-sm bg-gray-200 px-3 py-1 rounded">
                Test CSV Access
              </button>
              {enhancedCardData && (
                <p className="text-xs text-green-600 mt-1">
                  Enhanced data loaded: {enhancedCardData.strategicOutlook?.length || 0} strategic, {enhancedCardData.planetaryPeriods?.length || 0} planetary
                </p>
              )}
              {csvValidation && (
                <p className="text-xs text-gray-600 mt-1">
                  CSV Status: {csvValidation.errors.length === 0 ? '✅ All OK' : `❌ ${csvValidation.errors.length} errors`}
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
            {/* Enhanced Birth Card */}
            {birthCard && enhancedCardData && (
              <FlippableCard
                card={birthCard.card}
                title="Birth Card"
                description={enhancedCardData.birthCard?.activation || cardActivities[birthCard.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(birthCard.card)}
                cardType="birth"
                onCardClick={(card, type) => handleEnhancedCardClick(card, type, 'Birth')}
              />
            )}
            {/* Fallback Birth Card */}
            {birthCard && !enhancedCardData && (
              <FlippableCard
                card={birthCard.card}
                title="Birth Card"
                description={cardActivities[birthCard.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(birthCard.card)}
                cardType="birth"
                onCardClick={handleCardClick}
              />
            )}
            
            {/* Enhanced Strategic Cards */}
            {enhancedCardData?.strategicOutlook?.map((item, idx) => (
              <FlippableCard
                key={`enhanced-${idx}`}
                card={item.card}
                title={item.displayName}
                description={item.activation}
                imageUrl={item.imagePath}
                cardType="strategic"
                onCardClick={(card, type) => handleEnhancedCardClick(card, type, item.period)}
              />
            )) || 
            /* Fallback Strategic Cards */
            yearlyCards.filter(item => 
              ['Long Range', 'Pluto', 'Result', 'Support', 'Development'].includes(item.type)
            ).map((item, idx) => (
              <FlippableCard
                key={`legacy-${idx}`}
                card={item.card}
                title={item.type}
                description={cardActivities[item.card]?.entrepreneurialActivation}
                imageUrl={getCardImageUrl(item.card)}
                cardType="strategic"
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </section>

        {/* Planetary Periods */}
        <section className="bg-cream-100 p-6 rounded-lg mb-8 border border-gold-200">
          <h2 className="text-2xl font-bold mb-2 text-center text-navy-600">Card Ruling Each 52-day Business Cycle</h2>
          <p className="text-center text-gray-600 mb-6">Current planetary influences throughout the year</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center">
            {/* Enhanced Planetary Periods */}
            {enhancedCardData?.planetaryPeriods?.map((period, idx) => (
              <div key={`enhanced-${idx}`} className="text-center">
                <p className="text-sm font-medium mb-1">{period.formattedStartDate || ''}</p>
                <p className="text-sm text-navy-600 font-semibold mb-2">{period.displayName}</p>
                <FlippableCard
                  card={period.card}
                  description={period.activation}
                  imageUrl={period.imagePath}
                  cardType="planetary"
                  isCurrent={period.isCurrent}
                  onCardClick={(card, type) => handleEnhancedCardClick(card, type, period.period)}
                />
              </div>
            )) ||
            /* Fallback Planetary Periods */
            planetaryPeriods.map((period, idx) => {
              // Convert date format from "1/25" to "mm/dd/yyyy"
              const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const [monthNum, dayNum] = dateStr.split('/');
                const currentYear = new Date().getFullYear();
                const birthDate = new Date(parseInt(year), getMonthIndex(month), parseInt(day));
                const periodMonth = parseInt(monthNum) - 1;
                const periodDay = parseInt(dayNum);
                
                // Calculate the correct year for this planetary period
                const periodDate = new Date(currentYear, periodMonth, periodDay);
                const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
                
                let periodYear = currentYear;
                if (periodDate < birthdayThisYear) {
                  periodYear = currentYear + 1;
                }
                
                return `${monthNum.padStart(2, '0')}/${dayNum.padStart(2, '0')}/${periodYear}`;
              };
              
              // Get the corresponding card from yearly forecast based on planet name
              const planetNameLower = period.planet.toLowerCase();
              const yearlyCard = yearlyCards.find(card => card.type.toLowerCase() === planetNameLower);
              const cardToDisplay = yearlyCard?.card || period.card;
              
              return (
                <div key={`legacy-${idx}`} className="text-center">
                  <p className="text-sm font-medium mb-1">{formatDate(period.startDate)}</p>
                  <p className="text-sm text-navy-600 font-semibold mb-2">{period.planet}</p>
                  <FlippableCard
                    card={cardToDisplay}
                    description={cardActivities[cardToDisplay]?.entrepreneurialActivation}
                    imageUrl={getCardImageUrl(cardToDisplay)}
                    cardType="planetary"
                    isCurrent={getCurrentPlanetaryPeriod() === period.planet}
                    onCardClick={handleCardClick}
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
                        activeConversation?.id === conv.id ? 'bg-gold-100' : 'hover:bg-cream-200'
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
                                  content: `Welcome! I am your Cardology Business Coach, I'm here to help you activate your entrepreneurial gifts and decode your million-dollar blueprint using your birth card, yearly spreads, and planetary cycles—so you can unlock your most aligned path to business success.`
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
      
      {/* Card Modal */}
      <CardModal
        card={selectedCard?.card}
        type={selectedCard?.type}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}