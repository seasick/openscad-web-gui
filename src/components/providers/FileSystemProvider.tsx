import React, { createContext, useState } from 'react';

import WorkspaceFile from '../../lib/WorkspaceFile';
import executeWorkerJob from '../../lib/executeWorkerJob';
import {
  FileSystemWorkerMessageData,
  WorkerMessageType,
} from '../../worker/types';

type ContextType = {
  files: WorkspaceFile[];
  writeFile: (file: WorkspaceFile) => Promise<void>;
  writeFiles: (files: WorkspaceFile[]) => Promise<void>;
  readFile: (path: string) => Promise<WorkspaceFile>;
  unlinkFile: (path: string) => Promise<void>;
};

// Create a context for the web worker
const FileSystemContext = createContext<ContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

// Create a provider component
export default function FileSystemProvider({ children }: Props) {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);

  const value = {
    files,
    writeFile: async (file: WorkspaceFile) => {
      await executeWorkerJob({
        type: WorkerMessageType.FS_WRITE,
        data: {
          path: file.path || file.name,
          content: file,
        },
      });

      setFiles((files) => [...files.filter((f) => f.name !== file.name), file]);
    },

    writeFiles: async (files2: WorkspaceFile[]) => {
      await Promise.all(
        files2.map((file) => {
          const p = async () => {
            return executeWorkerJob({
              type: WorkerMessageType.FS_WRITE,
              data: {
                path: file.path || file.name,
                content: file,
              },
            });
          };
          return p();
        })
      );

      setFiles((files) => {
        const filtered = files.filter(
          (f) => !files2.find((f2) => f2.name === f.name)
        );
        return [...filtered, ...files2];
      });
    },

    readFile: async (path: string) => {
      const response = await executeWorkerJob({
        type: WorkerMessageType.FS_READ,
        data: {
          path,
        },
      });
      const data = response.data as FileSystemWorkerMessageData;
      const name = data.path.split('/').pop();

      return new WorkspaceFile([data.content], name, {
        path: data.path,
      });
    },

    unlinkFile: async (path: string) => {
      await executeWorkerJob({
        type: WorkerMessageType.FS_UNLINK,
        data: {
          path,
        },
      });

      setFiles((files) => files.filter((f) => f.path !== path));
    },
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystemProvider() {
  const context = React.useContext(FileSystemContext);

  if (!context) {
    throw new Error(
      'useFileSystemProvider must be used within a FileSystemProvider'
    );
  }

  return context;
}
