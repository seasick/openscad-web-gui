import React, { createContext, useState } from 'react';

import executeOpenSCAD from '../../lib/openSCAD/execute';
import { Parameter } from '../../lib/openSCAD/parseParameter';
import {
  OpenSCADWorkerMessageData,
  WorkerMessageType,
} from '../../worker/types';

// Create a context for the web worker
const OpenSCADWorkerContext = createContext<{
  execExport?: (
    code: string,
    fileType: string,
    params?: OpenSCADWorkerMessageData['params']
  ) => void;
  exportFile?: File | null;
  isExporting?: boolean;
  log?: string[];
  preview?: (
    code: string,
    params?: OpenSCADWorkerMessageData['params']
  ) => void;
  previewFile?: File | null;
  isRendering?: boolean;
  reset?: () => void;
  parameters?: Parameter[];
  setParameters?: React.Dispatch<React.SetStateAction<Parameter[]>>;
  resetLog?: () => void;
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
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [parameters, setParameters] = useState<Parameter[]>([]);

  const value = {
    log,
    exportFile,
    previewFile,
    isExporting,
    isRendering,

    execExport: async (
      code: string,
      fileType: string,
      params?: OpenSCADWorkerMessageData['params']
    ) => {
      setIsExporting(true);

      const output = await executeOpenSCAD(
        WorkerMessageType.EXPORT,
        code,
        fileType,
        params
      );

      setLog((prevLog) => [
        ...prevLog,
        ...output.log.stdErr,
        ...output.log.stdOut,
      ]);

      if (output.output) {
        setExportFile(output.output);
      }
      setIsExporting(false);
    },

    preview: async (
      code: string,
      params?: OpenSCADWorkerMessageData['params']
    ) => {
      setIsRendering(true);

      const output = await executeOpenSCAD(
        WorkerMessageType.PREVIEW,
        code,
        'stl',
        params
      );

      setLog((prevLog) => [
        ...prevLog,
        ...output.log.stdErr,
        ...output.log.stdOut,
      ]);

      if (output.output) {
        setPreviewFile(output.output);
      }
      setIsRendering(false);
    },

    parameters,
    setParameters,

    reset: () => {
      setLog([]);
      setPreviewFile(null);
      setExportFile(null);
      setIsExporting(false);
      setIsRendering(false);
      setParameters([]);
    },

    resetLog: () => {
      setLog([]);
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
