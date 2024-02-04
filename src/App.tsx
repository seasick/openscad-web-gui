import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import ErrorBox from './components/ErrorBox';
import Workspace from './components/Workspace';
import { useFileSystemProvider } from './components/providers/FileSystemProvider';
import WorkspaceProvider from './components/providers/WorkspaceProvider';
import useImport from './hooks/useImport';

const MyBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  maxWidth: '50vw',
}));

export default function App() {
  const importUrl = getImportUrl();

  const { error, isLoading } = useImport(importUrl, true);
  const { files } = useFileSystemProvider();

  // Show a loading indicator during the import.
  if (isLoading) {
    return (
      <MyBox>
        <CircularProgress sx={{ marginLeft: '50%' }} />
      </MyBox>
    );
  }

  // Show an error message if the import failed.
  if (error) {
    return (
      <MyBox>
        <ErrorBox error={error} />
      </MyBox>
    );
  }

  if (importUrl && files.length === 0) {
    return (
      <MyBox>
        <ErrorBox error={new Error(`No files found at ${importUrl}`)} />
      </MyBox>
    );
  }

  return (
    <WorkspaceProvider>
      <Workspace initialMode={importUrl ? 'customizer' : 'editor'} />
    </WorkspaceProvider>
  );
}

function getImportUrl(): string | undefined {
  let search = window.location.search;

  // Trim the leading question mark
  if (search.startsWith('?')) {
    search = search.substring(1);
  }

  // If the search string is an url, load it through the fetcha.
  if (search.startsWith('http')) {
    return decodeURIComponent(search);
  }
}
