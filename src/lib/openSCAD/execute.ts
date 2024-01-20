import {
  OpenSCADWorkerInputMessage,
  OpenSCADWorkerOutputMessage,
} from '../../types';

type Output = Omit<OpenSCADWorkerOutputMessage, 'output'> & { output: File };

export default async function executeOpenSCAD(
  type: 'preview' | 'export',
  code: string,
  fileType: string,
  params: OpenSCADWorkerInputMessage['params']
): Promise<Output> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./openSCADWorker.js', { type: 'module' });

    worker.addEventListener(
      'message',
      (event: MessageEvent<OpenSCADWorkerOutputMessage>) => {
        const { output, exitCode, duration, log } = event.data;

        console.debug(`Rendered in ${duration}ms with exit code ${exitCode}`);
        console.debug(log);

        resolve({
          output: output ? new File([output], 'result.' + fileType) : null,
          exitCode,
          duration,
          log,
        });

        worker.terminate();
      }
    );

    worker.addEventListener('error', (event) => {
      reject(event);
      worker.terminate();
    });

    worker.addEventListener('unhandledrejection', function (event) {
      reject(event);
    });

    console.log('Sending message to worker', params);
    worker.postMessage({
      type,
      code,
      fileType,
      params,
    } as OpenSCADWorkerInputMessage);
  });
}
