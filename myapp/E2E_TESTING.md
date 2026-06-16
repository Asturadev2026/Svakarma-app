# E2E tests — Login & Permissions (Playwright on Expo web)

Playwright drives a **browser**, and this app is React Native, so these tests run
against the app's **web build** (`expo start --web`). The backend is fully
**mocked** via request interception, so no API/DB needs to be running.

## One-time setup

```bash
cd myapp

# 1) Web build dependencies (versions matched to your Expo SDK):
npx expo install react-dom react-native-web @expo/metro-runtime

# 2) Playwright + its browser:
npm install          # installs @playwright/test (added to devDependencies)
npx playwright install chromium
```

## Run

Start the web build in one terminal:
```bash
npm run web          # serves at http://localhost:8081 (first bundle is slow)
```

Then in another terminal:
```bash
npm run test:e2e         # headless
npm run test:e2e:ui      # interactive UI mode (recommended while iterating)
```

(`playwright.config.js` will reuse the running web server, or start one itself
if none is up — the first start can take a couple of minutes to bundle.)

## What's covered (`e2e/auth.spec.js`)

**Login**
- Splash → "Get Started" → Login renders the phone entry.
- Enter phone → "Send OTP" → OTP screen shows the **DEMO MODE** banner and the
  code is auto-filled (from the mocked `devOtp`).
- "Verify & Proceed" routes to the Permissions screen.

**Permissions**
- The three cards (Location, Contacts, Notifications) + the Account-Aggregator
  privacy note + Continue button render.
- "Continue" proceeds to the Home dashboard ("Namaste,").

Mocked endpoints: `/auth/send-otp`, `/auth/verify-otp`, `/profile/check-onboarding`,
`/home/summary`, `/profile`, `/cibil`.

> Note: the tests don't toggle the permission switches, because tapping them calls
> native `expo-location` / `expo-contacts` / `expo-notifications` APIs that aren't
> meaningful on web. They verify the screen + the Continue flow instead.

## If the web build won't bundle

The app pulls in native-only modules. If `npm run web` errors while bundling,
the usual culprits and fixes:

- **`react-native-reanimated`** — ensure `babel.config.js` has
  `plugins: ['react-native-reanimated/plugin']` (must be last).
- **A native module throwing on import** (e.g. `expo-contacts`) — guard usage with
  `Platform.OS !== 'web'`, or lazy-import it inside the handler rather than at the
  top of the file.
- **Fonts/icons** — `@expo/vector-icons` renders on web but may show boxes until
  fonts load; this doesn't fail tests (we match by text, not icons).

If a specific screen blocks the web bundle, tell me which module errors and I'll
add the web guard.
