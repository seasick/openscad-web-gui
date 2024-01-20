import FileOpenIcon from '@mui/icons-material/FileOpen';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import { FetchaFile } from '../lib/fetcha';

type Props = {
  files: FetchaFile[];
  onSelect: (index: number) => void;
};

export default function ImportFileSelector({ files, onSelect }: Props) {
  return (
    <>
      <Alert severity="info">
        <AlertTitle>Multiple files found at the given location</AlertTitle>
        Please select the one you want to import.
      </Alert>
      <List>
        {files.map((r, idx) => (
          <ListItem
            sx={{ cursor: 'pointer' }}
            key={r.url}
            onClick={() => {
              onSelect(idx);
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <FileOpenIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={r.name} secondary={r.description} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
