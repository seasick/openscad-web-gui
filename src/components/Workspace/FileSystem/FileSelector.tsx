import type { SelectChangeEvent } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React from 'react';

import { useFileSystemProvider } from '../../FileSystemProvider';

type Props = {
  onChange: (event: SelectChangeEvent<string>) => void;
  selectedFile?: string;
};

export default function FileSelector({ onChange, selectedFile }: Props) {
  const { files } = useFileSystemProvider();

  return (
    <FormControl>
      <Select fullWidth value={selectedFile || ''} onChange={onChange}>
        {files.map((file, idx) => (
          <MenuItem key={idx} value={file.path}>
            {file.path}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
