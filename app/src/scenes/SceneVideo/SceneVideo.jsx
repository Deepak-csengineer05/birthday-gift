import React, { useRef, useEffect } from 'react';
import './SceneVideo.css';

export default function SceneVideo({ onProceed }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      onProceed();
      return;
    }
    
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video autoplay blocked by browser:", e));
    }
  }, [onProceed]);

  if (window.innerWidth <= 768) {
    return null;
  }

  return (
    <div className="scene-video-wrapper">
      <video 
        ref={videoRef}
        src="/video.mp4" 
        className="full-screen-video"
        onEnded={onProceed}
        preload="auto"
        playsInline
      />
    </div>
  );
}
