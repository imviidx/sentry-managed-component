require('esbuild').buildSync({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  format: 'esm',
  target: ['esnext'],
  tsconfig: 'tsconfig.build.json',
  outfile: 'components/sentry-managed-component/index.js',
});

console.log('Built component to components/sentry-managed-component/index.js');
