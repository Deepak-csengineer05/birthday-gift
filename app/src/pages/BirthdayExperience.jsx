import React, { useState, useEffect, useRef } from 'react';
import './BirthdayExperience.css';

import Scene1Twin from '../scenes/Scene1Twin/Scene1Twin';
import Scene2Countdown from '../scenes/Scene2Countdown/Scene2Countdown';
import Scene3Fireworks from '../scenes/Scene3Fireworks/Scene3Fireworks';

const SCENES = ['scene1', 'scene2', 'scene3', 'scene4', 'main'];

export default function BirthdayExperience() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const audioRef = useRef(null);

  const next = () => setSceneIndex((i) => Math.min(i + 1, SCENES.length - 1));

  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;

    if (sceneIndex >= 3) {
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

  return (
    <div className="experience-wrapper">
      <audio ref={audioRef} src="/bg-music.mp3" loop />
      
      {sceneIndex === 0 && <Scene1Twin onProceed={next} onAudioStart={startAudio} />}
      {sceneIndex === 1 && <Scene2Countdown onProceed={next} />}
      {sceneIndex === 2 && <Scene3Fireworks onProceed={next} />}
      {sceneIndex >= 3 && (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontFamily: 'Inter,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
          Scene 4 — Envelope Reveal coming soon...
        </div>
      )}
    </div>
  );
}
