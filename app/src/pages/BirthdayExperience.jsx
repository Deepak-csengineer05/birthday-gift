import React, { useState, useEffect, useRef } from 'react';
import './BirthdayExperience.css';

import Scene1Twin from '../scenes/Scene1Twin/Scene1Twin';
import Scene2Countdown from '../scenes/Scene2Countdown/Scene2Countdown';
import Scene3Fireworks from '../scenes/Scene3Fireworks/Scene3Fireworks';
import Scene4Envelope from '../scenes/Scene4Envelope/Scene4Envelope';
import SceneVideo from '../scenes/SceneVideo/SceneVideo';
import MainSections from '../scenes/MainSections/MainSections';
import GalleryHub from './GalleryHub';

export default function BirthdayExperience({ isRevisit = false }) {
  // If the user is revisiting the site (already unlocked in previous session), jump to hub
  // If it's a fresh unlock session, start at scene 0
  const [sceneIndex, setSceneIndex] = useState(isRevisit ? 'hub' : 0); 
  const [isHubMode, setIsHubMode] = useState(isRevisit);
  const [mainSectionToLoad, setMainSectionToLoad] = useState(1);
  const audioRef = useRef(null);
  const audio2Ref = useRef(null);

  const next = () => {
    if (isHubMode) {
      setSceneIndex('hub');
    } else {
      setSceneIndex((currentIdx) => {
        // Linear path finishes after scene 4, we enter scene 5 (MainSections) naturally
        // But if we are exiting MainSections (currentIdx === 5), the entire linear journey is over!
        if (currentIdx === 5) {
          setIsHubMode(true);
          return 'hub';
        }
        return typeof currentIdx === 'number' ? currentIdx + 1 : 'hub';
      });
    }
  };

  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
    }
  };

  const startBgMusic2 = () => {
    if (audio2Ref.current) {
      audio2Ref.current.volume = 0.6;
      audio2Ref.current.play().catch(e => console.log('Audio 2 play error:', e));
    }
  };

  const stopBgMusic2 = () => {
    if (audio2Ref.current && audio2Ref.current.volume > 0) {
      const audio = audio2Ref.current;
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
        }
      }, 150);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;

    if (sceneIndex >= 4 || sceneIndex === 'hub') {
      const audio = audioRef.current;
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
        }
      }, 150); // fades out slowly over ~3 seconds

      return () => clearInterval(fadeInterval);
    }
  }, [sceneIndex]);

  // Stop bg-music-2 whenever the user leaves Section1 and goes back to hub
  useEffect(() => {
    if (sceneIndex === 'hub') {
      stopBgMusic2();
    }
  }, [sceneIndex]);

  return (
    <div className="experience-wrapper">
      <audio ref={audioRef} src="/bg-music.mp3" loop />
      <audio ref={audio2Ref} src="/bg-music-2.mp3" loop />

      {sceneIndex === 0 && <Scene1Twin onProceed={next} onAudioStart={startAudio} />}
      {sceneIndex === 1 && <Scene2Countdown onProceed={next} />}
      {sceneIndex === 2 && <Scene3Fireworks onProceed={next} />}
      {sceneIndex === 3 && <SceneVideo onProceed={next} />}
      {sceneIndex === 4 && <Scene4Envelope onProceed={next} />}
      {sceneIndex === 5 && (
        <MainSections 
          onProceed={next} 
          onVideoStart={startBgMusic2} 
          onSection5Start={stopBgMusic2} 
          initialSection={mainSectionToLoad}
          isHubMode={isHubMode}
        />
      )}
      {sceneIndex === 'hub' && (
        <GalleryHub 
          onSelectScene={(idx) => {
            setIsHubMode(true);
            setSceneIndex(idx);
          }}
          onSelectSection={(sectionNum) => {
            setIsHubMode(true);
            setMainSectionToLoad(sectionNum);
            setSceneIndex(5);
          }}
        />
      )}

      {/* Floating Back to Hub Button (Only visible in Hub Mode when visiting a memory constraint) */}
      {isHubMode && sceneIndex !== 'hub' && (
        <button 
          className="back-to-hub-btn"
          onClick={() => setSceneIndex('hub')}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            letterSpacing: '1px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>←</span> Back to Hub
        </button>
      )}
    </div>
  );
}
