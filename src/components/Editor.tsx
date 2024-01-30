import LoopIcon from '@mui/icons-material/Loop';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import React, { useEffect } from 'react';

import executeOpenSCAD from '../lib/openSCAD/execute';
import parseOpenScadParameters, {
  Parameter,
} from '../lib/openSCAD/parseParameter';
import { WorkerMessageType } from '../worker/types';
import { useOpenSCADProvider } from './OpenscadWorkerProvider';
import SplitButton from './SplitButton';
import CodeEditor from './Workspace/CodeEditor';
import Customizer from './Workspace/Customizer';
import FileSystem from './Workspace/FileSystem';
import Libraries from './Workspace/Libraries';
import Preview from './Workspace/Preview';
import Sidebar from './Workspace/Sidebar';

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

type EditorMode = 'editor' | 'customizer' | 'file' | 'libraries';

type Props = {
  url?: string;
  initialMode?: EditorMode;
};

export default function Editor({ url, initialMode }: Props) {
  const { log, preview, previewFile } = useOpenSCADProvider();

  const logRef = React.useRef<HTMLPreElement>(null);
  const [code, setCode] = React.useState<string>();
  const [isExporting, setIsExporting] = React.useState<boolean>(false);
  const [isRendering, setIsRendering] = React.useState<boolean>(false);
  const [mode, setMode] = React.useState<EditorMode | null>(
    initialMode || 'editor'
  );
  const [parameters, setParameters] = React.useState<Parameter[]>([]);

  useEffect(() => {
    if (url) {
      (async () => {
        const codeResponse = await fetch(url);
        const codeBody = await codeResponse.text();
        setCode(codeBody);
      })();
    }
  }, [url]);

  useEffect(() => {
    if (previewFile) {
      setIsRendering(false);
    }
  }, [previewFile]);

  const handleRender = async () => {
    setIsRendering(true);
    try {
      await preview!(code, parameters);
    } finally {
      setIsRendering(false);
    }
  };

  const handleMode = (newMode: EditorMode) => {
    setMode(newMode);
  };

  // Whenever the code changes, attempt to parse the parameters
  useEffect(() => {
    if (!code) {
      return;
    }

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

    if (mode === 'customizer' && (!newParams || !newParams.length)) {
      setMode('editor');
    }

    // Render the preview if we have code and we don't have a previewFile yet
    if (code && !previewFile && !isRendering) {
      handleRender();
    }
  }, [code]);

  // Scroll to bottom of log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log]);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ height: '100%', borderRight: '1px solid #ccc', p: 1 }}>
        <Sidebar mode={mode} onChange={handleMode} />
      </Box>
      <Grid container sx={{ height: '100%', flexGrow: 1 }}>
        <Grid
          item
          xs={4}
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
              <CodeEditor onChange={(s) => setCode(s)} code={code} />
            )}
            {mode === 'file' && <FileSystem />}
            {mode === 'libraries' && <Libraries />}
          </Stack>
        </Grid>
        <Grid item xs={8} sx={{ height: '80%', position: 'relative' }}>
          {isRendering && (
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
          )}
          <Preview />
        </Grid>
        <Grid
          item
          xs={4}
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
                'Export DXF',
                'Export SVG',
              ]}
              startIcon={isExporting && <LoopIcon sx={loopAnimation} />}
              onSelect={async (selectedLabel: string) => {
                setIsExporting(true);
                const fileType = selectedLabel.split(' ')[1].toLowerCase();

                const output = await executeOpenSCAD(
                  WorkerMessageType.EXPORT,
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
          xs={8}
          sx={{
            height: '20%',
            overflow: 'scroll',
            fontSize: '0.8em',
            borderTop: 1,
            borderColor: '#ccc',
          }}
        >
          <pre style={{ padding: 5, margin: 0 }}>
            {log?.join('\n')}
            <span ref={logRef} />
          </pre>
        </Grid>
      </Grid>
    </Box>
  );
}
