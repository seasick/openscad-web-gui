import DownloadIcon from '@mui/icons-material/Download';
import LoopIcon from '@mui/icons-material/Loop';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import commonLibraries from '../../etc/libraries.json';
import useUrlFileWriter from '../../hooks/useUrlFileWriter';

export default function Libraries() {
  const { write, isLoading } = useUrlFileWriter();
  const [isAvailable, setAvailable] = React.useState({});

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const url = event.currentTarget.dataset.url;
    const startPath = event.currentTarget.dataset.startPath;
    const path = event.currentTarget.dataset.path;

    await write(url, (fileName) => {
      return 'libraries/' + path + fileName.replace(startPath, '');
    });

    setAvailable({ ...isAvailable, [url]: true });
  };

  const libraryIsAlreadyDownloaded = (lib) => {
    return isAvailable[lib.url];
  };

  return (
    <>
      <Alert severity="info">
        <AlertTitle>Libraries</AlertTitle>
        Select which common libraries to include in your project. You can use
        your own through the file system manager.
      </Alert>
      <List>
        {commonLibraries.map((lib) => (
          <ListItem
            key={lib.name}
            secondaryAction={
              isAvailable && (
                <IconButton
                  edge="end"
                  aria-label="download library"
                  onClick={handleDownload}
                  disabled={libraryIsAlreadyDownloaded(lib)}
                  data-url={lib.url}
                  data-path={lib.name}
                  data-start-path={lib.startPath}
                >
                  {isLoading[lib.url] ? (
                    <LoopIcon sx={{ animation: 'spin 2s linear infinite' }} />
                  ) : (
                    <DownloadIcon />
                  )}
                </IconButton>
              )
            }
          >
            <ListItemText primary={lib.name} secondary={lib.description} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
