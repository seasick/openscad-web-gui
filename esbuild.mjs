/* eslint-env node */
import corsAnywhere from 'cors-anywhere';
import * as esbuild from 'esbuild';

import appBuildConfig from './esbuild.app.mjs';
import workerBuildConfig from './esbuild.worker.mjs';

if (process.argv?.length > 2) {
  const appOptions = {};
  const workerOptions = {};

  // Check if a cors-proxy should be started
  if (process.argv.includes('--cors-proxy')) {
    const host = process.env.CORS_HOST || '0.0.0.0';
    const port = process.env.CORS_PORT || 8888;

    corsAnywhere
      .createServer({
        originWhitelist: [], // Allow all origins
      })
      .listen(port, host, function () {
        console.log('Running CORS Anywhere on ' + host + ':' + port);
      });

    appOptions.corsProxyUrl = `http://${host}:${port}/`;
  }

  const appCtx = await esbuild.context(appBuildConfig(appOptions));
  const workerCtx = await esbuild.context(workerBuildConfig(workerOptions));

  if (process.argv.includes('--watch')) {
    await appCtx.watch();
    await workerCtx.watch();
  }
  if (process.argv.includes('--serve')) {
    await appCtx.serve({
      servedir: 'dist',
    });
  }
} else {
  await esbuild.build(appBuildConfig);
  await esbuild.build(workerBuildConfig);
}
