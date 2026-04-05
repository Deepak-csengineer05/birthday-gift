import React from 'react';
import { useSpring, a } from '@react-spring/three';
import { Center, Environment, ContactShadows } from '@react-three/drei';
import GiftBox from './GiftBox';

// Define paired colors for each box to match the reference style
const BOX_DATA = [
  { box: '#FFE66D', ribbon: '#FF6B6B' }, // Yellow with Pink ribbon (Reference)
  { box: '#A8E6CF', ribbon: '#FF8B94' }, // Mint with Coral ribbon
  { box: '#FFD3B6', ribbon: '#6EB5FF' }, // Peach with Sky Blue ribbon
  { box: '#E0BBE4', ribbon: '#957DAD' }, // Lavender with Deep Purple ribbon
  { box: '#EA7266', ribbon: '#A8AAA5' }  // Pale Green with Light Coral ribbon
];

export default function Experience({ activeIndex, openedBoxes, onBoxClick }) {
  const numBoxes = 5;
  const radius = 2.8;

  const { carouselRotation } = useSpring({
    carouselRotation: [0, -activeIndex * (Math.PI * 2 / numBoxes), 0],
    config: { mass: 1, tension: 170, friction: 26 }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[2, 6, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      
      <Environment preset="city" />

      <Center position={[0, -0.5, 0]}>
        <a.group rotation={carouselRotation} position={[0, -0.2, 0]}>
          {BOX_DATA.map((data, index) => {
            const theta = index * (Math.PI * 2 / numBoxes);
            const x = Math.sin(theta) * radius;
            const z = Math.cos(theta) * radius;
            
            return (
              <GiftBox
                key={index}
                boxColor={data.box}
                ribbonColor={data.ribbon}
                position={[x, 0, z]}
                rotation={[0, theta, 0]}
                isActive={activeIndex === index}
                isOpen={openedBoxes[index]}
                onClick={() => onBoxClick(index)}
              />
            );
          })}
        </a.group>
      </Center>

      <ContactShadows position={[0, -1.8, 0]} opacity={0.5} scale={15} blur={2.5} far={4} color="#000" />
    </>
  );
}
