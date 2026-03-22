import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Scene3Fireworks.css';

/* ══════════════════════════════════════════════════
   CANVAS FIREWORKS HELPERS
   ══════════════════════════════════════════════════ */
class Particle {
  constructor(x, y, color, speed = 1, sizeMultiplier = 1) {
    const angle = Math.random() * Math.PI * 2;
    // Even slower initial blast speed
    const spd   = (Math.random() * 2.5 + 0.8) * speed; 
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;
    this.color = color;
    this.alpha = 1;
    // Extreme hang time decay
    this.decay = 0.003 + Math.random() * 0.005; 
    this.size  = (Math.random() * 2.8 + 0.8) * sizeMultiplier;
  }
  update() {
    this.vx *= 0.95; 
    this.vy *= 0.95;
    // Extremely gentle gravity
    this.vy += 0.015; 
    this.x  += this.vx; this.y  += this.vy;
    this.alpha -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.shadowBlur  = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Rocket {
  constructor(targetX, targetY, color, isHuge = false) {
    this.x  = Math.random() * window.innerWidth;
    this.y  = window.innerHeight + 10;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Even slower rocket ascent
    const spd  = isHuge ? 7 : 4.5 + Math.random() * 1.5; 
    this.vx = (dx / dist) * spd;
    this.vy = (dy / dist) * spd;
    this.tx = targetX; this.ty = targetY;
    this.color = color;
    this.trail = [];
    this.dead  = false;
    this.explodeCb = null;
    this.isHuge = isHuge;
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > (this.isHuge ? 12 : 6)) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    const dx = this.tx - this.x, dy = this.ty - this.y;
    // Check if we passed the target
    if (dx * this.vx + dy * this.vy <= 0) {
      this.dead = true;
      this.explodeCb?.(this.x, this.y);
    }
  }
  draw(ctx) {
    ctx.beginPath();
    if (this.trail.length > 1) {
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      this.trail.forEach(p => ctx.lineTo(p.x, p.y));
    }
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = this.isHuge ? 4 : 2.2;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }
}

// Literally all colors
const PALETTE = [
  '#ff3b30', // Red
  '#ff9500', // Orange
  '#ffcc00', // Yellow
  '#4cd964', // Green
  '#5ac8fa', // Cyan
  '#007aff', // Blue
  '#5856d6', // Purple
  '#ff2d55', // Pink
  '#b39ddb', // Light Violet
  '#e8e0f5', // White Pink
  '#00ffcc', // Aqua
  '#ff00ff'  // Magenta
];

const playFireworkSound = (isHuge) => {
  try {
    const audio = new Audio('/firework.mp3');
    // Set max firework volume around 20%
    audio.volume = isHuge ? 0.2 : 0.05 + Math.random() * 0.15;
    // Vary the pitch slightly; lower pitch for huge explosions
    audio.playbackRate = isHuge ? 0.7 : 0.9 + Math.random() * 0.4;
    audio.play().catch(() => {});
  } catch (e) {}
};

function makeExplosion(x, y, particles, count = 55, speed = 1, sizeMultiplier = 1) {
  playFireworkSound(sizeMultiplier > 1.5);
  
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color, speed, sizeMultiplier));
  }
  // If it's a huge explosion, mix in some gold
  if (sizeMultiplier > 1.5) {
     for (let i = 0; i < count/2; i++) {
       particles.push(new Particle(x, y, '#d4a853', speed * 1.2, sizeMultiplier * 0.8));
     }
  }
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function Scene3Fireworks({ onProceed }) {
  const canvasRef   = useRef(null);
  const particleRef = useRef([]);
  const rocketRef   = useRef([]);

  // Sequence states
  const [showHappy, setShowHappy]       = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [showPoojetha, setShowPoojetha] = useState(false);
  const [fadePoojetha, setFadePoojetha] = useState(false);
  const [showLunar, setShowLunar]       = useState(false);
  
  const [exiting, setExiting]   = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  /* ── Canvas fireworks loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let raf;
    const sz = { w: 0, h: 0 };
    const resize = () => { sz.w = canvas.width = window.innerWidth; sz.h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    // Exported methods for React timeline to trigger specific fireworks
    canvas._launchTargeted = (tx, ty, count, speed, sizeMult, cb) => {
      const r = new Rocket(tx, ty, PALETTE[Math.floor(Math.random() * PALETTE.length)], sizeMult > 1.5);
      r.explodeCb = (x, y) => {
        makeExplosion(x, y, particleRef.current, count, speed, sizeMult);
        cb?.();
      };
      rocketRef.current.push(r);
    };

    let bgCounter = 0;
    const loop = () => {
      // Very soft fade trail so hanging particles glow longer
      ctx.fillStyle = 'rgba(1, 0, 12, 0.15)';
      ctx.fillRect(0, 0, sz.w, sz.h);

      // Background ambient rockets (spread out launches so it's not overwhelming)
      bgCounter++;
      // Intro ends faster now (starts at 4s)
      const isIntro = bgCounter < 60 * 4; 
      // Slower spawn rate since particles live longer now
      const freq = isIntro ? 70 : 130;
      const maxRockets = isIntro ? 12 : 5;

      if (bgCounter % freq === 0 && rocketRef.current.length < maxRockets) {
        const tx = sz.w * (0.1 + Math.random() * 0.8);
        const ty = sz.h * (0.1 + Math.random() * 0.4);
        const r  = new Rocket(tx, ty, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
        r.explodeCb = (x, y) => makeExplosion(x, y, particleRef.current, isIntro ? 80 : 50, isIntro ? 1.5 : 1);
        rocketRef.current.push(r);
      }

      // Update & draw rockets
      for (let i = rocketRef.current.length - 1; i >= 0; i--) {
        rocketRef.current[i].update();
        rocketRef.current[i].draw(ctx);
        if (rocketRef.current[i].dead) rocketRef.current.splice(i, 1);
      }

      // Update & draw particles
      for (let i = particleRef.current.length - 1; i >= 0; i--) {
        particleRef.current[i].update();
        particleRef.current[i].draw(ctx);
        if (particleRef.current[i].alpha <= 0) particleRef.current.splice(i, 1);
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  /* ── Timeline state machine ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const timers = [];
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

    // 1. "Happy" reveal from 4th second
    T(() => setShowHappy(true), 4000);

    // 2. "Birthday" reveal
    T(() => setShowBirthday(true), 6000);

    // 3. "Poojetha" reveal
    T(() => setShowPoojetha(true), 8000);

    // 3.5 Huge Left & Right shots to frame the name
    T(() => {
      canvas?._launchTargeted(window.innerWidth * 0.15, window.innerHeight * 0.3, 180, 2.0, 2.0);
      canvas?._launchTargeted(window.innerWidth * 0.85, window.innerHeight * 0.3, 180, 2.0, 2.0);
    }, 10000);

    // 4. "Poojetha" fades out
    T(() => setFadePoojetha(true), 12000); // 4s to read

    // 5. "Lunar" reveal
    T(() => {
      const tx = window.innerWidth * 0.5;
      const ty = window.innerHeight * 0.7; // Bottom slot
      canvas?._launchTargeted(tx, ty, 80, 1.2, 1, () => {
         setShowLunar(true);
      });
    }, 13000);

    // 5.5 Pre-climax huge side blasts
    T(() => {
      canvas?._launchTargeted(window.innerWidth * 0.3, window.innerHeight * 0.45, 150, 2.2, 2.2);
      canvas?._launchTargeted(window.innerWidth * 0.7, window.innerHeight * 0.45, 150, 2.2, 2.2);
    }, 15000);

    // 6. BIG explosion climax
    T(() => {
      const tx = window.innerWidth * 0.5;
      const ty = window.innerHeight * 0.4; 
      canvas?._launchTargeted(tx, ty, 300, 3.0, 3.0); // huge blast
    }, 17000);

    // 7. Exit
    T(() => {
      setExiting(true);
      setTimeout(() => onProceed?.(), 1400);
    }, 20500);

    // Skip button
    T(() => setShowSkip(true), 8000);

    return () => timers.forEach(clearTimeout);
  }, [onProceed]);

  const handleSkip = useCallback(() => {
    setExiting(true);
    setTimeout(() => onProceed?.(), 1200);
  }, [onProceed]);

  return (
    <div className={`sc3-wrapper ${exiting ? 'sc3-exit' : ''}`}>
      <canvas ref={canvasRef} className="sc3-canvas" />

      <div className="sc3-text-layer">
        <h1 className={`sc3-word-happy ${showHappy ? 'vis' : ''}`}>
          Happy
        </h1>
        <h1 className={`sc3-word-bday ${showBirthday ? 'vis' : ''}`}>
           Birthday
        </h1>
        
        {/* The bottom name slot — overlaps Poojetha and Lunar */}
        <div className="sc3-name-slot">
          <h1 className={`sc3-word-poojetha ${showPoojetha ? 'vis' : ''} ${fadePoojetha ? 'fade-out' : ''}`}>
            Poojetha
          </h1>
          <h1 className={`sc3-word-lunar ${showLunar ? 'vis' : ''}`}>
            Lunar
          </h1>
        </div>
      </div>
    </div>
  );
}
