import { CircularProgress, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import * as THREE from 'three';

import { useOpenSCADProvider } from '../providers/OpenscadWorkerProvider';
import ThreeJsCanvas from './Preview/ThreeJsCanvas';
import readFromSTLFile from './Preview/readFromSTLFile';
import readFromSVGFile from './Preview/readFromSVGFile';

export default function Preview() {
  const { previewFile, isRendering } = useOpenSCADProvider();
  const [geometry, setGeometry] = React.useState<THREE.Group | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!previewFile) {
      return;
    }

    (async () => {
      let newGeometry;

      if (previewFile.name.endsWith('.stl')) {
        newGeometry = await readFromSTLFile(
          previewFile,
          theme.palette.primary.main
        );
      } else if (previewFile.name.endsWith('.svg')) {
        newGeometry = await readFromSVGFile(
          previewFile,
          theme.palette.primary.main,
          theme.palette.secondary.main
        );
      } else {
        throw new Error('Unsupported file type');
      }
      setGeometry(newGeometry);
    })();
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
