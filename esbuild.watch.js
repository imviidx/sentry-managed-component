const esbuild = require('esbuild');

console.log('[esbuild] Starting watch mode for src/ files...');
console.log('[esbuild] Output: components/sentry-managed-component/index.js');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  format: 'esm',
  target: ['esnext'],
  tsconfig: 'tsconfig.build.json',
  outfile: 'components/sentry-managed-component/index.js',
  watch: {
    onRebuild(error, result) {
      if (error) {
        console.error('[esbuild] Build failed:', error);
      } else {
        console.log('[esbuild] Rebuilt successfully');
      }
    },
  },
}).then(() => {
  console.log('[esbuild] Initial build complete, watching for changes...');
}).catch(err => {
  console.error('[esbuild] Build failed:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[esbuild] Shutting down watch mode...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[esbuild] Shutting down watch mode...');
  process.exit(0);
});
