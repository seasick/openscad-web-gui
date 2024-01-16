import React, { useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';

import fetcha, { FetchaFile } from '../lib/fetcha';

type Props = {
  error?: string;
};

type LoaderData = {
  ok: boolean;
  error?: string;
  files: FetchaFile[];
};

export default function Import({ error }: Props) {
  const result = useLoaderData() as LoaderData;
  const [file, setFile] = React.useState<FetchaFile | null>(
    result.files?.length && result.files?.length > 1 ? null : result.files[0]
  );
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (file !== null) {
        // Download the file
        const request = await fetch(file!.url);

        const arrayBuffer = await request.arrayBuffer();

        navigate('/editor', {
          state: {
            file: new File([arrayBuffer], file.url),
          },
        });
      }
    })();
  }, [file, result]);

  if (error) {
    return <div>{error}</div>;
  }
  if (result.error) {
    return <div>{result.error}</div>;
  }

  // If we have no results, we need to ask the user to provide a valid URL
  if (!result || result.files?.length === 0) {
    return <div>No scad files found at the provided URL</div>;
  }

  console.log(result);

  // If we have more then one result, we need to ask the user which one they want to use
  return (
    <div>
      <h3>Multiple scad files found at the provided URL</h3>
      <h4>Please select one of them</h4>
      <ul>
        {result.files?.map((r) => (
          <li
            key={r.url}
            onClick={(e) => {
              e.preventDefault();
              setFile(r);
            }}
          >
            {r.url}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const urlParam = url.searchParams.get('url');

  if (!urlParam) {
    return {
      error: 'No url parameter provided to import',
      files: [],
      ok: false,
    };
  }

  // Check if the urlParam is a valid URL
  try {
    new URL(urlParam || '');
  } catch (e) {
    return {
      error: "Url doesn't seem to be valid: " + e.message,
      files: [],
      ok: false,
    };
  }

  const result = await fetcha(urlParam || '');

  return {
    ok: true,
    files: result,
  };
}
