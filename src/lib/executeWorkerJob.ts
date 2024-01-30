import { WorkerMessage, WorkerResponseMessage } from '../worker/types';

type PromiseMapItem = {
  resolve: (value: WorkerResponseMessage) => void;
  reject: (reason?: unknown) => void;
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
      resolve(event.data);
    }

    // Remove it from the promise map
    promiseMap[id] = null;
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

export default async function executeWorkerJob(
  message: WorkerMessage
): Promise<WorkerResponseMessage> {
  const id = Math.random().toString(36).substring(2, 9);
  const promise = new Promise<WorkerResponseMessage>((resolve, reject) => {
    promiseMap[id] = { resolve, reject };
  });

  worker.postMessage({
    id,
    ...message,
  });

  return promise;
}
