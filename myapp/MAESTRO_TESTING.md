# Mobile E2E with Maestro (tests the real Expo app)

Unlike Playwright (browser only), **Maestro** drives the actual React Native app
on an emulator/device — so it tests Login *and* the Permissions screen exactly as
users see them. Flows are simple YAML.

## 1. Install Maestro

```bash
# macOS / Linux
curl -fsSL "https://get.maestro.mobile.dev" | bash
# Windows: use WSL, or see https://maestro.mobile.dev/getting-started/installing-maestro
maestro --version
```

## 2. Get the app running on a device/emulator

**Recommended — a development build** (gives the app its own package id
`com.svakarma.myapp`, which the flows launch directly):

```bash
cd myapp
npx expo run:android      # builds + installs a dev client on your emulator
# (or: eas build --profile development, then install)
```

**Quick alternative — Expo Go:** open the project in Expo Go manually, then run
the flows with the `launchApp`/`clearState` lines removed (Maestro will act on
whatever app is in the foreground). Expo Go's package is `host.exp.exponent`, but
launching it lands on Expo Go's home rather than your project — hence the dev
build is smoother.

## 3. Prerequisites for the flows

- **Backend running in mock mode** and reachable from the device (same setup you
  use now; emulator reaches your host via `10.0.2.2`).
- **Demo number `9999999999`** → backend returns OTP `123456`, which the OTP
  screen auto-fills. Deterministic, no real SMS.
- **Reaching the Permissions screen needs an *onboarded* number.** After OTP, the
  app routes an already-onboarded user straight to Permissions, but a brand-new
  number goes through onboarding first. So either:
  - run onboarding once for `9999999999` (then it lands on Permissions), or
  - point the flow at a number you've already onboarded.

  *(Heads-up: routing new users to onboarding and only showing Permissions to
  returning users is arguably backwards vs. the reference flow — say the word and
  I'll flip it so every new user sees Permissions first; that would also make this
  test fully deterministic.)*

## 4. Run the tests

```bash
cd myapp
maestro test .maestro/login.yaml          # login flow
maestro test .maestro/permissions.yaml    # permissions (runs login first)
maestro test .maestro                      # everything in the folder
```

Author/debug interactively:
```bash
maestro studio
```

## What the flows check

**`login.yaml`** — Splash → Get Started → Welcome → enter phone → Send OTP →
OTP screen shows the **DEMO MODE** banner with the code auto-filled → Verify &
Proceed → lands on "A few permissions".

**`permissions.yaml`** — reuses login, then asserts the Location / Contacts /
Notifications cards + the Account-Aggregator note, taps **Continue**, and asserts
the Home dashboard ("Namaste").

> The flows don't toggle the permission switches, since those fire native OS
> dialogs. Maestro *can* tap system dialogs (`- tapOn: "While using the app"`),
> but that's OS-version-specific; we verify the screen + Continue path instead.

## Troubleshooting

- **`launchApp` can't find the app** → the dev build isn't installed, or the id
  differs. Confirm with `adb shell pm list packages | grep svakarma`; it should
  show `com.svakarma.myapp`. (Changing `android.package` requires a rebuild.)
- **Stuck on OTP / "Invalid OTP"** → backend isn't reachable or not in mock mode.
  Verify `http://<host>:5000/health` from the device's browser.
- **Lands on onboarding instead of Permissions** → the test number isn't onboarded
  yet (see §3).
- **Text not found** → run `maestro studio` to inspect the live view hierarchy and
  copy exact labels.
