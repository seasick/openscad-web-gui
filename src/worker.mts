import OpenSCAD from './worker/openSCAD';
import {
  FileSystemWorkerMessageData,
  OpenSCADWorkerMessageData,
  WorkerMessage,
  WorkerMessageType,
} from './worker/types.js';

const openSCAD = new OpenSCAD();

onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { data: message } = event;
  let response;

  try {
    switch (message.type) {
      // Users wants to preview the model
      case WorkerMessageType.PREVIEW:
        response = await openSCAD.preview(
          message.data as OpenSCADWorkerMessageData
        );
        break;

      // Users wants to export the model as e.g. STL
      case WorkerMessageType.EXPORT:
        response = await openSCAD.exportFile(
          message.data as OpenSCADWorkerMessageData
        );
        break;

      default:
        throw new Error('Unknown message type');
    }

    postMessage({
      id: message.id,
      data: response,
      type: message.type,
    });
  } catch (err) {
    // https://stackoverflow.com/a/40081158/1706846
    setTimeout(function () {
      postMessage({ id: message.id, error: err });
    });
  }
};
