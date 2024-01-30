import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton } from '@mui/material';
import React, { useEffect } from 'react';

import { useOpenSCADProvider } from '../OpenscadWorkerProvider';

export default function Console() {
  const { log, resetLog } = useOpenSCADProvider();
  const logRef = React.useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        onClick={resetLog}
        sx={{ position: 'static', top: 5, right: 5 }}
      >
        <DeleteIcon />
      </IconButton>
      <pre style={{ padding: 5, margin: 0 }}>
        {log?.join('\n')}
        <span ref={logRef} />
      </pre>
    </Box>
  );
}
