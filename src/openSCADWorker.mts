import {
  OpenSCADWorkerInputMessage,
  OpenSCADWorkerOutputMessage,
} from './types.js';
import OpenSCAD from './vendor/openscad-wasm/openscad.js';

onmessage = async (event: MessageEvent<OpenSCADWorkerInputMessage>) => {
  try {
    const { data } = event;

    switch (data.type) {
      case 'preview':
        postMessage(await preview(data.code, data.params, data.fileType));
        return;
      case 'export':
        postMessage(await exportFile(data.code, data.params, data.fileType));
        return;
      default:
        throw new Error('Unknown message type');
    }
  } catch (err) {
    // https://stackoverflow.com/a/40081158/1706846
    setTimeout(function () {
      throw err;
    });
  }
};

async function exportFile(
  code: string,
  params: OpenSCADWorkerInputMessage['params'],
  fileType = 'stl'
): Promise<OpenSCADWorkerOutputMessage> {
  const parameters = params.map(({ name, value }) => {
    return `-D${name}=${value}`;
  });

  return await executeOpenscad(code, fileType, parameters);
}

/**
 *
 * @param code Code for the OpenSCAD input file
 * @param params Key value pairs of customizer variables TODO!
 * @param fileType The filetype to export
 * @returns
 */
async function preview(
  code: string,
  params: OpenSCADWorkerInputMessage['params'],
  fileType = 'stl'
): Promise<OpenSCADWorkerOutputMessage> {
  const parameters = params.map(({ name, value }) => {
    return `-D${name}=${value}`;
  });

  parameters.push('--export-format=binstl');
  parameters.push(`--enable=manifold`);
  parameters.push(`--enable=fast-csg`);
  parameters.push(`--enable=lazy-union`);

  return await executeOpenscad(code, fileType, parameters);
}

/**
 *
 * @param code Code for the OpenSCAD input file
 * @param fileType e.g. STL, AMF, 3MF, OFF, etc
 * @param parameters array of parameters to pass to OpenSCAD
 * @returns
 */
async function executeOpenscad(
  code: string,
  fileType: string,
  parameters: string[]
): Promise<OpenSCADWorkerOutputMessage> {
  const start = Date.now();

  const inputFile = '/input.scad';
  const outputFile = '/out.' + fileType;

  const log = {
    stdErr: [],
    stdOut: [],
  };

  const logger = (type) => (text: string) => {
    log[type].push(text);
  };

  // Initialize the OpenSCAD instance
  const instance = await OpenSCAD({
    noInitialRun: true,
    print: logger('stdOut'),
    printErr: logger('stdErr'),
  });

  // Write the code to a file
  instance.FS.writeFile(inputFile, code);

  const args = [inputFile, '-o', outputFile, ...parameters];
  let exitCode;
  let output;

  console.log(args);
  try {
    exitCode = instance.callMain(args);
  } catch (error) {
    throw new Error('OpenSCAD exited with an error: ' + error.message);
  }

  try {
    output = instance.FS.readFile(outputFile);
  } catch (error) {
    throw new Error('OpenSCAD cannot read created file: ' + error.message);
  }

  return { output, exitCode, duration: Date.now() - start, log };
}
