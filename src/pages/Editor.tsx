import CodeIcon from '@mui/icons-material/Code';
import LoopIcon from '@mui/icons-material/Loop';
import TuneIcon from '@mui/icons-material/Tune';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import CodeEditor from '../components/CodeEditor';
import Customizer from '../components/Customizer';
import { useOpenSCADProvider } from '../components/OpenscadWorkerProvider';
import Preview from '../components/Preview';
import SplitButton from '../components/SplitButton';
import executeOpenSCAD from '../lib/openSCAD/execute';
import parseOpenScadParameters, {
  Parameter,
} from '../lib/openSCAD/parseParameter';

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

export default function Editor() {
  const { preview, previewFile, log } = useOpenSCADProvider();
  const location = useLocation();

  const [code, setCode] = React.useState<string>('cube(15, center=true);');
  const [isExporting, setIsExporting] = React.useState<boolean>(false);
  const [isRendering, setIsRendering] = React.useState<boolean>(false);
  const [mode, setMode] = React.useState<string | null>(
    location.state?.mode || 'editor'
  );
  const [parameters, setParameters] = React.useState<Parameter[]>([]);

  useEffect(() => {
    if (previewFile) {
      setIsRendering(false);
    }
  }, [previewFile]);

  const handleRender = async () => {
    setIsRendering(true);
    try {
      await preview!(code, parameters);
    } catch (err) {
      setIsRendering(false);
    }
  };

  const handleMode = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  // Load file into text editor
  useEffect(() => {
    (async () => {
      const file = location.state?.file;

      if (file) {
        const text = await file.text();
        setCode(text);
      }
    })();
  }, [location]);

  // Whenever the code changes, attempt to parse the parameters
  useEffect(() => {
    const newParams = parseOpenScadParameters(code);
    // Add old values to new params
    if (parameters.length) {
      // REFACTOR: rework to use a map instead of two loops
      newParams.forEach((newParam) => {
        const oldParam = parameters.find(
          (param) => param.name === newParam.name
        );
        if (oldParam) {
          newParam.value = oldParam.value;
        }
      });
    }
    setParameters(newParams);
  }, [code]);

  return (
    <Grid container sx={{ height: '100%' }}>
      <Grid
        item
        xs={5}
        sx={{ borderRight: 1, height: '80%', borderColor: '#ccc' }}
      >
        <Stack sx={{ height: '100%' }}>
          {mode === 'customizer' && (
            <Customizer
              parameters={parameters}
              onChange={(p) => setParameters(p)}
            />
          )}
          {mode === 'editor' && (
            <CodeEditor
              onChange={(s) => setCode(s)}
              code={code}
              disabled={isRendering || isExporting}
            />
          )}
        </Stack>
      </Grid>
      <Grid item xs={7} sx={{ height: '80%', position: 'relative' }}>
        <ToggleButtonGroup
          value={mode}
          orientation="vertical"
          exclusive
          onChange={handleMode}
          aria-label="text alignment"
          sx={{ position: 'absolute', top: 0, left: 0, zIndex: 999 }}
        >
          <ToggleButton value="editor" aria-label="left aligned">
            <CodeIcon />
          </ToggleButton>
          <ToggleButton
            value="customizer"
            aria-label="centered"
            disabled={!parameters || !parameters.length}
          >
            <TuneIcon />
          </ToggleButton>
        </ToggleButtonGroup>
        <Preview />
      </Grid>
      <Grid
        item
        xs={5}
        sx={{
          height: '20%',
          borderRight: 1,
          borderTop: 1,
          borderColor: '#ccc',
        }}
      >
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
            ]}
            startIcon={isExporting && <LoopIcon sx={loopAnimation} />}
            onSelect={async (selectedLabel: string) => {
              setIsExporting(true);
              const fileType = selectedLabel.split(' ')[1].toLowerCase();

              const output = await executeOpenSCAD(
                'export',
                code,
                fileType,
                parameters
              );

              const url = URL.createObjectURL(output.output);
              const link = document.createElement('a');

              link.href = url;
              link.download = output.output.name;
              link.click();
              setIsExporting(false);
            }}
          />
        </Stack>
      </Grid>
      <Grid
        item
        xs={7}
        sx={{
          height: '20%',
          overflow: 'scroll',
          fontSize: '0.8em',
          borderTop: 1,
          borderColor: '#ccc',
        }}
      >
        <pre style={{ padding: 5, margin: 0 }}>{log?.join('\n')}</pre>
      </Grid>
    </Grid>
  );
}
