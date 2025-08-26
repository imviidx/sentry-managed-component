const fs = require('fs');
const path = require('path');

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

// Copy manifest.json to component directory
const sourceManifest = path.join(__dirname, 'manifest.json');
const destManifest = path.join(__dirname, 'components/sentry-managed-component/manifest.json');

if (fs.existsSync(sourceManifest)) {
  fs.copyFileSync(sourceManifest, destManifest);
  console.log('Copied manifest.json to component directory');
} else {
  console.warn('Warning: manifest.json not found in root directory');
}

console.log('Built component to components/sentry-managed-component/index.js');
