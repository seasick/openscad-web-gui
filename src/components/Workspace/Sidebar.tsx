import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import TuneIcon from '@mui/icons-material/Tune';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { EditorMode } from '../Workspace';

type Props = {
  onChange: (mode: EditorMode) => void;
  mode: string;
};

export default function Sidebar({ onChange, mode }: Props) {
  const handleMode = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const newMode = event.currentTarget.dataset.value;
    if (newMode !== null) {
      onChange(newMode as EditorMode);
    }
  };

  const buttons = [
    { value: 'editor', icon: <CodeIcon />, label: 'Script Editor' },
    { value: 'customizer', icon: <TuneIcon />, label: 'Customizer' },
    { value: 'file', icon: <FolderIcon />, label: 'File Manager' },
    { value: 'libraries', icon: <LibraryBooksIcon />, label: 'Libraries' },
    { value: 'fonts', icon: <FontDownloadIcon />, label: 'Fonts' },
  ];

  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
      spacing={1}
    >
      {buttons.map((button) => (
        <Tooltip key={button.value} title={button.label} placement="right">
          <IconButton
            aria-label={button.label}
            color={mode === button.value ? 'primary' : 'default'}
            data-value={button.value}
            onClick={handleMode}
            sx={{
              backgroundColor: mode === button.value ? '#e0e0e0' : 'inherit',
            }}
          >
            {button.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  );
}
