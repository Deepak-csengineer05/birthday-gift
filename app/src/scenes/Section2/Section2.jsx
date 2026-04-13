import React, { useState, useEffect, useRef } from 'react';
import './Section2.css';
import { trackEvent } from '../../analytics';

// Sample photos to display. We stagger their anchor points and initial sway timings perfectly.
const PHOTOS = [
  { id: 1, src: 'pic1.jpeg', caption: 'Smile ✨', anchorX: 10, stringLength: 120, rotSpeed: 3.5 },
  { id: 6, src: 'pic2.jpeg', caption: 'Pooji 🌙', anchorX: 20, stringLength: 320, rotSpeed: 5.1, isCurly: true },
  { id: 2, src: 'pic3.jpeg', caption: 'violet Saree 💜', anchorX: 35, stringLength: 180, rotSpeed: 4.2 },
  { id: 7, src: 'pic4.jpeg', caption: '3d model art 🖌️', anchorX: 47, stringLength: 400, rotSpeed: 6.2, isCurly: true },
  { id: 3, src: 'pic5.jpeg', caption: 'Your Favourite 😊', anchorX: 58, stringLength: 140, rotSpeed: 3.8 },
  { id: 4, src: 'pic6.jpeg', caption: 'shining 💫', anchorX: 72, stringLength: 200, rotSpeed: 4.5 },
  { id: 8, src: 'pic7.jpeg', caption: 'My First Ghibli 🖼️', anchorX: 82, stringLength: 340, rotSpeed: 5.4, isCurly: true },
  { id: 5, src: 'pic8.jpeg', caption: 'Bangle 💜', anchorX: 92, stringLength: 160, rotSpeed: 3.9 }
];

export default function Section2({ onNext }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const wrapperRef = useRef(null);

  // When a photo is clicked, it becomes active and the string "snaps".
  // Clicking the backdrop closes it and allows clicking others.
  const handlePhotoClick = (id) => {
    if (activePhoto === id) return;
    trackEvent('Section2', 'photo_click', {
      photoId: id,
      caption: PHOTOS.find(p => p.id === id)?.caption,
    });
    setActivePhoto(id);
  };

  const closeActive = () => {
    setActivePhoto(null);
  };

  // Keyboard Navigation: Left/Right to switch photos, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activePhoto) return;
      
      const currentIndex = PHOTOS.findIndex(p => p.id === activePhoto);
      
      if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % PHOTOS.length;
        setActivePhoto(PHOTOS[nextIndex].id);
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + PHOTOS.length) % PHOTOS.length;
        setActivePhoto(PHOTOS[prevIndex].id);
      } else if (e.key === 'Escape') {
        closeActive();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto]);

  // Optional: check if all have been viewed to show "next" button, or just show it after a delay
  const [showNext, setShowNext] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowNext(true), 15000); // show next after 15s to guarantee they explore
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="s2-wrapper" ref={wrapperRef}>
      {/* Dynamic Magical Night Sky Background */}
      <div className="s2-sky">
        <div className="s2-glow-orb orb1"></div>
        <div className="s2-glow-orb orb2"></div>
      </div>

      {/* Top Anchor Branch/Beam */}
      <div className="s2-top-anchor">
        <div className="s2-glowing-line"></div>
      </div>

      {/* The Gallery Container */}
      <div className="s2-gallery-container">
        {PHOTOS.map((photo) => {
          const isActive = activePhoto === photo.id;
          const isBlurred = activePhoto !== null && !isActive;

          return (
            <div
              key={photo.id}
              className={`s2-photo-system ${isActive ? 'is-active' : ''} ${isBlurred ? 'is-blurred' : ''}`}
              style={{
                left: `${photo.anchorX}%`,
                animationDelay: `-${photo.rotSpeed * 0.7}s`,
                '--sway-dur': `${photo.rotSpeed}s`,
                '--string-len': `${photo.stringLength}px`
              }}
            >
              {/* The SVG String */}
              <svg className={`s2-string ${isActive ? 'string-snapped' : ''}`} viewBox={`0 0 100 ${photo.stringLength}`} preserveAspectRatio="none">
                <path
                  d={photo.isCurly 
                    ? `M 50 0 C -10 ${photo.stringLength * 0.3}, 110 ${photo.stringLength * 0.7}, 50 ${photo.stringLength}`
                    : `M 50 0 C 50 ${photo.stringLength / 3}, 50 ${photo.stringLength * 2 / 3}, 50 ${photo.stringLength}`}
                  stroke="rgba(216, 180, 254, 0.4)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>

              {/* The Polaroid Card */}
              <div
                className="s2-polaroid"
                onClick={() => handlePhotoClick(photo.id)}
                style={{ top: `${photo.stringLength}px` }}
              >
                <div className="s2-pin"></div>

                <div className="s2-photo-img-box">
                  {/* Providing a visual fallback color in case image hasn't loaded or user hasn't added images yet */}
                  <img src={photo.src} alt={photo.caption} className="s2-img" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#4c1d95'; }} />
                </div>

                <p className="s2-caption">{photo.caption}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backdrop overlay for focus mode */}
      <div className={`s2-backdrop ${activePhoto ? 'active' : ''}`} onClick={closeActive}></div>

      {/* Next Button */}
      <div className={`s2-next-btn-container ${showNext && !activePhoto ? 'show' : ''}`}>
        <button className="s2-next-btn" onClick={onNext}>Continue ✨</button>
      </div>

    </div>
  );
}
