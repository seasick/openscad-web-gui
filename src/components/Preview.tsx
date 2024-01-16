import React, { useMemo } from 'react';
import { StlViewer } from 'react-stl-viewer';

import { useOpenSCADProvider } from './OpenscadWorkerProvider';

export default function Preview() {
  const { previewFile } = useOpenSCADProvider();
  const url = useMemo(() => {
    if (!previewFile) {
      return null;
    }

    return URL.createObjectURL(previewFile);
  }, [previewFile]);

  if (!url) {
    return null;
  }

  // TODO: Why doesn't this lead to a rerender/flickering? `style` is recreated each time this component renders
  const style = {
    top: 0,
    left: 0,
    width: '100%', // TODO make this responsive
    height: '100%', // TODO make this responsive
  };

  return (
    <div style={{ height: '100%' }}>
      <StlViewer
        style={style}
        orbitControls
        shadows
        showAxes
        modelProps={{
          color: '#B9DDDD',
        }}
        url={url}
      />
    </div>
  );
}
