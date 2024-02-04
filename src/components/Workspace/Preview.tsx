import { CircularProgress, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { StlViewer } from 'react-stl-viewer';

import { useOpenSCADProvider } from '../providers/OpenscadWorkerProvider';

const stlViewerStyle = {
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
};

export default function Preview() {
  const { previewFile, isRendering } = useOpenSCADProvider();
  const theme = useTheme();

  const previewUrl = useMemo(() => {
    if (!previewFile) {
      return null;
    }

    return URL.createObjectURL(previewFile);
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

  if (!previewUrl && isRendering) {
    return loading;
  }

  if (!previewUrl) {
    return null;
  }

  return (
    <div style={{ height: '100%' }}>
      {isRendering && loading}
      <StlViewer
        style={stlViewerStyle}
        orbitControls
        shadows
        showAxes
        modelProps={{
          color: theme.palette.primary.main,
        }}
        url={previewUrl}
      />
    </div>
  );
}
