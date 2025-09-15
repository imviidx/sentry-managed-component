# Sentry Managed Component Demo

This demo shows two scenarios:

## Pages

1. **index.html** (`/`) - With Sentry Pre-initialized

   - Sentry is initialized manually in the app
   - The managed component detects and manages the existing Sentry instance
   - Entry point: `src/main.tsx`

2. **without-sentry.html** (`/without-sentry`) - Without Sentry Pre-initialized
   - No Sentry initialization in the app
   - The managed component should initialize Sentry using the DSN from settings
   - Entry point: `src/main-no-sentry.tsx`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Start WebCM (in another terminal):

   ```bash
   npm run demo:webcm
   ```

4. Navigate between:
   - http://localhost:3000/ (with Sentry)
   - http://localhost:3000/without-sentry (without Sentry)

## Testing

- Use the consent controls to change permissions
- Click "Trigger Test Error" on the without-sentry page to verify Sentry initialization
- Check browser console for Sentry logs and managed component activity

## Package Notes

The demo uses a simple built-in fake Zaraz implementation. To use the official `@imviidx/fake-cloudflare-zaraz-consent` package, update:

1. Add to package.json: `"@imviidx/fake-cloudflare-zaraz-consent": "1.3.3"`
2. Update src/lib/zaraz.ts to import from the package
