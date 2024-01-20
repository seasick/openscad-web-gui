import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

type Props = {
  onClose: () => void;
};

export default function ImportFromUrlDialog({ onClose }: Props) {
  const [url, setUrl] = useState('');

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  const handleImport = () => {
    window.location.href = '__WEBSITE_URL?' + encodeURIComponent(url);
  };

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Import from URL</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="URL"
          type="url"
          fullWidth
          value={url}
          onChange={handleUrlChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleImport} variant="contained" color="primary">
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
