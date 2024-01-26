import { Parameter } from '../lib/openSCAD/parseParameter';

export const enum WorkerMessageType {
  PREVIEW = 'preview',
  EXPORT = 'export',
}

type WorkerMessageDataMap = {
  [WorkerMessageType.PREVIEW]: OpenSCADWorkerMessageData;
  [WorkerMessageType.EXPORT]: OpenSCADWorkerMessageData;
};

export type WorkerMessage = {
  id?: string | number;
  type: WorkerMessageType;
  data: WorkerMessageDataMap[WorkerMessage['type']];
};

export type WorkerResponseMessage = {
  id: string | number;
  type: WorkerMessageType;
  data: OpenSCADWorkerResponseData;
  err?: Error;
};

export type OpenSCADWorkerMessageData = {
  code: string;
  fileType: string;
  params: Parameter[];
};

export type OpenSCADWorkerResponseData = {
  log: {
    stdErr: string[];
    stdOut: string[];
  };
  fileType: string;
  output: Uint8Array;
  exitCode: number;
  duration: number;
};
