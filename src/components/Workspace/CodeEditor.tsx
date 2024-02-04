import { Alert, AlertTitle, SelectChangeEvent } from '@mui/material';
import React from 'react';

import { useFileSystemProvider } from '../providers/FileSystemProvider';
import { useWorkspaceProvider } from '../providers/WorkspaceProvider';
import FileSelector from './FileSystem/FileSelector';

interface CodeEditorProps {
  disabled?: boolean;
}

export default function CodeEditor({ disabled }: CodeEditorProps) {
  const { code, setCode, selectedFile, setSelectedFile } =
    useWorkspaceProvider();
  const { files } = useFileSystemProvider();

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  // Load the selected file.
  const handleFileSelect = (event: SelectChangeEvent<string>) => {
    const file = files.find((f) => f.path === event.target.value);

    if (file) {
      (async () => {
        setCode(await file.text());
        setSelectedFile(file.path);
      })();
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexFlow: 'column' }}>
      <Alert severity="info" sx={{ mb: 1 }}>
        <AlertTitle>Code Editor</AlertTitle>
        Edit the code to your liking.
      </Alert>
      <FileSelector onChange={handleFileSelect} selectedFile={selectedFile} />
      <textarea
        readOnly={disabled}
        value={code}
        onChange={handleCodeChange}
        style={{
          width: '100%',
          flexGrow: 1,
          resize: 'none',
          padding: 12,
          backgroundColor: disabled ? '#ccc' : '#fff',
        }}
      />
    </div>
  );
}
