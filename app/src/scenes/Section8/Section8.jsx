import React, { useState } from 'react';
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

export default function Section8({ onNext }) {
  const [phase,     setPhase]     = useState('table');   // 'table' | 'reading' | 'favourite'
  const [favourite, setFavourite] = useState(null);

  return (
    <div className="s8-root">
      {/* Background Audio */}
      <audio src="/bg-music-4.webm" autoPlay loop style={{ display: 'none' }} />

      {/* ── R3F scene layer — fades when book opens ── */}
      <div className={`s8-scene-layer ${phase !== 'table' ? 's8-faded' : ''}`}>
        <DiaryScene active={phase === 'table'} onOpen={() => setPhase('reading')} />
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
