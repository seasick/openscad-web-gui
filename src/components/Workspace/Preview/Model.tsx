import { Center } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = JSX.IntrinsicElements['mesh'] & {
  geometry: THREE.Group;
};

export default function Model({ geometry, ...props }: Props) {
  const groupRef = useRef<THREE.Group>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const { invalidate } = useThree();

  useEffect(() => {
    groupRef.current?.clear();

    if (geometry) {
      // For 3MF files and complex models, ensure shadow casting is enabled
      geometry.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      groupRef.current?.add(geometry);
    }

    setLoading(false);
    invalidate();
  }, [geometry, invalidate]);

  return (
    // Center object in the viewport
    <Center cacheKey={loading ? 'loading' : 'not_loading'} disableY>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <mesh castShadow receiveShadow {...props}>
        <group ref={groupRef}></group>
      </mesh>
    </Center>
  );
}
