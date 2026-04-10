import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import './Section4.css';
import { trackEvent } from '../../analytics';

const LETTERS = [
  {
    image: "gift1.jpeg", // Add your image path here (e.g., "/images/memory1.jpg")
    text: "Dear Poojetha,\n\nOpening this first box reminds me of the first time we met. [Placeholder text for Letter 1]"
  },
  {
    image: "gift2.jpeg",
    text: "Second box, second memory! [Placeholder text for Letter 2]"
  },
  {
    image: "gift3.jpeg",
    text: "You've found the third gift. [Placeholder text for Letter 3]"
  },
  {
    image: null,
    text: "Almost there... four down, one to go! [Placeholder text for Letter 4]"
  },
  {
    image: null,
    text: "The final box. I hope this birthday is as special as you are to me. [Placeholder text for Letter 5]"
  }
];

export default function Section4({ onNext }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openedBoxes, setOpenedBoxes] = useState([false, false, false, false, false]);
  const [lettersViewed, setLettersViewed] = useState([false, false, false, false, false]);
  const [activeLetter, setActiveLetter] = useState(null); // null or 0-4
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState(null); // 'yes' or 'no'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleBox = useCallback((index) => {
    if (showFeedback) return;
    
    setOpenedBoxes((prev) => {
      const newOpened = [...prev];
      newOpened[index] = !newOpened[index];
      
      if (newOpened[index]) {
        // Box just opened
        trackEvent('Section4', 'gift_box_open', { boxIndex: index });
        setActiveLetter(index);
        setLettersViewed(prevViewed => {
          const newViewed = [...prevViewed];
          newViewed[index] = true;
          return newViewed;
        });
      } else {
        // Box just closed
        if (activeLetter === index) {
          setActiveLetter(null);
        }
      }
      return newOpened;
    });
  }, [activeLetter, showFeedback]);

  const closeLetter = useCallback(() => {
    setActiveLetter(null);
    // Also close the box visually
    setOpenedBoxes(prev => {
      const newOpened = [...prev];
      if (activeLetter !== null) {
        newOpened[activeLetter] = false;
      }
      return newOpened;
    });
  }, [activeLetter]);

  // Check if all viewed and letter overlay is closed
  useEffect(() => {
    if (activeLetter === null && lettersViewed.every(v => v === true)) {
      // Small timeout to allow letter to transition down before showing dialog
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeLetter, lettersViewed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFeedback || activeLetter !== null) return; // Block navigation if letter open or feedback showing

      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % 5);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + 5) % 5);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Prevent page scroll
        toggleBox(activeIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, activeLetter, showFeedback, toggleBox]);

  const handleFeedback = (response) => {
    trackEvent('Section4', 'feedback_response', { response });
    setFeedbackResponse(response);
  };

  return (
    <div className="section4-container">
      <div className="section-heading">
        <h1>Some gifts for you</h1>
      </div>
      <div className="canvas-container">
        <Canvas 
          camera={{ position: [0, 2.5, 9.5], fov: isMobile ? 65 : 45 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
        >
          <Experience 
            activeIndex={activeIndex}
            openedBoxes={openedBoxes}
            onBoxClick={(index) => {
              if (activeLetter !== null) {
                // If a letter is open, clicking anywhere on canvas could close it, or we do nothing.
                return;
              }
              setActiveIndex(index);
              toggleBox(index);
            }}
          />
        </Canvas>
      </div>

      <div className="ui-overlay">
        {!showFeedback && activeLetter === null && (
          <div className="controls-hint">
            Use <kbd>←</kbd> <kbd>→</kbd> to select, <kbd>Space</kbd> or Click to open
          </div>
        )}
      </div>

      <div className={`letter-overlay ${activeLetter !== null ? 'visible' : ''}`} style={{ pointerEvents: activeLetter !== null ? 'auto' : 'none' }}>
        <div className={`letter-content ${activeLetter !== null ? 'show' : ''}`}>
          <button className="letter-close-btn" onClick={closeLetter}>×</button>
          <div className="letter-body">
            {activeLetter !== null && (
              <>
                <div className="letter-image-container">
                  {LETTERS[activeLetter].image ? (
                    <img src={LETTERS[activeLetter].image} alt={`Memory ${activeLetter + 1}`} />
                  ) : (
                    <div className="image-placeholder">
                      <span>📸 Add Your Image Here</span>
                    </div>
                  )}
                </div>
                <div className="letter-text">
                  {LETTERS[activeLetter].text}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`feedback-dialog-overlay ${showFeedback ? 'show' : ''}`}>
        <div className="feedback-dialog">
          <h2>Did you like the gift?</h2>
          
          {!feedbackResponse && (
            <div className="feedback-buttons">
              <button className="feedback-btn yes" onClick={() => handleFeedback('yes')}>Yes</button>
              <button className="feedback-btn no" onClick={() => handleFeedback('no')}>No</button>
            </div>
          )}
          
          {feedbackResponse === 'yes' && (
            <div className="feedback-response">
              <p>Really, Wait still many to go can we go next</p>
              <button className="next-section-btn" onClick={onNext}>Next Section</button>
            </div>
          )}

          {feedbackResponse === 'no' && (
            <div className="feedback-response">
              <p>Sorry, These gift not made you happy ,next time it will make you smile I sure..</p>
              <button className="next-section-btn" onClick={onNext}>Next Section</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
