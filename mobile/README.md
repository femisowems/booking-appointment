# Booking Appointment - Mobile Application (Android)

This is the mobile client for the Booking Appointment System, built with **Ionic Angular** and **Capacitor**.

## Prerequisites

Before generating the Android app, ensure you have the following installed:

1.  **Node.js**: (v18+ Recommended)
2.  **Ionic CLI**:
    ```bash
    npm install -g @ionic/cli
    ```
3.  **Android Studio**: [Download here](https://developer.android.com/studio).
    *   Ensure "Android SDK", "Android SDK Platform-Tools", and "Android SDK Build-Tools" are installed via SDK Manager.
4.  **Java (JDK)**: v17 is commonly required for newer Android Gradle builds.

## Setup

1.  **Install Dependencies**:
    Navigate to the `mobile` directory and run:
    ```bash
    npm install
    ```

2.  **Build the Web Assets**:
    ```bash
    npm run build
    ```

## Android Development

### 1. Initialize Capacitor
If you haven't already initialized Capacitor or added the Android platform:

```bash
# Initialize Capacitor (if not done)
npx cap init "Booking App" com.example.bookingapp --web-dir=www

# Add Android Platform
npm install @capacitor/android
npx cap add android
```

### 2. Sync Project
Whenever you change `package.json` dependencies or rebuild the web assets, sync the changes to the Android native project:

```bash
npm run build
npx cap sync
```

### 3. Run on Emulator/Device

#### Option A: Open in Android Studio
This opens the native Android project. You can hit the "Run" (Play) button to launch it on an emulator or connected device.
```bash
npx cap open android
```

#### Option B: Live Reload (Recommended for Dev)
Run the app on a connected device/emulator with live reload enabled (changes in VS Code reflect instantly on the device).
```bash
ionic cap run android -l --external
```

## Building for Production (APK/AAB)

1.  **Prepare the Production Web Build**:
    ```bash
    # Update environment.prod.ts with your production API URL first!
    npm run build -- --configuration=production
    ```

2.  **Sync to Android**:
    ```bash
    npx cap sync android
    ```

3.  **Build APK in Android Studio**:
    *   Run `npx cap open android`.
    *   Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    *   Locate the APK in the `android/app/build/outputs/apk/debug/` (or release) folder.

## Troubleshooting

-   **"Capacitor not found"**: Ensure you ran `npm install`.
-   **Gradle Errors**: Check your JDK version. Run `java -version`. Android usually requires JDK 11 or 17.
-   **API Connection Issues**: On Android, `localhost` refers to the device itself.
    *   If running locally, your backend should be reachable via your computer's local IP (e.g., `192.168.x.x`).
    *   Use the Live Reload command (`ionic cap run android -l --external`) which helps proxy requests.
    *   For production, ensure `src/environments/environment.prod.ts` points to your https backend (e.g., Railway URL).
