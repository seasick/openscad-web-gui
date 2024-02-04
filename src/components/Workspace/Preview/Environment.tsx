import { Grid } from '@react-three/drei';
import React, { memo } from 'react';

export const Environment = memo(function Environment() {
  /* eslint-disable react/no-unknown-property */
  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        shadow-mapSize={1024}
        castShadow
      />
      <directionalLight position={[-5, 5, 5]} intensity={0.2} />
      <directionalLight position={[-5, 5, -5]} intensity={0.2} />
      <directionalLight position={[0, 5, 0]} intensity={0.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.6} />
      <Grid infiniteGrid={true} sectionColor="#CCCCCC" />
    </>
  );
  /* eslint-enable react/no-unknown-property */
});
