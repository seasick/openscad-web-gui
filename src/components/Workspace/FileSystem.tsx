import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import PolylineIcon from '@mui/icons-material/Polyline';
import { Alert, AlertTitle } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { BlobReader, Uint8ArrayWriter, ZipReader } from '@zip.js/zip.js';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

import WorkspaceFile from '../../lib/WorkspaceFile';
import { useFileSystemProvider } from '../providers/FileSystemProvider';
import ImportFromUrlDialog from './FileSystem/ImportDialog';
import StyledTreeItem from './FileSystem/StyledTreeItem';

const fileIcons = {
  svg: PolylineIcon,
  default: FileIcon,
};

export default function FileSystem() {
  const { files, unlinkFile, writeFiles } = useFileSystemProvider();
  const [open, setOpen] = React.useState(false);

  const handleAcceptedFiles = async (acceptedFiles) => {
    // Font files should be copied to the fonts folder
    const handledFiles = (
      await Promise.all(
        acceptedFiles.map(async (f) => {
          if (f.name.match(/\.(woff2?|ttf|otf|eot)$/i)) {
            f = new WorkspaceFile([f], f.name, {
              type: 'font',
              lastModified: f.lastModified,
              path: 'libraries/' + f.path,
            }) as WorkspaceFile;
          } else if (f.name.match(/\.(zip)$/i)) {
            const files = await new ZipReader(new BlobReader(f)).getEntries();

            // Remove directories from the list of files
            return Promise.all(
              files
                .filter((f) => {
                  return f.directory === false;
                })
                .map(async (f) => {
                  const writer = new Uint8ArrayWriter();
                  const name = f.filename.split('/').pop();

                  return new WorkspaceFile([await f.getData(writer)], name, {
                    lastModified: f.lastModDate.getTime(),
                    path: 'libraries/' + f.filename,
                  }) as WorkspaceFile;
                })
            );
          }

          return f;
        })
      )
    ).reduce((prev, curr) => {
      if (Array.isArray(curr)) {
        return prev.concat(curr);
      }

      prev.push(curr);

      return prev;
    }, []);

    writeFiles(handledFiles).then(() =>
      enqueueSnackbar('Files uploaded', { variant: 'success' })
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: handleAcceptedFiles,
    noClick: true,
    noKeyboard: true,
  });

  const handleClose = () => setOpen(false);

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    const name = event.currentTarget.dataset.name;
    if (name) {
      unlinkFile(name);
    }

    event.stopPropagation();
  };

  const createTree = (files: TreeItemStruct[]) => {
    const tree = [];
    for (const file of files) {
      if (file.children.length > 0) {
        tree.push(
          <StyledTreeItem
            key={file.path}
            nodeId={file.path}
            labelText={file.name}
            labelIcon={FolderIcon}
          >
            {createTree(file.children)}
          </StyledTreeItem>
        );
      } else {
        const extension = file.name.split('.').pop();
        const ItemIcon = fileIcons[extension] || fileIcons.default;

        tree.push(
          <StyledTreeItem
            key={file.path}
            nodeId={file.path}
            labelText={file.name}
            endLabelAdornment={
              <IconButton onClick={handleDelete} data-name={file.name}>
                <DeleteIcon />
              </IconButton>
            }
            labelIcon={ItemIcon}
          />
        );
      }
    }
    return tree;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Alert severity="info" sx={{ mb: 1 }}>
        <AlertTitle>File System Manager</AlertTitle>
        Manage the files of your workspace. Upload fonts, images and libraries.
      </Alert>
      <Button variant="contained" onClick={() => setOpen(true)} fullWidth>
        Import/Upload
      </Button>
      <ImportFromUrlDialog
        open={open}
        onClose={handleClose}
        onNewFile={handleAcceptedFiles}
      />

      <Box
        sx={{
          border: isDragActive ? 8 : 0,
          borderStyle: 'dashed',
          borderColor: '#ccc',
          p: 1 + (isDragActive ? 0 : 1),
          flexGrow: 1,
          overflowY: 'scroll',
        }}
      >
        <TreeView
          {...getRootProps()}
          aria-label="File tree"
          defaultExpanded={['3']}
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
          defaultEndIcon={<div style={{ width: 24 }} />}
          sx={{ height: '100%', overflowY: 'scroll' }}
        >
          <input {...getInputProps()} />
          {createTree(recursiveTree(files))}
        </TreeView>
      </Box>
    </Box>
  );
}

type TreeItemStruct = {
  name: string;
  children: TreeItemStruct[];
  path: string;
};

function recursiveTree(files: WorkspaceFile[]): TreeItemStruct[] {
  const tree = [];

  for (const file of files) {
    // Remove leading slash
    const path = file.path.replace(/^\//, '').split('/');
    let current = tree;

    for (const part of path) {
      if (!current.find((c) => c.name === part)) {
        current.push({
          name: part,
          children: [],
          path: path.slice(0, path.indexOf(part) + 1).join('/'),
        });
      }
      current = current.find((c) => c.name === part).children;
    }
  }
  return tree;
}
