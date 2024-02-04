import type { SelectChangeEvent } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';

import { useFileSystemProvider } from '../../providers/FileSystemProvider';

type Props = {
  onChange: (event: SelectChangeEvent<string>) => void;
  selectedFile?: string;
};

const visibleExtensions = ['scad', 'svg', 'txt'];

export default function FileSelector({ onChange, selectedFile }: Props) {
  const { files } = useFileSystemProvider();
  const filteredFiles = files.filter((file) => {
    const extension = file.path.split('.').pop();
    return visibleExtensions.includes(extension);
  });

  return (
    <FormControl>
      <Select fullWidth value={selectedFile || ''} onChange={onChange}>
        {filteredFiles.map((file, idx) => (
          <MenuItem key={idx} value={file.path}>
            {file.path}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
