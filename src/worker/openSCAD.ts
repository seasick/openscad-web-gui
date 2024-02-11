import WorkspaceFile from '../lib/WorkspaceFile.js';
import OpenSCAD from '../vendor/openscad-wasm/openscad.js';
import {
  FileSystemWorkerMessageData,
  OpenSCADWorkerMessageData,
  OpenSCADWorkerResponseData,
} from './types';

const fontsConf = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig></fontconfig>`;

let defaultFont;

class OpenSCADWrapper {
  log = {
    stdErr: [],
    stdOut: [],
  };

  files: WorkspaceFile[] = [];

  async getInstance(): Promise<OpenSCAD> {
    const instance = await OpenSCAD({
      noInitialRun: true,
      print: this.logger('stdOut'),
      printErr: this.logger('stdErr'),
    });
    if (!defaultFont) {
      const fontResponse = await fetch('LiberationSans-Regular.ttf');
      defaultFont = await fontResponse.arrayBuffer();
    }

    // Make sure the root directory exists
    this.createDirectoryRecusive(instance, 'fonts');

    // Write the font.conf file
    instance.FS.writeFile('/fonts/fonts.conf', fontsConf);

    // Add default font
    instance.FS.writeFile(
      'fonts/LiberationSans-Regular.ttf',
      new Int8Array(defaultFont)
    );

    for (const file of this.files) {
      // Make sure the directory of the file exists
      const path = file.path.split('/');
      path.pop();
      const dir = path.join('/');

      if (dir && !this.fileExists(instance, dir)) {
        this.createDirectoryRecusive(instance, dir);
      }

      const content = await file.arrayBuffer();
      instance.FS.writeFile(file.path, new Int8Array(content));
    }

    return instance;
  }

  fileExists(instance, path: string) {
    try {
      instance.FS.stat(path);
      return true;
    } catch (err) {
      return false;
    }
  }

  createDirectoryRecusive(instance, path: string) {
    const parts = path.split('/');
    let currentPath = '';

    for (const part of parts) {
      currentPath += '/' + part;

      if (!this.fileExists(instance, currentPath)) {
        instance.FS.mkdir(currentPath);
      }
    }
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

    parameters.push('--export-format=binstl');
    parameters.push(`--enable=manifold`);
    parameters.push(`--enable=fast-csg`);
    parameters.push(`--enable=lazy-union`);

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

    const exportParams = [
      '--export-format=binstl',
      '--enable=manifold',
      '--enable=fast-csg',
      '--enable=lazy-union',
      '--enable=roof',
    ];

    const render = await this.executeOpenscad(
      data.code,
      data.fileType,
      parameters.concat(exportParams)
    );

    // Check `render.log.stdErr` for "Current top level object is not a 3d object."
    // and if it is, rerun it with exporting the preview as a SVG.
    if (
      render.log.stdErr.includes('Current top level object is not a 3D object.')
    ) {
      // Create the SVG, which will internally be saved as out.svg
      const svgExport = await this.executeOpenscad(
        data.code,
        'svg',
        parameters.concat([
          '--export-format=svg',
          '--enable=manifold',
          '--enable=fast-csg',
          '--enable=lazy-union',
          '--enable=roof',
        ])
      );

      if (svgExport.exitCode === 0) {
        return svgExport;
      }

      // If the SVG export failed, return the original error, but add the logs from the SVG export
      render.log.stdErr.push(...svgExport.log.stdErr);
      render.log.stdOut.push(...svgExport.log.stdOut);
    }

    return render;
  }

  async writeFile(data: FileSystemWorkerMessageData) {
    // XXX Because of a bug I haven't figured out yet, where OpenSCAD would throw
    // a number as an error, we cannot use a persistent instance of OpenSCAD. Instead,
    // we have to create a new instance every time we want to use OpenSCAD. That is
    // why the files are stored in this class, instead of written to the FS of OpenSCAD.

    this.files = this.files.filter((file) => file.name !== data.path);
    this.files.push(data.content);

    if (!data.content.path) {
      data.content.path = data.path;
    }

    return true; // TODO `boolean` might not be the best thing to return here
  }

  async readFile(
    data: FileSystemWorkerMessageData
  ): Promise<FileSystemWorkerMessageData> {
    const found = this.files.find((file) => file.name === data.path);

    return {
      path: data.path,
      content: found,
    };
  }

  async unlinkFile(data: FileSystemWorkerMessageData) {
    this.files = this.files.filter((file) => file.name !== data.path);

    return true; // TODO `boolean` might not be the best thing to return here
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
    const instance = await this.getInstance();

    // Write the code to a file
    instance.FS.writeFile(inputFile, code);

    const args = [inputFile, '-o', outputFile, ...parameters];
    let exitCode;
    let output;

    try {
      exitCode = instance.callMain(args);
    } catch (error) {
      throw new Error(
        'OpenSCAD exited with an error: ' +
          (error.message ? error.message : error)
      );
    }

    if (exitCode === 0) {
      try {
        output = instance.FS.readFile(outputFile);
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
