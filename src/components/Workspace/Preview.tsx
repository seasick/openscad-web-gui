import { CircularProgress, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import * as THREE from 'three';

import { useOpenSCADProvider } from '../providers/OpenscadWorkerProvider';
import ThreeJsCanvas from './Preview/ThreeJsCanvas';
import readFromSTLFile from './Preview/readFromSTLFile';

export default function Preview() {
  const { previewFile, isRendering } = useOpenSCADProvider();
  const [geometry, setGeometry] = React.useState<THREE.Mesh | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!previewFile) {
      return;
    }

    // Convert STL file to ThreeJS geometry
    readFromSTLFile(previewFile).then((geometry) => {
      const material = new THREE.MeshLambertMaterial({
        color: theme.palette.primary.main,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(-Math.PI / 2, 0, 0); // z-up conversion

      // Objects are way too big, scale them down.
      mesh.scale.set(0.01, 0.01, 0.01);

      mesh.traverse(function (child) {
        child.castShadow = true;
        child.receiveShadow = true;
      });
      setGeometry(mesh);
    });
  }, [previewFile]);

  const loading = (
    <div
      style={{
        zIndex: 999,
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.5)',
      }}
    >
      <div
        style={{
          top: '50%',
          left: '50%',
          position: 'absolute',
          transform: 'translate(-50%,-50%)',
        }}
      >
        <CircularProgress />
      </div>
    </div>
  );

  if (!previewFile && isRendering) {
    return loading;
  }

  if (!previewFile) {
    return null;
  }

  return (
    <div style={{ height: '100%' }}>
      <ThreeJsCanvas geometry={geometry} />
    </div>
  );
}
