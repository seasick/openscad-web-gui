import {
  OpenSCADWorkerMessageData,
  OpenSCADWorkerResponseData,
  WorkerMessage,
  WorkerMessageType,
} from '../../worker/types';
import WorkspaceFile from '../WorkspaceFile';
import executeWorkerJob from '../executeWorkerJob';

type Output = Omit<OpenSCADWorkerResponseData, 'output'> & { output: File };

export default async function executeOpenSCAD(
  type: WorkerMessageType,
  code: string,
  fileType: string,
  params: OpenSCADWorkerMessageData['params']
): Promise<Output> {
  const message: WorkerMessage = {
    type,
    data: {
      code,
      fileType,
      params,
    },
  };

  const response = await executeWorkerJob(message);
  const data = response.data as OpenSCADWorkerResponseData;
  let output: WorkspaceFile;

  if (data.output) {
    output = new WorkspaceFile([data.output], 'output.' + data.fileType);
  }

  return {
    ...data,
    output,
  };
}
