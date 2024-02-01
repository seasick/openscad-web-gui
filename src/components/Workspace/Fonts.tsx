import DownloadIcon from '@mui/icons-material/Download';
import LoopIcon from '@mui/icons-material/Loop';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import commonFonts from '../../etc/fonts.json';
import useUrlFileWriter from '../../hooks/useUrlFileWriter';
import Bytes from '../Bytes';

export default function Fonts() {
  const { write, isLoading } = useUrlFileWriter();
  const [isAvailable, setAvailable] = React.useState({});

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const url = event.currentTarget.dataset.url;
    const trimFromStartPath = event.currentTarget.dataset.trimFromStartPath;

    await write(
      url,
      (fileName) => {
        return 'fonts/' + fileName.replace(trimFromStartPath, '');
      },
      (fileName) => {
        return !!fileName.match(/\.(woff2?|ttf|otf|eot)$/i);
      }
    );

    setAvailable({ ...isAvailable, [url]: true });
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
                  data-trim-from-start-path={font.trimFromStartPath}
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
            <ListItemText
              primary={
                <p>
                  {font.name}{' '}
                  <i>
                    <Bytes bytes={font.size} />
                  </i>
                </p>
              }
              secondary={font.description}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}
