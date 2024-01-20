import { Box, CircularProgress, Paper, styled } from '@mui/material';
import React from 'react';

import Editor from './components/Editor';
import ErrorBox from './components/ErrorBox';
import ImportFileSelector from './components/ImportFileSelector';
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

  const { error, files, isLoading } = useImport(importUrl);
  const [selectedIndex, setSelectedIndex] = React.useState<number>();
  let file: string | undefined;

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

  // If there are multiple files, let the user select the one to import.
  if (files.length > 1 && selectedIndex === undefined) {
    return (
      <MyBox>
        <Paper sx={{ p: 1 }}>
          <ImportFileSelector files={files} onSelect={setSelectedIndex} />
        </Paper>
      </MyBox>
    );
  }

  // If there is only one file, we can directly import it.
  if (files.length === 1) {
    file = files[0].url;

    // If the user has selected a file, we can import it.
  } else if (selectedIndex !== undefined && files.length > selectedIndex) {
    file = files[selectedIndex].url;
  }

  return <Editor url={file} initialMode={file ? 'customizer' : undefined} />;
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
