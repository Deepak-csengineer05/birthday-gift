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

/* ── Camera Controller for Focusing ── */
function CameraController({ focusData }) {
  const controls = useRef();
  const isAnimating = useRef(false);
  const currentFocusId = useRef(null);
  
  useFrame((state, delta) => {
    if (focusData?.id !== currentFocusId.current) {
      currentFocusId.current = focusData?.id;
      isAnimating.current = true;
    }

    if (isAnimating.current && controls.current) {
      const targetPos = focusData?.targetPos || new THREE.Vector3(0, 1, 0);
      const camPos = focusData?.camPos || new THREE.Vector3(2, 3.8, 10.5);
      
      state.camera.position.lerp(camPos, delta * 5);
      controls.current.target.lerp(targetPos, delta * 5);
      
      const distCam = state.camera.position.distanceTo(camPos);
      const distTarget = controls.current.target.distanceTo(targetPos);

      if (distCam < 0.05 && distTarget < 0.05) {
        state.camera.position.copy(camPos);
        controls.current.target.copy(targetPos);
        isAnimating.current = false;
      }
      controls.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      target={[0, 1, 0]}
      enablePan={false}
      minDistance={4}
      maxDistance={18}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.1}
    />
  );
}

/* ── Fairytale Vintage Tape Recorder ── */
function TapeButton({ pos, color, onClick, label, isPlayingButton, size = [0.18, 0.06, 0.14] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group 
      position={pos} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh position={[0, hovered ? -0.02 : 0, 0]} castShadow>
        {/* Chunky rectangular retro buttons */}
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={hovered ? "#ffe0e0" : color} 
          roughness={0.3} 
          metalness={0.1}
        />
      </mesh>
      {/* Icon text carved into the button */}
      <Text 
        position={[0, 0.035, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.05} 
        color="#555" 
        anchorX="center" 
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function VintageTapeRecorder({ position, rotation, controls, onClick, onPointerOver, onPointerOut }) {
  const { isPlaying, onTogglePlay, onNextTrack, onPrevTrack, onVolumeUp, onVolumeDown } = controls;
  const leftReel = useRef();
  const rightReel = useRef();

  useFrame(({ clock }) => {
    if (isPlaying) {
      if (leftReel.current) leftReel.current.rotation.z -= 0.03;
      if (rightReel.current) rightReel.current.rotation.z -= 0.03;
    }
  });

  return (
    <group position={position} rotation={rotation} castShadow onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* ── Main Body: Cute Pastel Pink/Peach Retro Plastic ── */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 0.4]} />
        <meshStandardMaterial color="#ffb7b2" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* ── Front Face Plate: Creamy White ── */}
      <mesh position={[0, 0.45, 0.205]} receiveShadow>
        <boxGeometry args={[2.1, 0.8, 0.02]} />
        <meshStandardMaterial color="#fff2e6" roughness={0.4} />
      </mesh>

      {/* ── Left Speaker ── */}
      <group position={[-0.65, 0.45, 0.21]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#ffdac1" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#e2c1c1" roughness={0.5} />
        </mesh>
        {/* Speaker Grill Dots */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`ls-${i}`} position={[Math.cos(i*Math.PI/4)*0.2, Math.sin(i*Math.PI/4)*0.2, 0.015]}>
            <circleGeometry args={[0.02, 8]} />
            <meshBasicMaterial color="#d4a5a5" />
          </mesh>
        ))}
      </group>

      {/* ── Right Speaker ── */}
      <group position={[0.65, 0.45, 0.21]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#ffdac1" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#e2c1c1" roughness={0.5} />
        </mesh>
        {/* Speaker Grill Dots */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`rs-${i}`} position={[Math.cos(i*Math.PI/4)*0.2, Math.sin(i*Math.PI/4)*0.2, 0.015]}>
            <circleGeometry args={[0.02, 8]} />
            <meshBasicMaterial color="#d4a5a5" />
          </mesh>
        ))}
      </group>

      {/* ── Central Cassette Deck Window ── */}
      <group position={[0, 0.45, 0.22]}>
        {/* Inner Dark Area (where the tape sits) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.36, 0.01]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        
        {/* The Cassette Tape Itself */}
        <mesh position={[0, -0.02, 0.005]}>
          <boxGeometry args={[0.5, 0.3, 0.01]} />
          <meshStandardMaterial color="#ffdac1" roughness={0.6} /> {/* Pastel cassette casing */}
        </mesh>
        {/* Tape label block */}
        <mesh position={[0, -0.02, 0.01]}>
          <boxGeometry args={[0.38, 0.15, 0.01]} />
          <meshStandardMaterial color="#fff" />
        </mesh>

        {/* Reels */}
        <mesh ref={leftReel} position={[-0.12, -0.02, 0.02]}>
          <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#fff" />
          <mesh position={[0, 0, 0.006]}>
             <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} rotation={[Math.PI/2, 0, 0]} />
             <meshBasicMaterial color="#e2c1c1" />
          </mesh>
        </mesh>
        <mesh ref={rightReel} position={[0.12, -0.02, 0.02]}>
          <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#fff" />
          <mesh position={[0, 0, 0.006]}>
             <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} rotation={[Math.PI/2, 0, 0]} />
             <meshBasicMaterial color="#e2c1c1" />
          </mesh>
        </mesh>

        {/* Glass Cover */}
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[0.6, 0.36, 0.01]} />
          <meshPhysicalMaterial color="#cde3eb" transmission={0.9} transparent opacity={0.4} roughness={0.1} />
        </mesh>
      </group>

      {/* ── Cute Handle ── */}
      <group position={[0, 0.95, 0]}>
        <mesh position={[-0.8, 0, 0]}>
          <boxGeometry args={[0.06, 0.3, 0.15]} />
          <meshStandardMaterial color="#e2c1c1" roughness={0.4} />
        </mesh>
        <mesh position={[0.8, 0, 0]}>
          <boxGeometry args={[0.06, 0.3, 0.15]} />
          <meshStandardMaterial color="#e2c1c1" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[1.66, 0.06, 0.15]} />
          <meshStandardMaterial color="#e2c1c1" roughness={0.4} />
        </mesh>
      </group>

      {/* ── Top Chunky Controls ── */}
      <group position={[0, 0.93, 0]}>
        {/* Recessed button tray */}
        <mesh position={[0, -0.02, 0.0]}>
          <boxGeometry args={[1.6, 0.02, 0.25]} />
          <meshStandardMaterial color="#f0d1d1" roughness={0.5} />
        </mesh>

        <TapeButton pos={[-0.6, 0.01, 0]} color="#fff" onClick={onPrevTrack} label="⏮" />
        <TapeButton 
          pos={[-0.3, 0.01, 0]} 
          color={isPlaying ? "#ff9a9e" : "#fff"} 
          onClick={onTogglePlay} 
          label={isPlaying ? "⏸" : "▶"} 
        />
        <TapeButton pos={[ 0.0, 0.01, 0]} color="#fff" onClick={onNextTrack} label="⏭" />
        
        {/* Smaller Volume Buttons */}
        <TapeButton pos={[ 0.4, 0.01, 0]} size={[0.16, 0.05, 0.12]} color="#ffdac1" onClick={onVolumeUp} label="Vol +" />
        <TapeButton pos={[ 0.65, 0.01, 0]} size={[0.16, 0.05, 0.12]} color="#ffdac1" onClick={onVolumeDown} label="Vol -" />
      </group>
      
      {/* ── Cute Bottom Label ── */}
      <Text 
         font="/GreatVibes-Regular.ttf"
         position={[0, 0.15, 0.22]} 
         fontSize={0.12} 
         color="#d4a5a5" 
         anchorX="center" 
         anchorY="middle"
      >
        Lunar's Mix
      </Text>
    </group>
  );
}

/* ── The Interactive Diary on Desk ── */
function Diary({ onOpen }) {
  const [hovered, setHovered] = useState(false);
  const scale = hovered ? 1.05 : 1;

  // We animate the scale & hover effect subtly
  const { s } = useSpring({
    s: scale,
    config: { tension: 350, friction: 20 }
  });

  return (
    <a.group 
      position={[0, 0.05, 0.5]} 
      scale={s.to(v => [v, v, v])}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Diary Cover */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.15, 2.4]} />
        <meshStandardMaterial 
          color="#2a0f3d"  // Deep purplish vintage leather
          roughness={0.8} 
        />
      </mesh>

      {/* Pages Edge */}
      <mesh position={[-0.02, 0, 0]}>
        <boxGeometry args={[1.75, 0.13, 2.36]} />
        <meshStandardMaterial color="#f0e6d2" roughness={0.9} />
      </mesh>

      {/* Diary Spine */}
      <mesh position={[0.9, 0, 0]}>
        <boxGeometry args={[0.08, 0.17, 2.44]} />
        <meshStandardMaterial color="#1a0624" roughness={0.7} />
      </mesh>

      {/* Moon Emoji on Cover */}
      <Text 
        position={[0, 0.08, 0.1]} 
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
      >
        🌙
      </Text>
      
      {/* Text on Cover */}
      <Text 
        position={[0, 0.08, -0.4]} 
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="#d4af37"
        font="/GreatVibes-Regular.ttf"
      >
        Quotes for Lunar
      </Text>
    </a.group>
  );
}

/* ════════════════════════
   Main exported Scene
════════════════════════ */
export default function DiaryScene({ onOpen, active, audioControls }) {
  const [focusData, setFocusData] = useState(null);
  const [playerClicks, setPlayerClicks] = useState(0);

  const handlePlayerClick = (e) => {
    e.stopPropagation();
    const newCount = (playerClicks + 1) % 2;
    setPlayerClicks(newCount);
    
    if (newCount === 1) {
      // First tap: Beautiful angled side/front view of the player
      setFocusData({
        id: Date.now(),
        camPos: new THREE.Vector3(4.8, 1.8, 3.5),
        targetPos: new THREE.Vector3(4.6, 0.4, 1.2)
      });
    } else {
      // Second tap: Looking down at the golden reels spinning
      setFocusData({
        id: Date.now(),
        camPos: new THREE.Vector3(4.6, 3.2, 1.3),
        targetPos: new THREE.Vector3(4.6, 0.4, 1.2)
      });
    }
  };

  const handleMissed = () => {
    setPlayerClicks(0);
    setFocusData({ id: Date.now() }); // Resets to default cam
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Unconstrained interactive canvas */}
      <Canvas 
        camera={{ position: [2, 3.8, 10.5], fov: 46 }} 
        shadows 
        gl={{ antialias: true }}
        onPointerMissed={handleMissed}
      >
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
          onClick={handlePlayerClick}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        />

        <CameraController focusData={focusData} />
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
