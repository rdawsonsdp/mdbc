'use client'

import React from 'react';
import Image from 'next/image';
import cardActivities from '../lib/data/cardToActivities.json';

const CardModal = ({ isOpen, onClose, card, type, personData }) => {
  if (!isOpen) return null;

  const getCardImageUrl = (card) => {
    if (!card) return '/cards/Joker.png';
    // Remove any spaces and convert card format (e.g., "A ♥" to "AH", "10 ♦" to "10D")
    const cleanCard = card.replace(/\s+/g, '');
    const suit = cleanCard.slice(-1);
    const rank = cleanCard.slice(0, -1);
    const suitMap = { '♥': 'H', '♦': 'D', '♣': 'C', '♠': 'S' };
    return `/cards/${rank}${suitMap[suit] || 'S'}.png`;
  };

  const getCardDescription = () => {
    // Get card data from the activities JSON
    const cardData = cardActivities[card];
    if (cardData) {
      if (type === 'birth') {
        return cardData.entrepreneurialActivation || cardData.description || 'Birth card description not available.';
      } else if (type === 'planetary') {
        return cardData.entrepreneurialActivation || cardData.description || 'Planetary influence description not available.';
      } else if (type === 'strategic') {
        return cardData.entrepreneurialActivation || cardData.description || 'Strategic card description not available.';
      }
    }
    return 'Card description not available.';
  };

  const getModalTitle = () => {
    switch (type) {
      case 'birth':
        return 'Birth Card';
      case 'planetary':
        return 'Planetary Influence';
      case 'strategic':
        return 'Strategic Card';
      default:
        return 'Card Reading';
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">{getModalTitle()}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          <div className="modal-card-container">
            {/* Modal Card Front */}
            <div className="modal-card-front">
              <Image 
                src={getCardImageUrl(card)} 
                alt={card}
                width={150}
                height={225}
                className="modal-card-image"
              />
              <div className="modal-card-label">
                {card}
              </div>
            </div>
            
            {/* Modal Card Back */}
            <div className="modal-card-back">
              <div className="modal-description">
                <div 
                  className="modal-description-line"
                  dangerouslySetInnerHTML={{ 
                    __html: getCardDescription().replace(/\n/g, '<br>').replace(/\. /g, '.<br><br>') 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
