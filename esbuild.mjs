/* eslint-env node */
import * as esbuild from 'esbuild';

import appBuildConfig from './esbuild.app.mjs';
import workerBuildConfig from './esbuild.worker.mjs';

if (process.argv?.length > 2) {
  const appCtx = await esbuild.context(appBuildConfig);
  const workerCtx = await esbuild.context(workerBuildConfig);

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
