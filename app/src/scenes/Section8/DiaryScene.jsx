import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';

/* ── Upright book on shelf ── */
function Book({ position, rotation = [0, 0, 0], color, w = 0.22, h = 1.4, d = 1.9 }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Pages block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.0} />
      </mesh>
      {/* Spine */}
      <mesh position={[w / 2 + 0.005, 0, 0]}>
        <boxGeometry args={[0.01, h + 0.01, d + 0.01]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* Page edge (slightly lighter) */}
      <mesh position={[-(w / 2) - 0.005, 0, 0]}>
        <boxGeometry args={[0.01, h - 0.04, d - 0.04]} />
        <meshStandardMaterial color="#e8dfc8" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ── Flickering candle ── */
function Candle({ position }) {
  const flameRef  = useRef();
  const lightRef  = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flameRef.current) {
      flameRef.current.scale.set(
        1 + Math.sin(t * 9.3)  * 0.07,
        1 + Math.sin(t * 13.7) * 0.10,
        1
      );
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 + Math.sin(t * 7.1) * 0.3 + Math.sin(t * 11.3) * 0.2;
    }
  });
  return (
    <group position={position}>
      {/* Wax */}
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.095, 0.85, 20]} />
        <meshStandardMaterial color="#fffde4" roughness={0.95} />
      </mesh>
      {/* Wick */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.94, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshBasicMaterial color="#ffcc22" />
      </mesh>
      {/* Flame tip */}
      <mesh position={[0, 1.01, 0]}>
        <coneGeometry args={[0.025, 0.09, 8]} />
        <meshBasicMaterial color="#ff8800" />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.1, 0]} color="#ff9900" intensity={1.8} distance={7} decay={2} />
    </group>
  );
}

/* ── Moonlit window on back wall ── */
function StudyWindow() {
  return (
    <group position={[0, 3.5, -5.8]}>
      {/* Window frame outer */}
      <mesh>
        <boxGeometry args={[3.8, 3.0, 0.12]} />
        <meshStandardMaterial color="#1a0e05" roughness={0.9} />
      </mesh>
      {/* Window glass pane — bright moonlight */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[3.4, 2.6]} />
        <meshBasicMaterial color="#c8e8ff" transparent opacity={0.18} />
      </mesh>
      {/* Moon glow behind window */}
      <mesh position={[0.5, 0.4, -0.5]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#fffde0" />
      </mesh>
      <pointLight position={[0, 0, 0.5]} color="#c0d8ff" intensity={6} distance={14} />
    </group>
  );
}

/* ── The Violet Diary ── */
function Diary({ onOpen }) {
  const [clicked, setClicked] = useState(false);
  const glowRef = useRef();

  const [spring, api] = useSpring(() => ({
    pos:   [0.3, 0.17, 0.3],
    rot:   [-0.1, 0.08, 0.0],
    scale: [1, 1, 1],
    config: { mass: 1.6, tension: 68, friction: 24 },
  }));

  useFrame(({ clock }) => {
    if (glowRef.current && !clicked) {
      glowRef.current.intensity = 0.55 + Math.sin(clock.getElapsedTime() * 2.0) * 0.22;
    }
  });

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    document.body.style.cursor = 'auto';
    api.start({ pos: [0, 4.5, 3.8], rot: [0, 0, 0], scale: [2.3, 2.3, 2.3] });
    setTimeout(() => onOpen(), 950);
  };

  return (
    <a.group
      position={spring.pos}
      rotation={spring.rot}
      scale={spring.scale}
      onClick={handleClick}
      onPointerOver={() => { if (!clicked) document.body.style.cursor = 'pointer'; }}
      onPointerOut={()  => { document.body.style.cursor = 'auto'; }}
    >
      {/* Back cover */}
      <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[2.1, 0.06, 2.9]} />
        <meshStandardMaterial color="#3a0060" roughness={0.65} metalness={0.08} />
      </mesh>

      {/* Pages block */}
      <mesh castShadow receiveShadow position={[0, 0.12, -0.02]}>
        <boxGeometry args={[1.98, 0.20, 2.74]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.92} metalness={0} />
      </mesh>

      {/* Front cover */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[2.1, 0.06, 2.9]} />
        <meshStandardMaterial color="#5a0096" roughness={0.52} metalness={0.14} />
      </mesh>

      {/* Gold outer border */}
      <mesh position={[0.04, 0.285, 0]}>
        <boxGeometry args={[1.90, 0.012, 2.70]} />
        <meshStandardMaterial color="#c9a000" roughness={0.25} metalness={0.95} emissive="#c9a000" emissiveIntensity={0.25} />
      </mesh>

      {/* Gold inner border */}
      <mesh position={[0.04, 0.298, 0]}>
        <boxGeometry args={[1.74, 0.010, 2.54]} />
        <meshStandardMaterial color="#7b00d0" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Spine */}
      <mesh castShadow position={[-1.0, 0.12, 0]}>
        <boxGeometry args={[0.10, 0.35, 2.9]} />
        <meshStandardMaterial color="#2d0050" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Spine gold lines */}
      {[-1.0, 0.8, -0.8].map((z, i) => (
        <mesh key={i} position={[-1.01, 0.29, z]}>
          <boxGeometry args={[0.12, 0.012, 0.012]} />
          <meshStandardMaterial color="#c9a000" roughness={0.2} metalness={0.95} emissive="#c9a000" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Title text */}
      <Text
        position={[0.1, 0.31, -0.08]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.20}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor="#5a3000"
      >
        Quotes for Lunar
      </Text>

      {/* Star ornament */}
      <Text position={[0.1, 0.31, 0.52]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color="#ffd700" anchorX="center" anchorY="middle">✦</Text>
      <Text position={[0.1, 0.31, -0.72]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.26} color="#ffd700" anchorX="center" anchorY="middle">❧</Text>

      {/* Ribbon bookmark */}
      <mesh position={[0.5, 0.0, 1.52]} castShadow>
        <boxGeometry args={[0.11, 0.34, 0.6]} />
        <meshStandardMaterial color="#ff5fa0" roughness={0.85} />
      </mesh>

      {/* Pulsing violet glow */}
      <pointLight ref={glowRef} color="#9933ff" intensity={0.55} distance={4.5} position={[0, 1.0, 0]} />
    </a.group>
  );
}

/* ── Vintage Tape Recorder ── */
function TapeButton({ pos, color, onClick, label, isPlayingButton }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group 
      position={pos} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh>
        <boxGeometry args={[0.22, 0.08, 0.35]} />
        <meshStandardMaterial color={hovered ? "#ffffff" : color} roughness={0.4} metalness={0.6} />
      </mesh>
      <Text 
        position={[0, 0.045, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.08} 
        color={isPlayingButton ? "#fff" : "#fff"} 
        anchorX="center" 
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function VintageTapeRecorder({ position, rotation, controls }) {
  const { isPlaying, onTogglePlay, onNextTrack, onPrevTrack, onVolumeUp, onVolumeDown } = controls;
  const leftReel = useRef();
  const rightReel = useRef();

  useFrame(({ clock }) => {
    if (isPlaying) {
      if (leftReel.current) leftReel.current.rotation.y -= 0.02;
      if (rightReel.current) rightReel.current.rotation.y -= 0.02;
    }
  });

  return (
    <group position={position} rotation={rotation} castShadow>
      {/* Wooden / Dark Outer Casing */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.0, 0.8]} />
        <meshStandardMaterial color="#1a110a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Silver Front Face panel */}
      <mesh position={[0, 0.5, 0.405]}>
        <boxGeometry args={[2.0, 0.8, 0.02]} />
        <meshStandardMaterial color="#b0b5ba" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Cassette Deck Window (Transparent) */}
      <mesh position={[0.4, 0.5, 0.415]}>
        <boxGeometry args={[0.9, 0.5, 0.02]} />
        <meshStandardMaterial color="#112233" transparent opacity={0.6} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Tape Reels Inside */}
      <group position={[0.4, 0.5, 0.38]}>
        {/* Left Reel */}
        <mesh ref={leftReel} position={[-0.22, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
          {/* Spoke details */}
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.02]} />
            <meshBasicMaterial color="#222" />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.02]} />
            <meshBasicMaterial color="#222" />
          </mesh>
        </mesh>
        {/* Right Reel */}
        <mesh ref={rightReel} position={[0.22, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
          {/* Spoke details */}
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.02]} />
            <meshBasicMaterial color="#222" />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.3, 0.01, 0.02]} />
            <meshBasicMaterial color="#222" />
          </mesh>
        </mesh>
      </group>

      {/* Left Side Speaker Grill */}
      <mesh position={[-0.5, 0.5, 0.41]}>
        <planeGeometry args={[0.6, 0.6]} />
        {/* Simulating speaker grill with a wireframe or dark texture */}
        <meshStandardMaterial color="#050505" roughness={0.9} wireframe={true} />
      </mesh>
      {/* Left Speaker back plate */}
      <mesh position={[-0.5, 0.5, 0.40]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Tactile Control Buttons on Top */}
      <group position={[-0.2, 1.04, 0.1]}>
        <TapeButton pos={[-0.6, 0, 0]} color="#444" onClick={onPrevTrack} label="⏮" />
        <TapeButton 
          pos={[-0.3, 0, 0]} 
          color={isPlaying ? "#cc3333" : "#22aa44"} 
          onClick={onTogglePlay} 
          label={isPlaying ? "⏸" : "▶"} 
          isPlayingButton 
        />
        <TapeButton pos={[ 0.0, 0, 0]} color="#444" onClick={onNextTrack} label="⏭" />
        {/* Volume controls */}
        <TapeButton pos={[ 0.45, 0, -0.2]} color="#335577" onClick={onVolumeUp} label="Vol +" />
        <TapeButton pos={[ 0.72, 0, -0.2]} color="#335577" onClick={onVolumeDown} label="Vol -" />
      </group>
      
      {/* Decorative label */}
      <Text position={[0.4, 0.22, 0.42]} fontSize={0.06} color="#111" anchorX="center" anchorY="bottom">
        MIX TAPE - VOL. 1
      </Text>
    </group>
  );
}

/* ════════════════════════
   Main exported Scene
════════════════════════ */
export default function DiaryScene({ onOpen, active, audioControls }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas camera={{ position: [2, 3.8, 10.5], fov: 46 }} shadows gl={{ antialias: true }}>
        <color attach="background" args={['#0d0704']} />
        <fog attach="fog" args={['#120906', 18, 35]} />
        <Environment preset="apartment" background={false} />

        {/* ── Lighting ── */}
        <ambientLight intensity={0.22} color="#ffd8a0" />

        {/* Moonlight from window — cool blue */}
        <directionalLight position={[0, 6, -6]} intensity={1.4} color="#b8d8ff" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10} shadow-camera-right={10}
          shadow-camera-top={8}   shadow-camera-bottom={-4}
        />

        {/* Warm desk-lamp glow from upper right */}
        <pointLight position={[5, 7, 3]} color="#ffbb44" intensity={8} distance={16} decay={2} />
        {/* Left side fill */}
        <pointLight position={[-6, 5, 1]} color="#442288" intensity={4} distance={14} decay={2} />

        {/* ── Back wall (wood panel) ── */}
        <mesh position={[0, 2, -6]} receiveShadow>
          <boxGeometry args={[22, 8, 0.18]} />
          <meshStandardMaterial color="#1c0c04" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Wall baseboards */}
        <mesh position={[0, -0.8, -5.9]}>
          <boxGeometry args={[22, 0.4, 0.06]} />
          <meshStandardMaterial color="#2a1208" roughness={0.8} />
        </mesh>

        {/* ── Moonlit window ── */}
        <StudyWindow />

        {/* ── Mahogany Desk ── */}
        <mesh position={[0, -0.18, 0]} receiveShadow castShadow>
          <boxGeometry args={[14, 0.28, 7]} />
          <meshStandardMaterial color="#2c1304" roughness={0.78} metalness={0.06} />
        </mesh>
        {/* Polished top surface */}
        <mesh position={[0, -0.02, 0]} receiveShadow>
          <boxGeometry args={[14, 0.025, 7]} />
          <meshStandardMaterial color="#3e1905" roughness={0.22} metalness={0.28} />
        </mesh>
        {/* Desk legs */}
        {[[-6, -1.8, -3], [6, -1.8, -3], [-6, -1.8, 3], [6, -1.8, 3]].map(([x,y,z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <boxGeometry args={[0.25, 3.2, 0.25]} />
            <meshStandardMaterial color="#251003" roughness={0.85} />
          </mesh>
        ))}

        {/* ── Books standing upright on LEFT ── */}
        <group position={[-4.5, 0.01, -1.8]}>
          <Book position={[0,    0.72, 0]} color="#1a3a6e" h={1.44} w={0.24} d={1.9} />
          <Book position={[0.28, 0.62, 0]} color="#5c1500" h={1.24} w={0.22} d={1.85} />
          <Book position={[0.54, 0.78, 0]} color="#1b4e25" h={1.56} w={0.26} d={1.9}  />
          <Book position={[0.84, 0.58, 0]} color="#4e3a00" h={1.16} w={0.20} d={1.8}  />
          <Book position={[1.08, 0.70, 0]} color="#3a005a" h={1.40} w={0.22} d={1.88} />
        </group>

        {/* Books on RIGHT */}
        <group position={[3.8, 0.01, -1.8]}>
          <Book position={[0,    0.68, 0]} color="#1a4a4a" h={1.36} w={0.20} d={1.85} />
          <Book position={[0.25, 0.75, 0]} color="#5a0058" h={1.50} w={0.24} d={1.9}  />
          <Book position={[0.53, 0.60, 0]} color="#3a3a12" h={1.20} w={0.22} d={1.88} />
        </group>

        {/* Flat book lying on desk (near diary) */}
        <mesh position={[-2.5, 0.05, 0.5]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[1.6, 0.08, 2.2]} />
          <meshStandardMaterial color="#1a2a4a" roughness={0.75} />
        </mesh>

        {/* ── Candles ── */}
        <Candle position={[ 3.8, 0.01, -0.5]} />
        <Candle position={[-3.2, 0.01, -1.0]} />

        {/* ── Small quill pen ── */}
        <mesh position={[2.0, 0.04, 1.2]} rotation={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.004, 1.4, 8]} />
          <meshStandardMaterial color="#e8d8a0" roughness={0.9} />
        </mesh>

        {/* ── The Realistic Vintage Tape Recorder ── */}
        <VintageTapeRecorder 
          position={[4.6, 0.01, 1.2]} 
          rotation={[0, -0.6, 0]} 
          controls={audioControls} 
        />

        <OrbitControls
          target={[0, 1, 0]}
          enablePan={false}
          minDistance={4}
          maxDistance={18}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.1}
        />

        <ContactShadows position={[0, 0.01, 0]} opacity={0.8} blur={2.5} scale={18} />

        {/* ── The Diary ── */}
        <Diary onOpen={onOpen} />
      </Canvas>

      {/* Hint text */}
      {active && (
        <div style={{
          position: 'absolute', bottom: '52px',
          width: '100%', textAlign: 'center', pointerEvents: 'none',
        }}>
          <p style={{
            color: 'rgba(220,180,255,0.9)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            letterSpacing: '2px',
            textShadow: '0 0 16px rgba(150,60,255,0.7)',
            animation: 'pulse 2s ease-in-out infinite alternate',
          }}>
            ✦ Click the diary to open it ✦
          </p>
        </div>
      )}
    </div>
  );
}
