import { BlobReader, Uint8ArrayWriter, ZipReader } from '@zip.js/zip.js';
import { useState } from 'react';

import { useFileSystemProvider } from '../components/providers/FileSystemProvider';
import WorkspaceFile from '../lib/WorkspaceFile';

export default function useUrlFileWriter() {
  const [isLoading, setIsLoading] = useState(false);
  const { writeFiles } = useFileSystemProvider();

  const write = async (
    url: string,
    fileNameDecorator?: (fileName: string) => string,
    filter?: (fileName: string) => boolean
  ) => {
    setIsLoading(true);

    const response = await fetch('__CORSPROXY' + url);

    if (response.headers.get('Content-Type') === 'application/zip') {
      // Unzip the file
      const zip = await response.blob();
      const files = await new ZipReader(new BlobReader(zip)).getEntries();

      // Libraries should go into the library folder
      const movedFiles = await Promise.all(
        files
          // We don't want any directories, they are included in the filename anyway
          .filter((f) => f.directory === false)

          // Apply custom filter
          .filter((f) => !filter || filter(f.filename))

          // Collect all files into an WorkspaceFile array
          .map(async (f) => {
            const writer = new Uint8ArrayWriter();
            const fileName = fileNameDecorator
              ? fileNameDecorator(f.filename)
              : f.filename;
            const name = fileName.split('/').pop();

            return new WorkspaceFile([await f.getData(writer)], name, {
              lastModified: f.lastModDate.getTime(),
              path: fileName,
            }) as WorkspaceFile;
          })
      );

      await writeFiles(movedFiles);
    } else {
      // We are downloading a single file
      const file = await response.blob();
      const fileName = fileNameDecorator
        ? fileNameDecorator(url)
        : url.split('/').pop();

      await writeFiles([
        new WorkspaceFile([file], fileName, {
          lastModified: new Date().getTime(),
          path: fileName,
        }),
      ]);
    }

    setIsLoading(false);
  };

  return { write, isLoading };
}
