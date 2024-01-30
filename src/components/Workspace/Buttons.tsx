import LoopIcon from '@mui/icons-material/Loop';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useEffect } from 'react';

import { Parameter } from '../../lib/openSCAD/parseParameter';
import { useOpenSCADProvider } from '../OpenscadWorkerProvider';
import SplitButton from '../SplitButton';

const loopAnimation = {
  animation: 'spin 2s linear infinite',
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(360deg)',
    },
    '100%': {
      transform: 'rotate(0deg)',
    },
  },
};

type Props = {
  code: string;
  parameters: Parameter[];
};

export default function Buttons({ code, parameters }: Props) {
  const {
    exportFile,
    execExport,
    isExporting,
    isRendering,
    previewFile,
    preview,
  } = useOpenSCADProvider();

  const handleRender = async () => {
    preview(code, parameters);
  };

  useEffect(() => {
    if (exportFile) {
      const url = URL.createObjectURL(exportFile);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', exportFile.name);
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
    }
  }, [exportFile]);

  return (
    <Stack direction="row" spacing={2} sx={{ m: 1 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleRender}
        startIcon={isRendering && <LoopIcon sx={loopAnimation} />}
      >
        Render
      </Button>
      <SplitButton
        disabled={isRendering || isExporting || !previewFile}
        options={[
          'Export STL',
          'Export OFF',
          'Export AMF',
          // 'Export 3MF', // TODO: 3MF export was not enabled when building the OpenSCAD wasm module
          'Export CSG',
          'Export DXF',
          'Export SVG',
        ]}
        startIcon={isExporting && <LoopIcon sx={loopAnimation} />}
        onSelect={async (selectedLabel: string) => {
          const fileType = selectedLabel.split(' ')[1].toLowerCase();

          execExport(code, fileType, parameters);
        }}
      />
    </Stack>
  );
}
