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

import commonFonts from '../../etc/fonts.json';
import FileWithPath from '../../lib/FileWithPath';
import { useFileSystemProvider } from '../FileSystemProvider';

export default function Fonts() {
  const { writeFiles } = useFileSystemProvider();
  const [isLoading, setLoading] = React.useState({});
  const [isAvailable, setAvailable] = React.useState({});

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const url = event.currentTarget.dataset.url;
    const startPath = event.currentTarget.dataset.startPath;

    setLoading({ ...isLoading, [url]: true });

    const response = await fetch('__CORSPROXY' + url);

    // Unzip the file
    const zip = await response.blob();
    const files = await new ZipReader(new BlobReader(zip)).getEntries();

    // Fonts should go into the font folder
    const movedFiles = await Promise.all(
      files
        .filter((f) => f.directory === false)
        .filter((f) => f.filename.match(/\.(woff2?|ttf|otf|eot)$/i))
        .map(async (f) => {
          const writer = new Uint8ArrayWriter();
          const fileName = f.filename.replace(startPath, '');
          const name = fileName.split('/').pop();

          return new FileWithPath([await f.getData(writer)], name, {
            lastModified: f.lastModDate.getTime(),
            path: '/fonts/' + fileName,
          }) as FileWithPath;
        })
    );

    await writeFiles(movedFiles);

    setAvailable({ ...isAvailable, [url]: true });
    setLoading({ ...isLoading, [url]: false });
  };

  const fontIsAlreadyDownloaded = (lib) => {
    return isAvailable[lib.url];
  };

  return (
    <>
      <Alert severity="info">
        <AlertTitle>Libraries</AlertTitle>
        Select which common font to include in your project.
      </Alert>
      <List>
        {commonFonts.map((font) => (
          <ListItem
            key={font.name}
            secondaryAction={
              isAvailable && (
                <IconButton
                  edge="end"
                  aria-label="download font"
                  onClick={handleDownload}
                  disabled={fontIsAlreadyDownloaded(font)}
                  data-url={font.url}
                  data-start-path={font.startPath}
                >
                  {isLoading[font.url] ? (
                    <LoopIcon sx={{ animation: 'spin 2s linear infinite' }} />
                  ) : (
                    <DownloadIcon />
                  )}
                </IconButton>
              )
            }
          >
            <ListItemText primary={font.name} secondary={font.description} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
