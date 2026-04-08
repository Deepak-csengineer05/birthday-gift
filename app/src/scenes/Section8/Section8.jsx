import React, { useState, useRef, useEffect } from 'react';
import './Section8.css';
import DiaryScene from './DiaryScene';
import DiaryBook  from './DiaryBook';
import { trackEvent } from '../../analytics';

const QUOTES = [
  "Every moment with you feels like a dream I never want to wake from. 💜",
  "You make ordinary days feel like the most beautiful adventure.",
  "In a world of chaos, you are my favourite kind of calm.",
  "Not all stars shine in the sky — some walk beside us every day. 🌟",
  "Thank you for being the reason I smile without knowing why.",
  "You are the story I will always want to tell. ✨",
  "Some bonds are written in stars — ours was written in gold. 💛",
];

const TRACKS = [
  '/bg-music-1.webm',
  '/bg-music-2.webm',
  '/bg-music-3.webm',
];

export default function Section8({ onNext }) {
  const [phase,     setPhase]     = useState('table');   // 'table' | 'reading' | 'favourite'
  const [favourite, setFavourite] = useState(null);

  // Audio State & Logic
  const bgAudioRef = useRef(null);
  const tapeAudioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); // Tape starts stopped
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (tapeAudioRef.current) {
      tapeAudioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (tapeAudioRef.current && isPlaying) {
      tapeAudioRef.current.pause();
      tapeAudioRef.current.load(); // Forces the new song to load
      tapeAudioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }, [trackIndex]);

  useEffect(() => {
    if (isPlaying) {
      // Pause Section BG, Play Tape
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (tapeAudioRef.current) tapeAudioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    } else {
      // Pause Tape, Play Section BG
      if (tapeAudioRef.current) tapeAudioRef.current.pause();
      if (bgAudioRef.current) bgAudioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }, [isPlaying]);

  const handleNextTrack = () => setTrackIndex(i => (i + 1) % TRACKS.length);
  const handlePrevTrack = () => setTrackIndex(i => (i - 1 + TRACKS.length) % TRACKS.length);
  const handleTogglePlay = () => setIsPlaying(prev => !prev);
  const handleVolumeUp = () => setVolume(v => Math.min(1, v + 0.1));
  const handleVolumeDown = () => setVolume(v => Math.max(0, v - 0.1));

  return (
    <div className="s8-root">
      {/* Background Audio of the Section */}
      <audio 
        ref={bgAudioRef}
        src="/bg-music-4.webm" 
        autoPlay 
        loop
        style={{ display: 'none' }} 
      />

      {/* Tape Recorder Audio */}
      <audio 
        ref={tapeAudioRef}
        src={TRACKS[trackIndex]} 
        onEnded={handleNextTrack}
        style={{ display: 'none' }} 
      />

      {/* ── R3F scene layer — fades when book opens ── */}
      <div className={`s8-scene-layer ${phase !== 'table' ? 's8-faded' : ''}`}>
        <DiaryScene 
          active={phase === 'table'} 
          onOpen={() => setPhase('reading')}
          audioControls={{
            isPlaying,
            onTogglePlay: handleTogglePlay,
            onNextTrack: handleNextTrack,
            onPrevTrack: handlePrevTrack,
            onVolumeUp: handleVolumeUp,
            onVolumeDown: handleVolumeDown
          }}
        />
      </div>

      {/* ── Book reading phase ── */}
      {phase === 'reading' && (
        <DiaryBook quotes={QUOTES} onComplete={() => setPhase('favourite')} />
      )}

      {/* ── Favourite quote selection ── */}
      {phase === 'favourite' && (
        <div className="s8-fav-overlay">
          <div className="s8-fav-inner">
            <div className="s8-fav-header">
              <div className="s8-fav-icon">📖</div>
              <h2>Which quote touched your heart?</h2>
              <p>Tap the one that spoke to you most</p>
            </div>

            <div className="s8-fav-grid">
              {QUOTES.map((q, i) => (
                <div
                  key={i}
                  className={`s8-fav-card ${favourite === i ? 'selected' : ''}`}
                  onClick={() => {
                    trackEvent('Section8', 'favourite_quote', {
                      quoteIndex: i,
                      quoteText: q,
                    });
                    setFavourite(i);
                  }}
                >
                  <span className="s8-fav-num">#{i + 1}</span>
                  <p className="s8-fav-text">"{q}"</p>
                  {favourite === i && <span className="s8-fav-check">💜</span>}
                </div>
              ))}
            </div>

            {favourite !== null && (
              <button className="s8-next-btn" onClick={onNext}>
                Go to next section ✨
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
