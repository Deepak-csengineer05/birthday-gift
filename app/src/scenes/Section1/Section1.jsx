import React, { useState, useRef, useEffect } from 'react';
import './Section1.css';

export default function Section1({ onNext, onVideoStart }) {
  const [showNextButton, setShowNextButton] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Start the music first
      if (onVideoStart) onVideoStart();
      
      // Delay the video slightly so the music begins playing beforehand
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(e => console.error("Section 1 video autoplay blocked:", e));
        }
      }, 800); // 800ms delay, adjust if needed for perfect sync!
    }
  }, []);

  const handleVideoEnded = () => {
    setShowNextButton(true);
  };

  return (
    <div className="section1-wrapper">
      <video 
        ref={videoRef}
        src="/section1.mp4" 
        className="s1-video"
        onEnded={handleVideoEnded}
        playsInline
        muted
      />
      
      <div className={`s1-image-overlay ${showNextButton ? 'active' : ''}`}>
        {showNextButton && (
          <div className="s1-image-container">
            <img src="/section1-end.png" alt="End scene" className="s1-end-image" />
            <div className="s1-invisible-trigger" onClick={onNext} title="Click Here to proceed"></div>
          </div>
        )}
      </div>
    </div>
  );
}
