import {
  OpenSCADWorkerMessageData,
  OpenSCADWorkerResponseData,
  WorkerMessage,
  WorkerMessageType,
  WorkerResponseMessage,
} from '../../worker/types';

type Output = Omit<OpenSCADWorkerResponseData, 'output'> & { output: File };
type PromiseMapItem = {
  resolve: (value: Output | PromiseLike<Output>) => void;
  reject: (reason?: any) => void;
  type: WorkerMessageType;
};

const worker = new Worker('./worker.js', { type: 'module' });
const promiseMap: Record<string, PromiseMapItem> = {};

worker.addEventListener(
  'message',
  (event: MessageEvent<WorkerResponseMessage>) => {
    const { id } = event.data;
    const { resolve, reject } = promiseMap[id];

    if (!resolve || !reject) {
      throw new Error('Unknown message id');
    }

    if (event.data.err) {
      reject(event.data.err);
    } else {
      if (event.data.type === WorkerMessageType.PREVIEW) {
        const data = event.data.data as OpenSCADWorkerResponseData;

        resolve({
          ...data,
          output: new File([data.output], 'export.' + data.fileType),
        });
      }
    }

    // Remove it from the promise map
    delete promiseMap[id];
  }
);

worker.addEventListener('error', (event) => {
  // reject(event);
  console.log(event); // TODO
});

worker.addEventListener('unhandledrejection', function (event) {
  // reject(event);
  console.log(event); // TODO
});

export default async function executeOpenSCAD(
  type: WorkerMessageType,
  code: string,
  fileType: string,
  params: OpenSCADWorkerMessageData['params']
): Promise<Output> {
  const id = Math.random().toString(36).substring(2, 9);
  const promise = new Promise<Output>((resolve, reject) => {
    promiseMap[id] = { resolve, reject, type };
  });

  const message: WorkerMessage = {
    id,
    type,
    data: {
      code,
      fileType,
      params,
    },
  };

  console.log('Sending message to worker', params);
  worker.postMessage(message);

  return promise;
}
