import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import Layout from './components/Layout';
import OpenscadWorkerProvider from './components/OpenscadWorkerProvider';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <SnackbarProvider />
    <OpenscadWorkerProvider>
      <Layout title="OpenSCAD Web GUI">
        <App />
      </Layout>
    </OpenscadWorkerProvider>
  </React.StrictMode>
);

window.addEventListener('unhandledrejection', function (event) {
  enqueueSnackbar(event.reason.message, { variant: 'error' });
});

window.addEventListener('error', function (event) {
  enqueueSnackbar(event.message, { variant: 'error' });
});
