import { CameraControls, GizmoHelper, GizmoViewcube } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';

import { Environment } from './Environment';
import Model from './Model';

type Props = JSX.IntrinsicElements['group'] & {
  geometry: THREE.Group;
};

export default function ThreeJsCanvas({ geometry }: Props) {
  const cameraControlRef = React.useRef<CameraControls | null>(null);

  const tweenCamera = (position: THREE.Vector3) => {
    const point = new THREE.Spherical().setFromVector3(
      new THREE.Vector3(position.x, position.y, position.z)
    );
    cameraControlRef.current!.rotateTo(point.theta, point.phi, true);
    cameraControlRef.current!.fitToSphere(geometry, true);
  };

  return (
    <Canvas
      id="editor-canvas"
      shadows
      camera={{
        fov: 35,
        zoom: 1.3,
        near: 0.1,
        far: 1000,
        position: [6, 6, 6],
      }}
      frameloop="demand"
    >
      <CameraControls ref={cameraControlRef} />
      <Environment />
      <Model geometry={geometry} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewcube
          onClick={(e) => {
            e.stopPropagation();
            if (
              e.eventObject.position.x === 0 &&
              e.eventObject.position.y === 0 &&
              e.eventObject.position.z === 0
            ) {
              tweenCamera(e.face!.normal);
            } else {
              tweenCamera(e.eventObject.position);
            }
            return null;
          }}
        />
      </GizmoHelper>
    </Canvas>
  );
}
