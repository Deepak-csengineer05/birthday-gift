import React, { useState, useMemo, useRef } from 'react';
import LetterScene from './LetterScene';
import LetterScroll from './LetterScroll';
import './Section10.css';
import { trackEvent } from '../../analytics';

export default function Section10({ onNext }) {
  const [phase, setPhase] = useState('table'); // table -> reading -> exiting
  const [audioStarted, setAudioStarted] = useState(false);

  const readStartRef = useRef(null);

  const handleOpenEnvelope = () => {
    setPhase('reading');
    setAudioStarted(true);
    readStartRef.current = Date.now();
  };

  const handleFoldLetter = () => {
    setPhase('exiting');
    if (readStartRef.current) {
      const readTime = Math.floor((Date.now() - readStartRef.current) / 1000);
      trackEvent('Section10', 'letter_read_time', { seconds: readTime });
    }
    setTimeout(() => {
      onNext();
    }, 1000); 
  };

  return (
    <div className="s10-root">
      {/* Background BGM (Placeholder bg-music-4.webm or equivalent) */}
      <audio 
        src="/bg-music-4.webm" 
        autoPlay 
        loop
        style={{ display: 'none' }} 
      />

      {/* 3D Scene - Persists throughout to handle open/close animations natively */}
      <div className={`s10-scene-wrapper ${phase === 'exiting' ? 'fade-scene' : ''}`}>
        <LetterScene 
          onOpen={handleOpenEnvelope} 
          active={phase === 'table'} 
          isFoldingBack={phase === 'exiting'}
        />
      </div>

      {/* 2D HTML Overlay for Reading */}
      <LetterScroll 
        show={phase === 'reading'} 
        onFold={handleFoldLetter} 
      />
    </div>
  );
}
