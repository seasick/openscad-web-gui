import FileOpenIcon from '@mui/icons-material/FileOpen';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import fetcha, { FetchaFile } from '../../lib/fetcha';

type Props = {
  onClose: () => void;
};

export default function ImportFromUrlDialog({ onClose }: Props) {
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<FetchaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  const downloadAndNavigate = async (file: FetchaFile) => {
    const request = await fetch(file.url);

    const arrayBuffer = await request.arrayBuffer();

    navigate('/editor', {
      state: {
        file: new File([arrayBuffer], file.url),
        mode: 'customizer',
      },
    });

    onClose();
  };

  const handleImport = async () => {
    setIsLoading(true);
    const response = await fetcha(url || '');

    if (response.length === 1) {
      downloadAndNavigate(response[0]);
    } else {
      setOptions(response);
    }

    setIsLoading(false);
  };

  let content;
  if (isLoading) {
    content = <CircularProgress />;
  } else if (options.length > 0) {
    content = (
      <>
        <h4>Please select one of them</h4>
        <List>
          {options.map((r) => (
            <ListItem
              sx={{ cursor: 'pointer' }}
              key={r.url}
              onClick={(e) => {
                downloadAndNavigate(r);
                onClose();
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <FileOpenIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={r.name} />
            </ListItem>
          ))}
        </List>
      </>
    );
  } else {
    content = (
      <TextField
        autoFocus
        margin="dense"
        label="URL"
        type="url"
        fullWidth
        value={url}
        onChange={handleUrlChange}
      />
    );
  }

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {options.length > 1
          ? 'Multiple scad files found at the provided URL'
          : 'Import from URL'}
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          color="primary"
          disabled={options.length > 1}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
