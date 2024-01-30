import DownloadIcon from '@mui/icons-material/Download';
import LoopIcon from '@mui/icons-material/Loop';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { BlobReader, Uint8ArrayWriter, ZipReader } from '@zip.js/zip.js';
import React from 'react';

import commonLibraries from '../../etc/libraries.json';
import FileWithPath from '../../lib/FileWithPath';
import { useFileSystemProvider } from '../FileSystemProvider';

export default function Libraries() {
  const { writeFiles } = useFileSystemProvider();
  const [isLoading, setLoading] = React.useState({});
  const [isAvailable, setAvailable] = React.useState({});

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const url = event.currentTarget.dataset.url;
    const startPath = event.currentTarget.dataset.startPath;
    const path = event.currentTarget.dataset.path;

    setLoading({ ...isLoading, [url]: true });

    const response = await fetch('__CORSPROXY' + url);

    // Unzip the file
    const zip = await response.blob();
    const files = await new ZipReader(new BlobReader(zip)).getEntries();

    // Libraries should go into the library folder
    const movedFiles = await Promise.all(
      files
        .filter((f) => f.directory === false)
        .map(async (f) => {
          const writer = new Uint8ArrayWriter();
          const fileName = path + f.filename.replace(startPath, '');
          const name = fileName.split('/').pop();

          return new FileWithPath([await f.getData(writer)], name, {
            lastModified: f.lastModDate.getTime(),
            path: 'libraries/' + fileName,
          }) as FileWithPath;
        })
    );

    await writeFiles(movedFiles);

    setAvailable({ ...isAvailable, [url]: true });
    setLoading({ ...isLoading, [url]: false });
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
