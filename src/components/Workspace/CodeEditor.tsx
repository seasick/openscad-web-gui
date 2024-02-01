import { Alert, AlertTitle, SelectChangeEvent } from '@mui/material';
import React, { useEffect } from 'react';

import { useFileSystemProvider } from '../FileSystemProvider';
import FileSelector from './FileSystem/FileSelector';

interface CodeEditorProps {
  code: string;
  disabled?: boolean;
  onChange: (newCode: string) => void;
}

export default function CodeEditor({
  code,
  disabled,
  onChange,
}: CodeEditorProps) {
  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };
  const { files } = useFileSystemProvider();
  const [selectedFile, setSelectedFile] = React.useState<string>();

  // Load the selected file.
  const handleFileSelect = (event: SelectChangeEvent<string>) => {
    const file = files.find((f) => f.path === event.target.value);

    if (file) {
      (async () => {
        onChange(await file.text());
        setSelectedFile(file.path);
      })();
    }
  };

  // Load the first .scad file in the list (which isn't in the libraries folder),
  // but only if there is no code yet.
  useEffect(() => {
    if (files.length > 0 && !code) {
      (async () => {
        const filtered = files.filter(
          (f) => f.name.endsWith('.scad') && !f.path.startsWith('libraries')
        );

        if (filtered.length) {
          onChange(await filtered[0].text());
          setSelectedFile(filtered[0].path);
        }
      })();
    }
  }, [files, onChange]);

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
