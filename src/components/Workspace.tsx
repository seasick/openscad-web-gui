import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import React, { useEffect } from 'react';

import { Parameter } from '../lib/openSCAD/parseParameter';
import parseOpenScadParameters from '../lib/openSCAD/parseParameter';
import Buttons from './Workspace/Buttons';
import CodeEditor from './Workspace/CodeEditor';
import Console from './Workspace/Console';
import Customizer from './Workspace/Customizer';
import FileSystem from './Workspace/FileSystem';
import Fonts from './Workspace/Fonts';
import Libraries from './Workspace/Libraries';
import Preview from './Workspace/Preview';
import Sidebar from './Workspace/Sidebar';
import { useOpenSCADProvider } from './providers/OpenscadWorkerProvider';
import { useWorkspaceProvider } from './providers/WorkspaceProvider';

export type EditorMode =
  | 'editor'
  | 'customizer'
  | 'file'
  | 'libraries'
  | 'fonts';

interface Props {
  initialMode: EditorMode;
}

export default function Workspace({ initialMode }: Props) {
  const { preview, previewFile, isRendering } = useOpenSCADProvider();
  const { code } = useWorkspaceProvider();
  const [mode, setMode] = React.useState<EditorMode>(initialMode || 'editor');
  const [parameters, setParameters] = React.useState<Parameter[]>([]);

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
    if (code?.length && !previewFile && !isRendering) {
      preview(code, newParams);
    }
  }, [code]);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ height: '100%', borderRight: '1px solid #ccc', p: 1 }}>
        <Sidebar mode={mode} onChange={(value) => setMode(value)} />
      </Box>
      <Grid container sx={{ height: '100%', flexGrow: 1 }}>
        <Grid
          item
          xs={4}
          sx={{ borderRight: 1, height: '80%', borderColor: '#ccc', pt: 2 }}
        >
          {mode === 'customizer' && (
            <Customizer
              parameters={parameters}
              onChange={(p) => setParameters(p)}
            />
          )}
          {mode === 'editor' && <CodeEditor />}
          {mode === 'file' && <FileSystem />}
          {mode === 'libraries' && <Libraries />}
          {mode === 'fonts' && <Fonts />}
        </Grid>
        <Grid item xs={8} sx={{ height: '80%', position: 'relative' }}>
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
          <Buttons code={code} parameters={parameters} />
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
          <Console />
        </Grid>
      </Grid>
    </Box>
  );
}
