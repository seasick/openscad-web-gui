import { useEffect, useState } from 'react';

import { useFileSystemProvider } from '../components/FileSystemProvider';
import FileWithPath from '../lib/FileWithPath';
import fetcha from '../lib/fetcha';

export default function useImport(url?: string) {
  const { files, writeFiles } = useFileSystemProvider();
  const [isLoading, setIsLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<Error | null>();

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        if (!url) {
          await writeFiles([
            new FileWithPath(['cube([10, 10, 10]);'], 'cube.scad'),
          ]);
          return;
        }

        // Check if we have it already in our cache
        // TODO

        const files = await fetcha(url);
        const downloadedFiles = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(file.url);
            const content = await response.arrayBuffer();
            const name = file.name.split('?')[0]; // Strip possible query string from file name

            // Check if the file extension is missing from the file name. If so,
            // try to guess it from the content type.
            // TODO

            return new FileWithPath([content], name, {
              path: name,
            });
          })
        );

        await writeFiles(downloadedFiles);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [url]);

  return { error, files, isLoading };
}
