import { useEffect, useState } from 'react';

import { useFileSystemProvider } from '../components/FileSystemProvider';
import fonts from '../etc/fonts.json';
import libraries from '../etc/libraries.json';
import FileWithPath from '../lib/FileWithPath';
import fetcha from '../lib/fetcha';
import useUrlFileWriter from './useUrlFileWriter';

export default function useImport(url?: string, autoImport = false) {
  const { files, writeFiles } = useFileSystemProvider();
  const [isLoading, setIsLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<Error | null>();
  const { write } = useUrlFileWriter();

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

        const decoder = new TextDecoder('utf-8');
        const files = await fetcha(url);
        const importedLibraries: string[] = [];
        const importedFonts: string[] = [];

        const downloadedFiles = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(file.url);
            const content = await response.arrayBuffer();
            const name = file.name.split('?')[0]; // Strip possible query string from file name

            // Check if the file extension is missing from the file name. If so,
            // try to guess it from the content type.
            // TODO

            // If it is a scad file we can try to look if there are any libraries to import
            if (autoImport && name.endsWith('.scad')) {
              const script = decoder.decode(content);

              // Iterate through known libraries and check if they are used in the file
              for (const library of libraries) {
                if (
                  script.includes(library.name) &&
                  !importedLibraries.includes(library.name)
                ) {
                  // If the library is used, download it and add it to the files
                  await write(
                    library.url,
                    (fileName) =>
                      `libraries/${library.name + fileName.replace(library.trimFromStartPath, '')}`
                  );
                  importedLibraries.push(library.name);
                }
              }

              // Iterate through known fonts and check if they are used in the file
              for (const font of fonts) {
                for (const variant of font.variants || []) {
                  if (
                    script.includes(variant) &&
                    !importedFonts.includes(font.name)
                  ) {
                    // If the font is used, download it and add it to the files
                    await write(
                      font.url,
                      (fileName) =>
                        `fonts/${font.name + fileName.replace(font.trimFromStartPath, '')}`
                    );
                    importedFonts.push(font.name);
                  }
                }
              }
            }

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
