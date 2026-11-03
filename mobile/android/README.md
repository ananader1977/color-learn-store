# Color & Learn — Android

Open this folder in Android Studio (JDK 17+, SDK 36). Sync Gradle and Run.

Build a debug APK:
```bash
gradle assembleDebug
```
Output: `app/build/outputs/apk/debug/app-debug.apk`.

GitHub Actions workflow `Build Android APK` creates a downloadable **debug-signed APK** artifact. Debug APKs are only for internal testing; for direct distribution generate a release key and sign a release APK. For Google Play, build a signed AAB instead. Real payments in the store are not yet enabled.
