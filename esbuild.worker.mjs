/* eslint-env node */
import { copy } from 'esbuild-plugin-copy';

export default (opt_options) => ({
  entryPoints: ['src/openSCADWorker.mts'],
  bundle: true,
  outdir: 'dist',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  target: 'es2022',
  format: 'esm',
  logLevel: 'info',
  plugins: [
    copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
      resolveFrom: 'cwd',
      assets: {
        from: ['./src/vendor/openscad-wasm/*'],
        to: ['./dist'],
      },
      watch: true,
    }),
  ],
});
