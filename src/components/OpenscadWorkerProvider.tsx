import React, { createContext, useState } from 'react';

import executeOpenSCAD from '../lib/openSCAD/execute';
import { OpenSCADWorkerInputMessage } from '../types';

// Create a context for the web worker
const OpenSCADWorkerContext = createContext<{
  export?: (
    code: string,
    fileType: string,
    params?: OpenSCADWorkerInputMessage['params']
  ) => void;
  exportFile?: File | null;
  log?: string[];
  preview?: (
    code: string,
    params?: OpenSCADWorkerInputMessage['params']
  ) => void;
  previewFile?: File | null;
  reset?: () => void;
}>({
  log: [],
});

type Props = {
  children: React.ReactNode;
};

// Create a provider component
export default function OpenscadWorkerProvider({ children }: Props) {
  const [log, setLog] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [exportFile, setExportFile] = useState<File | null>(null);

  const value = {
    log,
    exportFile,
    previewFile,

    export: async (
      code: string,
      fileType: string,
      params?: OpenSCADWorkerInputMessage['params']
    ) => {
      const output = await executeOpenSCAD('export', code, fileType, params);
      setLog((prevLog) => [
        ...prevLog,
        ...output.log.stdErr,
        ...output.log.stdOut,
      ]);

      if (output.output) {
        setExportFile(output.output);
      }
    },

    preview: async (
      code: string,
      params?: OpenSCADWorkerInputMessage['params']
    ) => {
      const output = await executeOpenSCAD('preview', code, 'stl', params);

      setLog((prevLog) => [
        ...prevLog,
        ...output.log.stdErr,
        ...output.log.stdOut,
      ]);

      if (output.output) {
        setPreviewFile(output.output);
      }
    },

    reset: () => {
      setLog([]);
      setPreviewFile(null);
      setExportFile(null);
    },
  };

  return (
    <OpenSCADWorkerContext.Provider value={value}>
      {children}
    </OpenSCADWorkerContext.Provider>
  );
}

export function useOpenSCADProvider() {
  return React.useContext(OpenSCADWorkerContext);
}
