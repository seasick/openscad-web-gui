import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { useEffect } from 'react';

import { useOpenSCADProvider } from '../providers/OpenscadWorkerProvider';

export default function Console() {
  const { log, resetLog } = useOpenSCADProvider();
  const logRef = React.useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log]);

  return (
    <Box sx={{ height: '100%' }} data-testid="console">
      <div style={{ position: 'fixed', right: 5 }}>
        <Tooltip title="Clear console" placement="right">
          <IconButton onClick={resetLog} sx={{ backgroundColor: 'white' }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
      <pre
        style={{
          padding: 5,
          margin: 0,
        }}
      >
        {log?.join('\n')}
        <span ref={logRef} />
      </pre>
    </Box>
  );
}
