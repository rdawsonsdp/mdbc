'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import CardModal from './CardModal';

const FlippableCard = ({ 
  card, 
  title, 
  description, 
  imageUrl, 
  isCurrent = false, 
  cardType = 'default',
  personData = null 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getCardDescription = () => {
    if (description) {
      return description;
    }
    return 'Card description not available.';
  };

  return (
    <div className="relative">
      {title && <h3 className="text-lg font-bold mb-2 text-center text-navy-700">{title}</h3>}
      <div 
        className={`card-container ${isCurrent ? 'current-card' : ''}`}
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
              className={`w-full h-full object-cover rounded-lg shadow-lg card-hover shimmer-hover card-shimmer card-glow mobile-feedback fade-in cursor-pointer ${
                isCurrent ? 'ring-4 ring-gold-400 ring-opacity-60' : ''
              }`}
            />
          </div>
          <div className="card-back bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-xl border border-gray-200">
            <div className="card-description text-sm text-gray-700 leading-relaxed">
              <div className="font-semibold text-navy-700 mb-2 text-center border-b border-gold-300 pb-2">
                {card} - {cardType === 'birth' ? 'Birth Card' : cardType === 'planetary' ? 'Planetary Influence' : 'Strategic Card'}
              </div>
              <div className="space-y-2 text-left">
                {description ? (
                  <div className="text-left" dangerouslySetInnerHTML={{ 
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
      
      {/* Card Modal */}
      <CardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        card={card}
        type={cardType}
        personData={personData}
        description={description}
        title={title}
      />
    </div>
  );
};

export default FlippableCard;
