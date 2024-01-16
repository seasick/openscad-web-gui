import { Parameter } from './lib/openSCAD/parseParameter';

export type OpenSCADWorkerInputMessage = {
  type: 'preview' | 'export';
  code: string;
  fileType: string;
  params: Parameter[];
};

export type OpenSCADWorkerOutputMessage = {
  log: {
    stdErr: string[];
    stdOut: string[];
  };
  output: Uint8Array;
  exitCode: number;
  duration: number;
};
