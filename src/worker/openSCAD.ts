import OpenSCAD from '../vendor/openscad-wasm/openscad.js';
import {
  FileSystemWorkerMessageData,
  OpenSCADWorkerMessageData,
  OpenSCADWorkerResponseData,
} from './types';

class OpenSCADWrapper {
  instance: Promise<OpenSCAD> | OpenSCAD;
  log = {
    stdErr: [],
    stdOut: [],
  };

  constructor() {
    this.instance = OpenSCAD({
      noInitialRun: true,
      print: this.logger('stdOut'),
      printErr: this.logger('stdErr'),
    });
  }

  logger = (type) => (text: string) => {
    this.log[type].push(text);
  };

  /**
   *
   * @param data
   * @returns
   */
  async exportFile(
    data: OpenSCADWorkerMessageData
  ): Promise<OpenSCADWorkerResponseData> {
    if (this.instance instanceof Promise) {
      this.instance = await this.instance;
    }

    const parameters = data.params.map(({ name, type, value }) => {
      if (type === 'string' && typeof value === 'string') {
        value = this.escapeShell(value);
      } else if (type === 'number[]' && Array.isArray(value)) {
        value = `[${value.join(',')}]`;
      } else if (type === 'string[]' && Array.isArray(value)) {
        value = `[${value.map((item) => this.escapeShell(item)).join(',')}]`;
      }

      return `-D${name}=${value}`;
    });

    return await this.executeOpenscad(data.code, data.fileType, parameters);
  }

  /**
   *
   * @param data
   * @returns
   */
  async preview(
    data: OpenSCADWorkerMessageData
  ): Promise<OpenSCADWorkerResponseData> {
    if (this.instance instanceof Promise) {
      this.instance = await this.instance;
    }

    const parameters = data.params
      .map(({ name, type, value }) => {
        if (type === 'string' && typeof value === 'string') {
          value = this.escapeShell(value);
        } else if (type === 'number[]' && Array.isArray(value)) {
          value = `[${value.join(',')}]`;
        } else if (type === 'string[]' && Array.isArray(value)) {
          value = `[${value.map((item) => this.escapeShell(item)).join(',')}]`;
        } else if (type === 'boolean[]' && Array.isArray(value)) {
          value = `[${value.join(',')}]`;
        }
        return `-D${name}=${value}`;
      })
      .filter((x) => !!x);

    parameters.push('--export-format=binstl');
    parameters.push(`--enable=manifold`);
    parameters.push(`--enable=fast-csg`);
    parameters.push(`--enable=lazy-union`);

    return await this.executeOpenscad(data.code, data.fileType, parameters);
  }

  /**
   *
   * @param code Code for the OpenSCAD input file
   * @param fileType e.g. STL, AMF, 3MF, OFF, etc
   * @param parameters array of parameters to pass to OpenSCAD
   * @returns
   */
  async executeOpenscad(
    code: string,
    fileType: string,
    parameters: string[]
  ): Promise<OpenSCADWorkerResponseData> {
    const start = Date.now();

    // Reset log
    this.log.stdErr = [];
    this.log.stdOut = [];

    const inputFile = '/input.scad';
    const outputFile = '/out.' + fileType;

    // Write the code to a file
    this.instance.FS.writeFile(inputFile, code);

    const args = [inputFile, '-o', outputFile, ...parameters];
    let exitCode;
    let output;

    try {
      exitCode = this.instance.callMain(args);
    } catch (error) {
      throw new Error('OpenSCAD exited with an error: ' + error.message);
    }

    if (exitCode === 0) {
      try {
        output = this.instance.FS.readFile(outputFile);
      } catch (error) {
        throw new Error('OpenSCAD cannot read created file: ' + error.message);
      }
    }

    return {
      output,
      exitCode,
      duration: Date.now() - start,
      log: this.log,
      fileType,
    };
  }

  escapeShell(cmd: string) {
    return '"' + cmd.replace(/(["'$`\\])/g, '\\$1') + '"';
  }
}

export default OpenSCADWrapper;
