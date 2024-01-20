import { Alert, AlertTitle } from '@mui/material';
import React from 'react';

type Props = {
  error: Error;
};

export default function ErrorBox({ error }: Props) {
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      The following error happened while importing the file. You could try to
      reload the page and try again. If the error persists, please report it on{' '}
      <a href="__GITHUB_ISSUE_URL" target="_blank">
        GitHub
      </a>
      .<pre>{error.message}</pre>
      <details>
        <summary>Stack trace</summary>
        <pre>{error.stack}</pre>
      </details>
    </Alert>
  );
}
