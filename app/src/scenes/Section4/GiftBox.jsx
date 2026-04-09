import React, { useRef } from 'react';
import { useSpring } from '@react-spring/three';
import { RoundedBox } from '@react-three/drei';

export default function GiftBox({
  boxColor = '#FFE66D',
  ribbonColor = '#FF6B6B',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isActive = false,
  isOpen = false,
  onClick
}) {
  const group = useRef();

  // Animations
  const { springScale } = useSpring({
    springScale: isActive ? 1.0 : 0.8,
    config: { mass: 1, tension: 200, friction: 15 }
  });

  const { lidPosition, lidRotation } = useSpring({
    lidPosition: isOpen ? [0, 1.4, -0.7] : [0, 1.0, 0], // Box height is 1.0. Lid sits exactly on top.
    lidRotation: isOpen ? [-Math.PI / 3, 0, 0] : [0, 0, 0],
    config: { mass: 1, tension: 150, friction: 15 }
  });

  const boxMaterial = {
    color: boxColor,
    roughness: 0.3, // Soft clay look
    metalness: 0.05,
  };

  const ribbonMaterial = {
    color: ribbonColor,
    roughness: 0.4,
    metalness: 0.1, // slightly shimmery ribbon
    emissive: ribbonColor,
    emissiveIntensity: 0.05
  };

  return (
    <a.group
      ref={group}
      position={position}
      rotation={rotation}
      scale={springScale}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* Box Base Container (Height: 0 to 1.0) */}
      <group position={[0, -0.5, 0]}>
        {/* Base Hollow Cube */}
        <RoundedBox args={[1.2, 0.1, 1.2]} radius={0.03} position={[0, 0.05, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...boxMaterial} />
        </RoundedBox>
        <RoundedBox args={[1.2, 0.9, 0.1]} radius={0.03} position={[0, 0.55, 0.55]} castShadow receiveShadow>
          <meshStandardMaterial {...boxMaterial} />
        </RoundedBox>
        <RoundedBox args={[1.2, 0.9, 0.1]} radius={0.03} position={[0, 0.55, -0.55]} castShadow receiveShadow>
          <meshStandardMaterial {...boxMaterial} />
        </RoundedBox>
        <RoundedBox args={[0.1, 0.9, 1.0]} radius={0.03} position={[-0.55, 0.55, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...boxMaterial} />
        </RoundedBox>
        <RoundedBox args={[0.1, 0.9, 1.0]} radius={0.03} position={[0.55, 0.55, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...boxMaterial} />
        </RoundedBox>

        {/* Interior black floor plane for depth */}
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshStandardMaterial color="#2d2d2d" roughness={1} />
        </mesh>

        {/* Vertical Base Ribbons */}
        {/* Front Ribbon */}
        <RoundedBox args={[0.25, 0.95, 0.02]} radius={0.005} position={[0, 0.525, 0.61]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
        {/* Back Ribbon */}
        <RoundedBox args={[0.25, 0.95, 0.02]} radius={0.005} position={[0, 0.525, -0.61]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
        {/* Left Ribbon */}
        <RoundedBox args={[0.02, 0.95, 0.25]} radius={0.005} position={[-0.61, 0.525, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
        {/* Right Ribbon */}
        <RoundedBox args={[0.02, 0.95, 0.25]} radius={0.005} position={[0.61, 0.525, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
      </group>

      {/* Lid & Bow Container */}
      {/* Position lidPosition is originally y=1.0 relative to group center. 
          Given our base starts at -0.5 and height is 1.0, the top of the base is y=0.5. 
          The lid position y=0.55 makes it flush. */}
      {/* But wait, lidPosition from spring uses [0, 0.5, 0] when closed. I need to update it here slightly */}
      <a.group position={lidPosition.to((x, y, z) => [x, y - 0.5, z])} rotation={lidRotation}>
        {/* Lid Main Board */}
        <RoundedBox args={[1.3, 0.25, 1.3]} radius={0.05} position={[0, 0.125, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...boxMaterial} />
        </RoundedBox>

        {/* Lid Top Ribbons X and Z */}
        <RoundedBox args={[1.32, 0.03, 0.25]} radius={0.01} position={[0, 0.26, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
        <RoundedBox args={[0.25, 0.03, 1.32]} radius={0.01} position={[0, 0.26, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>

        {/* Lid Drops (Sides of the lid) */}
        <RoundedBox args={[0.25, 0.27, 0.03]} radius={0.01} position={[0, 0.135, 0.66]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
        <RoundedBox args={[0.25, 0.27, 0.03]} radius={0.01} position={[0, 0.135, -0.66]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
        <RoundedBox args={[0.03, 0.27, 0.25]} radius={0.01} position={[-0.66, 0.135, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>
        <RoundedBox args={[0.03, 0.27, 0.25]} radius={0.01} position={[0.66, 0.135, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...ribbonMaterial} />
        </RoundedBox>

        {/* ==== THE 3D BOW ==== */}
        <group position={[0, 0.27, 0]}>
          {/* Center Knot */}
          <RoundedBox args={[0.24, 0.20, 0.24]} radius={0.08} position={[0, 0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial {...ribbonMaterial} />
          </RoundedBox>

          {/* Right Main Loop */}
          <group position={[0.25, 0.18, 0]} rotation={[0, -Math.PI / 8, -Math.PI / 8]}>
            <mesh castShadow receiveShadow scale={[1, 1, 0.4]}>
              <torusGeometry args={[0.2, 0.08, 16, 48]} />
              <meshStandardMaterial {...ribbonMaterial} />
            </mesh>
          </group>

          {/* Left Main Loop */}
          <group position={[-0.25, 0.18, 0]} rotation={[0, Math.PI / 8, Math.PI / 8]}>
            <mesh castShadow receiveShadow scale={[1, 1, 0.4]}>
              <torusGeometry args={[0.2, 0.08, 16, 48]} />
              <meshStandardMaterial {...ribbonMaterial} />
            </mesh>
          </group>

          {/* Right Upper Loop (Extra fluffiness like reference) */}
          <group position={[0.18, 0.22, 0.05]} rotation={[-Math.PI/6, -Math.PI / 4, -Math.PI / 6]}>
            <mesh castShadow receiveShadow scale={[0.8, 0.8, 0.3]}>
              <torusGeometry args={[0.18, 0.06, 16, 32]} />
              <meshStandardMaterial {...ribbonMaterial} />
            </mesh>
          </group>

          {/* Left Upper Loop */}
          <group position={[-0.18, 0.22, 0.05]} rotation={[-Math.PI/6, Math.PI / 4, Math.PI / 6]}>
            <mesh castShadow receiveShadow scale={[0.8, 0.8, 0.3]}>
              <torusGeometry args={[0.18, 0.06, 16, 32]} />
              <meshStandardMaterial {...ribbonMaterial} />
            </mesh>
          </group>
        </group>
      </a.group>
    </a.group>
  );
}
