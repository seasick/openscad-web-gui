/* eslint-env node */

export default {
  entryPoints: ['src/openSCADWorker.mts'],
  bundle: true,
  outdir: 'dist',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  target: 'es2022',
  format: 'esm',
  logLevel: 'info',
};
