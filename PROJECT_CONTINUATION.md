# Project Continuation Document

This document outlines the current state of the Svakarma mobile application to provide complete context for future development or AI assistance.

## 1. Current App Architecture
The app is built as a single-page React Native application using Expo SDK 54. It relies on `react-navigation` with a Native Stack for managing screen transitions. The current architecture separates concerns by placing screen components inside a dedicated `screens/` directory and utilizing standard React Hooks (`useState`, `useEffect`) for state management. Navigation is centralized in `App.js`. No backend integration exists yet; state and flows are handled locally.

## 2. Folder Structure
```text
myapp/
├── assets/                  # Images, fonts, and static assets (logo.png)
├── components/              # (Empty/Pending) Reusable UI components
├── constants/               # (Empty/Pending) App-wide constants, theme colors
├── navigation/              # (Empty/Pending) Nested navigators if needed
├── screens/                 # All screen components
│     ├── SplashScreen.js    # Initial loading/splash view
│     ├── LoginScreen.js     # Mobile number input screen
│     ├── OtpScreen.js       # OTP verification screen
│     └── PermissionsScreen.js # App permissions onboarding
├── services/                # (Empty/Pending) API clients and external services
├── App.js                   # Application entry point and navigation setup
├── app.json                 # Expo configuration
├── index.js                 # App registration
├── package.json             # Dependencies and scripts
└── PROJECT_CONTINUATION.md  # Project status document
```

## 3. Installed Packages
Key dependencies include:
* `expo`: ~54.0.33
* `react-native`: 0.81.5
* `@react-navigation/native`: ^7.2.4
* `@react-navigation/native-stack`: ^7.15.1
* `react-native-safe-area-context`: ~5.6.0
* `firebase`: ^12.13.0
* `react-native-gesture-handler`: ~2.28.0
* `react-native-reanimated`: ~4.1.1
* `@react-native-async-storage/async-storage`: 2.2.0

## 4. Current Authentication Flow
The application currently features a **mocked authentication flow**:
1. **Splash Screen**: Displays the brand logo/name for 2 seconds.
2. **Login Screen**: Prompts user for a 10-digit mobile number. Validates the length and enables the "Send OTP" button. Generates a local mock OTP (`123456`) and logs it to the terminal.
3. **OTP Screen**: Receives the mobile number via navigation parameters. Prompts for a 6-digit OTP. The user must enter `123456`. Provides a resend OTP timer (30s) and alerts for invalid entries. On success, navigates to Permissions.
4. **Permissions Screen**: Final onboarding step requesting Notification, Contact, and Location permissions. Currently has a mock "Allow & Continue" button.

## 5. What Has Been Completed
* Setup of basic Native Stack Navigation (`App.js`).
* UI Implementation of `SplashScreen`, `LoginScreen`, and `OtpScreen`.
* Functional mocked OTP verification flow.
* Implementation of `PermissionsScreen` featuring card-based UI.
* Applied a consistent, modern fintech design language across all developed screens.
* Keyboard management (`KeyboardAvoidingView`, `TouchableWithoutFeedback`).
* Validation states (disabled buttons, alerts).

## 6. Pending Features
* **Backend Integration**: Replace mock OTP generation/validation with real API calls (e.g., Firebase Auth or custom backend).
* **State Management**: Implement global state (Redux, Zustand, or Context API) to hold the authenticated user token.
* **Actual Permissions**: Link the `PermissionsScreen` to `expo-permissions` or standard React Native permission requests.
* **Main App Flow**: Create a Bottom Tab Navigator for the main app dashboard (Home, Transactions, Profile) to navigate to after the Permissions screen.
* **Component Refactoring**: Extract repetitive UI elements (e.g., Buttons, Inputs, Cards) into the `components/` folder for better maintainability.

## 7. Current UI Theme/Colors
* **Background**: Clean White (`#ffffff`) and Off-White (`#f9f9f9` for inputs/cards).
* **Primary Brand Color**: Red (`#e63946`) used for logos, primary buttons, and active states.
* **Disabled States**: Light Red (`#ffb3b8`) for inactive buttons.
* **Text**:
    * Primary: Dark Gray/Black (`#1a1a1a`)
    * Secondary/Subtitles: Medium Gray (`#666666`)
    * Placeholders/Hints: Light Gray (`#a0a0a0`)
* **Styling Characteristics**: 
    * Rounded corners (`borderRadius: 16`)
    * Subtle drop shadows for depth and elevation.
    * Spacious padding (`24px` standard container padding).

## 8. Navigation Flow
`Splash` -> (auto 2s) -> `Login` -> (Send OTP) -> `OTP` -> (Verify OTP) -> `Permissions` -> (Continue) -> *[Future: Main Dashboard]*

## 9. Important Implementation Decisions
* Used `react-native-safe-area-context` to ensure screens don't underlap notches or bottom bars.
* Avoided TypeScript to align with initial project requirements, relying on pure ES6+ JavaScript.
* `KeyboardAvoidingView` is used on input screens to prevent the keyboard from blocking the submit buttons.
* OTP is strictly checked against the hardcoded string `'123456'` to satisfy MVP demo requirements.
* Alerts (`Alert.alert`) are used for immediate feedback on invalid inputs instead of inline error messages to keep the UI clean.

## 10. Recommended Next Steps
1. Create a `HomeScreen.js` and set up the protected routes.
2. Introduce an authentication state context to dynamically switch between the Auth Stack (Login/OTP) and the Main Stack based on login status.
3. Replace `console.log` and mock logic in `handleSendOTP` with an actual network request.
4. Implement proper SVG icons (using `react-native-svg` or `react-native-vector-icons` which is already in `package.json`) instead of emoji fallbacks in the Permissions screen.
