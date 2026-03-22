import React, { useRef, useEffect } from 'react';
import './SceneVideo.css';

export default function SceneVideo({ onProceed }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video autoplay blocked by browser:", e));
    }
  }, []);

  return (
    <div className="scene-video-wrapper">
      <video 
        ref={videoRef}
        src="/video.mp4" 
        className="full-screen-video"
        onEnded={onProceed}
        playsInline
      />
    </div>
  );
}
