import React, { useState, useMemo, useEffect } from 'react';
import './Section9.css';
import { trackEvent } from '../../analytics';

const MOOD_CARDS = [
  { id: 1, front: "Sad", back: "I will be your shoulder" },
  { id: 2, front: "Happy", back: "Let's celebrate together!" },
  { id: 3, front: "Alone", back: "I am always here with you" },
  { id: 4, front: "Worrying", back: "We will face it together" },
  { id: 5, front: "Need to speak", back: "Call me, I'm listening" },
  { id: 6, front: "Need to cry", back: "Let it out, I've got you" },
  { id: 7, front: "Stressed", back: "Take a deep breath" },
  { id: 8, front: "Angry", back: "Vent it all out to me" },
  { id: 9, front: "Confused", back: "We will figure it out" },
  { id: 10, front: "Tired", back: "Rest now, darling" },
  { id: 11, front: "Miss me", back: "I miss you more!" }
];

export default function Section9({ onNext }) {
  const [flippedCards, setFlippedCards] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // Check right away
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = (id) => {
    if (!flippedCards[id]) {
      const cardLabel = MOOD_CARDS.find(c => c.id === id)?.front || id;
      trackEvent('Section9', 'card_flip', { cardId: id, label: cardLabel });
    }
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const flippedCount = Object.values(flippedCards).filter(Boolean).length;
  const showNext = flippedCount >= 3;

  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: (Math.random() * 100) + '%',
      left: (Math.random() * 100) + '%',
      size: (Math.random() * 2 + 1) + 'px',
      delay: (Math.random() * 5) + 's',
      duration: (Math.random() * 3 + 2) + 's'
    }));
  }, []);

  return (
    <div className="s9-root">
      {/* Background BGM */}
      <audio src="/bg-music-4.webm" autoPlay loop style={{ display: 'none' }} />

      <div className="s9-nebula s9-nebula-1"></div>
      <div className="s9-nebula s9-nebula-2"></div>
      <div className="s9-nebula s9-nebula-3"></div>
      <div className="s9-nebula s9-nebula-4"></div>

      <div className="s9-starfield-container">
        {stars.map(star => (
          <div key={star.id} className="s9-star" style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}></div>
        ))}
      </div>

      <div className="s9-vignette"></div>

      <div className="s9-container">
        <div className="s9-header-area">
          <h2 className="s9-title">Tap a card if you feel...</h2>
        </div>
        
        {isMobile ? (
          <div className="s9-mobile-grid-area">
            <div className="s9-mobile-grid">
              {MOOD_CARDS.map((card, index) => {
                const isFlipped = !!flippedCards[card.id];
                return (
                  <div 
                    key={`mobile-${card.id}-${index}`} 
                    className={isFlipped ? "s9-card-wrapper flipped" : "s9-card-wrapper"}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className="s9-card-inner">
                      <div className="s9-card-front">
                        <span>{card.front}</span>
                      </div>
                      <div className="s9-card-back">
                        <span>{card.back}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="s9-marquee">
            <div className="s9-marquee-track">
              {/* Render 3 sets of cards to seamlessly loop forever */}
              {[...MOOD_CARDS, ...MOOD_CARDS, ...MOOD_CARDS].map((card, index) => {
                const isFlipped = !!flippedCards[card.id];
                return (
                  <div 
                    key={`desktop-${card.id}-${index}`} 
                    className={isFlipped ? "s9-card-wrapper flipped" : "s9-card-wrapper"}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className="s9-card-inner">
                      <div className="s9-card-front">
                        <span>{card.front}</span>
                      </div>
                      <div className="s9-card-back">
                        <span>{card.back}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="s9-footer">
          {showNext ? (
             <button className="s9-next-btn animate-fade-in" onClick={onNext}>
               Next
             </button>
          ) : (
             <p className="s9-hint">Tap the cards to flip them</p>
          )}
        </div>
      </div>
    </div>
  );
}
