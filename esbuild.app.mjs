/* eslint-env node */
import { copy } from 'esbuild-plugin-copy';
import { replace } from 'esbuild-plugin-replace';

export default {
  entryPoints: ['src/index.tsx', 'src/index.html'],
  bundle: true,
  outdir: 'dist',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  target: 'es2022',
  logLevel: 'info',
  loader: {
    '.html': 'copy',
    '.woff': 'file',
    '.woff2': 'file',
    '.3mf': 'copy',
  },
  plugins: [
    copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
      resolveFrom: 'cwd',
      assets: {
        from: ['./public/*.png', './public/*.ico', './public/*.webmanifest'],
        to: ['./dist'],
      },
      watch: true,
    }),
    replace({
      __TRACKER_SNIPPET: process.env.TRACKER_SNIPPET || '',
      __GITHUB_ISSUE_URL: process.env.GH_ISSUE_URL || '',
      __GITHUB_REPO_URL: process.env.GH_REPO_URL || '',
    }),
  ],
};
