import { useEffect, useState } from 'react';

import fetcha, { FetchaFile } from '../lib/fetcha';

export default function useImport(url?: string) {
  const [files, setFiles] = useState<FetchaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<Error | null>();

  useEffect(() => {
    if (url) {
      (async () => {
        setIsLoading(true);

        try {
          const files = await fetcha(url);
          setFiles(files);
        } catch (err) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [url]);

  return { error, files, isLoading };
}
