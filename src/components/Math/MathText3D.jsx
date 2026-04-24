import React, { useRef } from 'react';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const MathText3D = ({ text, position, isHighlighted, theme }) => {
  const textRef = useRef();

  useFrame(({ camera }) => {
    if (textRef.current) {
      // Make text always face the camera (billboarding)
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
      <Text
        ref={textRef}
        position={[position[0], position[1] + 0.3, position[2]]}
        fontSize={0.4}
        color={isHighlighted ? '#fbbf24' : (theme === 'dark' ? '#22d3ee' : '#0f172a')}
        anchorX="center"
        anchorY="middle"
        outlineWidth={isHighlighted ? 0.02 : 0}
        outlineColor="#000000"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        {text}
      </Text>
    </Float>
  );
};

export default MathText3D;
