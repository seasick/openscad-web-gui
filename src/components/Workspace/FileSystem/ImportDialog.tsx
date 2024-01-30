import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import Dropzone from 'react-dropzone';

import FileWithPath from '../../../lib/FileWithPath';

type Props = {
  onClose: () => void;
  onNewFile: (files: FileWithPath[]) => void;
  open: boolean;
};

export default function ImportFromUrlDialog({
  onClose,
  onNewFile,
  open,
}: Props) {
  const [url, setUrl] = React.useState('');
  const [error, setError] = React.useState('');
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;

    setUrl(event.target.value);

    // Check if the url is valid
    if (!newUrl.startsWith('http')) {
      setError('Invalid URL');
      return;
    } else if (error) {
      setError('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleUrlImport();
    }
  };

  const handleUrlImport = async () => {
    if (url && !error) {
      const response = await fetch('__CORSPROXY' + url);
      if (response.ok) {
        const filename = url.substring(url.lastIndexOf('/') + 1); // TODO Strip query string
        onNewFile([new FileWithPath([await response.blob()], filename)]);
      } else {
        enqueueSnackbar('Failed to download file', { variant: 'error' });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload or import additional files</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Dropzone onDropAccepted={onNewFile}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <Box
                {...getRootProps()}
                sx={{
                  p: 1,
                  border: 1,
                  borderStyle: 'dashed',
                  borderColor: '#ccc',
                  backgroundColor: '#eee',
                  cursor: 'pointer',
                }}
              >
                <input {...getInputProps()} />
                <p>
                  You can either drag and drop files here or onto the file tree,
                  or click here to select files to upload. You can also select
                  multiple files at once.
                </p>
              </Box>
            </section>
          )}
        </Dropzone>
        <Divider sx={{ my: 2 }} />
        <TextField
          label="Import from URL"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton onClick={handleUrlImport}>
                  <DownloadIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onKeyDown={handleKeyDown}
          onChange={handleUrlChange}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
    </Dialog>
  );
}
