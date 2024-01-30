import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import TuneIcon from '@mui/icons-material/Tune';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React from 'react';

import { EditorMode } from '../Workspace';

type Props = {
  onChange: (mode: EditorMode) => void;
  mode: string;
};

export default function Sidebar({ onChange, mode }: Props) {
  const handleMode = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string
  ) => {
    if (newMode !== null) {
      onChange(newMode as EditorMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={mode}
      orientation="vertical"
      exclusive
      onChange={handleMode}
      aria-label="text alignment"
    >
      <ToggleButton value="editor" aria-label="Script Editor">
        <CodeIcon />
      </ToggleButton>
      <ToggleButton value="customizer" aria-label="Customizer">
        <TuneIcon />
      </ToggleButton>
      <ToggleButton value="file" aria-label="File Manager">
        <FolderIcon />
      </ToggleButton>
      <ToggleButton value="libraries" aria-label="Libraries">
        <LibraryBooksIcon />
      </ToggleButton>
      <ToggleButton value="fonts" aria-label="Fonts">
        <FontDownloadIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
