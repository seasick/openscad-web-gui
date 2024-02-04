import React, { createContext, useEffect, useState } from 'react';

import { useFileSystemProvider } from './FileSystemProvider';

type ContextType = {
  code: string;
  setCode: (code: string) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
};

// Create a context for the provider
const WorkspaceContext = createContext<ContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

// Create a provider component
export default function WorkspaceProvider({ children }: Props) {
  const [code, setCode] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const { files } = useFileSystemProvider();

  // Load the first .scad file in the list (which isn't in the libraries folder),
  // but only if there is no code yet.
  useEffect(() => {
    if (files.length > 0 && !code) {
      (async () => {
        const filtered = files.filter(
          (f) => f.name.endsWith('.scad') && !f.path.startsWith('libraries')
        );

        if (filtered.length) {
          setCode(await filtered[0].text());
          setSelectedFile(filtered[0].name);
        }
      })();
    }
  }, [files]);

  const value = {
    code,
    setCode,
    selectedFile,
    setSelectedFile,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceProvider() {
  const context = React.useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      'useWorkspaceProvider must be used within a WorkspaceProvider'
    );
  }

  return context;
}
