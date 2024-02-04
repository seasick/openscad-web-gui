import LoopIcon from '@mui/icons-material/Loop';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useEffect, useMemo } from 'react';

import { Parameter } from '../../lib/openSCAD/parseParameter';
import SplitButton from '../SplitButton';
import { useOpenSCADProvider } from '../providers/OpenscadWorkerProvider';

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
  const options = useMemo(() => {
    const isSVG = previewFile && previewFile.name.endsWith('.svg');

    // TODO: 3MF export was not enabled when building the OpenSCAD wasm module
    return [
      { label: 'Export STL', disabled: isSVG },
      { label: 'Export OFF', disabled: isSVG },
      { label: 'Export AMF', disabled: isSVG },
      { label: 'Export CSG', disabled: isSVG },
      { label: 'Export DXF', disabled: !isSVG },
      { label: 'Export SVG', disabled: !isSVG },
    ];
  }, [previewFile]);

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
        options={options}
        startIcon={isExporting && <LoopIcon sx={loopAnimation} />}
        onSelect={async (selectedLabel: string) => {
          const fileType = selectedLabel.split(' ')[1].toLowerCase();

          execExport(code, fileType, parameters);
        }}
      />
    </Stack>
  );
}
