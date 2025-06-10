# React Native Vision Camera Barcode Scanner App

A React Native app with **react-native-vision-camera** and **frame processors** for PDF417 barcode scanning using ML Kit.

## 🚀 Quick Start

### Prerequisites
- React Native development environment set up
- Android device or emulator

### Installation
```bash
git clone <repository>
cd BarcodeScannerApp
npm install
npm run android
```

## 📱 App Features

### PDF417 Barcode Scanning
- **Real-time scanning** using frame processors
- **ML Kit integration** for robust barcode detection  
- **Multiple barcode format support** (PDF417, QR codes, UPC, etc.)
- **Optimized for driver's licenses and ID cards**

### Technical Implementation
- **Custom ML Kit module** (`MLKitBarcodeScannerModule.java`)
- **Frame processors** via `react-native-worklets-core`
- **Advanced camera configuration** with high-resolution support
- **Cross-platform compatibility** (Android focus)

## 🔧 Build Configuration

### Key Dependencies
- **react-native**: 0.74.3
- **react-native-vision-camera**: 4.5.3  
- **react-native-worklets-core**: 1.4.0
- **vision-camera-cropper**: 1.3.1
- **ML Kit Barcode Scanning**: 17.3.0

### Camera Permissions
The app requires camera permissions. These are configured in:
- `android/app/src/main/AndroidManifest.xml`
- `ios/BarcodeScannerApp/Info.plist`

## 📚 Technical Details

### Architecture
- **Native ML Kit Integration**: Direct Android ML Kit usage for optimal performance
- **Frame Processing**: Real-time camera frame analysis using worklets
- **Cross-thread Communication**: Safe data transfer between native and JS threads

### Performance Optimizations
- **High-resolution camera formats**: Automatic selection of optimal camera settings
- **Efficient frame processing**: YUV pixel format for better performance  
- **Multi-architecture support**: arm64-v8a, armeabi-v7a, x86, x86_64

## 🛠️ Installation & Testing

### Install on Device
```bash
# Install the release APK
adb install -r BarcodeScannerApp-Release-v2.apk
```

### Test Features
1. **Launch the app** - "PDF417 Scanner"
2. **Grant camera permission** when prompted
3. **Point camera at barcodes** - supports PDF417, QR codes, and more
4. **Real-time detection** with frame processor integration

---

*Last updated: June 10, 2025*  
*Successfully built and tested with React Native 0.74.3*

### Prerequisites
- React Native development environment set up
- Android device or emulator

### Installation
```bash
git clone <repository>
cd BarcodeScannerApp
npm install
npm run android
```

### Camera Permissions
The app requires camera permissions. These are already configured in:
- `android/app/src/main/AndroidManifest.xml`
- `ios/BarcodeScannerApp/Info.plist`

## 📱 App Features

### PDF417 Barcode Scanning
- **Real-time scanning** using frame processors
- **ML Kit integration** for robust barcode detection  
- **Multiple image enhancement** algorithms for difficult barcodes
- **Progressive scanning** (high contrast → enhanced → original)
- **Debug logging** to device storage for troubleshooting

### Technical Implementation
- **Custom ML Kit module** (`MLKitBarcodeScannerModule.java`)
- **Frame processors** via `react-native-worklets-core`
- **Base64 frame processing** with orientation handling
- **Bitmap enhancement** for better PDF417 detection

## 🔧 Debug Information

### Log Files Location
Debug logs are saved to device storage:
- **Path**: `/Android/data/com.barcodescannerapp/files/mlkit_scanner_logs.txt`
- **Images**: Test frames saved as `test_frame_*.jpg` in same directory

### Console Output
When running, check Metro logs for:
```
[VisionCamera] VisionCamera_enableFrameProcessors is set to true!
[VisionCamera] react-native-worklets-core found, Frame Processors are enabled!
VisionCamera: Frame Processors: ON!
VisionCamera: Linking react-native-worklets...
VisionCamera: Added worklets library for arm64-v8a
🎯 Frame processing working correctly
```

## ⚠️ Common Issues

### Build Still Fails After Patch?
1. **Verify patch applied**: Check `node_modules/react-native-vision-camera/android/CMakeLists.txt` contains the changes
2. **Clean everything**: `rm -rf node_modules android/.gradle android/app/build`
3. **Reinstall**: `npm install`
4. **Try clean build**: `cd android && ./gradlew clean && cd .. && npm run android`

### Frame Processors Not Working?
1. **Check gradle.properties**: Ensure `VisionCamera_enableFrameProcessors=true`
2. **Verify worklet directive**: Ensure `'worklet';` is first line in frame processor
3. **Check dependencies**: Ensure all dependencies in `useFrameProcessor` are correct

### No Barcodes Detected?
1. **Test with online generator**: Use a PDF417 generator to create test barcodes
2. **Check lighting**: Ensure good lighting conditions
3. **Try different angles**: Frame orientation affects detection
4. **Check logs**: Look for processing errors in device logs

## 📚 Technical Details

### Why This Fix Works
The original issue was a **CMake linking race condition** where:
1. `react-native-worklets-core` builds and generates `librnworklets.so`
2. `react-native-vision-camera` tries to link but can't find worklets symbols
3. The prefab configuration doesn't properly expose the library

Our patch:
1. **Explicitly finds** the worklets library file
2. **Links it directly** before relying on prefab
3. **Adds include paths** for headers
4. **Ensures deterministic build order**

### Architecture Support
The fix works for all Android architectures:
- `arm64-v8a` (64-bit ARM)
- `armeabi-v7a` (32-bit ARM) 
- `x86` (32-bit Intel)
- `x86_64` (64-bit Intel)

---

*Last updated: June 10, 2025*  
*Build fix verified and tested on React Native 0.74.3*
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## 🎯 Project Features

### Barcode Scanner with ML Kit
- **Frame processors enabled** for real-time barcode scanning
- **PDF417 barcode support** with ML Kit integration
- **Cross-platform compatibility** (Android/iOS)
- **Debug logging** with file output for troubleshooting

### Key Components
- `MLKitBarcodeScannerModule.java` - Native Android module for ML Kit integration
- Frame processor support via `react-native-worklets-core`
- Vision camera integration for camera access

## 🔧 Troubleshooting Common Issues

### Build Failures
If you encounter build issues, refer to the **Build Issues Resolution** section above.

### Camera Permissions
Make sure to add camera permissions to your app:

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

**iOS** (`ios/BarcodeScannerApp/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan barcodes</string>
```

### Debug Logs
The app creates debug logs at:
- **Android**: `/storage/emulated/0/Android/data/com.barcodescannerapp/files/mlkit_scanner_logs.txt`
- Check device logs for the exact path

## Congratulations! :tada:

You've successfully run and modified your React Native Barcode Scanner App. :partying_face:

### Next Steps

- Customize barcode formats in `MLKitBarcodeScannerModule.java`
- Add UI components for barcode scanning
- Implement error handling and user feedback
- Test with different barcode types

## 📚 Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [React Native Vision Camera](https://react-native-vision-camera.com/) - official documentation for vision camera
- [React Native Worklets Core](https://github.com/margelo/react-native-worklets-core) - worklets documentation
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## 🐛 Known Issues & Solutions

### Issue: "undefined symbol: RNWorklet::JsiWorkletContext"
**Solution**: Follow the build resolution steps above - this is a version compatibility issue.

### Issue: Patch-package fails
**Solution**: Remove corrupted patches and ensure compatible dependency versions.

### Issue: Frame processors not working
**Solution**: 
1. Ensure `VisionCamera_enableFrameProcessors=true` in `gradle.properties`
2. Add `'worklet';` directive as first line in frame processor functions
3. Use compatible versions listed above

### Issue: ML Kit not detecting barcodes
**Solution**:
1. Check camera permissions
2. Verify image quality and lighting
3. Check debug logs in device storage
4. Test with different barcode formats
5. Try higher resolution camera formats (see Camera Configuration below)

## 📹 Camera Configuration & Performance

The app automatically selects the highest resolution camera format available. Based on testing:

### Available Camera Formats
Your device supports multiple formats ranging from:
- **Highest**: 4080x3072 @ 15-60fps (photo), 4032x3024 (video)
- **Selected**: 1280x720 @ 15-30fps (current selection for performance)
- **Auto-focus**: Contrast detection with field of view 83.2°

### Frame Processing Performance
- **Processing time**: ~80ms per frame
- **Frame rate**: 15-30 FPS depending on lighting
- **Pixel format**: YUV for optimal processing

### Debug Information
When the app is running, check Metro logs for:
```
🔍 DEBUG: Available formats for device 0: [list of formats]
🔍 DEBUG: Selected format: {format details}
Selected Camera Format: WIDTHxHEIGHT @ MIN-MAX FPS
🎯 Frame data length: [bytes]
🎯 Frame dimensions: WIDTH x HEIGHT
🎯 Frame orientation: [landscape-right/portrait/etc]
🎯 Processing time: [ms] ms
🎯 Barcode Scan Result: [result]
```

### Optimizing for Better Detection
If barcodes aren't being detected:
1. **Try higher resolution**: Modify camera format selection in `App.tsx`
2. **Improve lighting**: Ensure good lighting conditions
3. **Check barcode quality**: Test with clear, high-contrast barcodes
4. **Verify orientation**: Frame orientation affects ML Kit processing

---

*Last updated: June 10, 2025*
*Build resolution verified with React Native 0.74.3*

This section details the process of integrating `react-native-vision-camera` with `react-native-vision-camera-barcodes-scanner` and `react-native-worklets-core` to achieve functional barcode scanning in this application, specifically targeting PDF417 barcodes.

## Initial Challenge & Symptoms

The primary challenge was getting the frame processor function, used by `react-native-vision-camera`, to be correctly transformed into a "worklet" by `react-native-worklets-core`. Worklets are JavaScript functions that can be run on a separate thread, which is essential for performance-intensive tasks like real-time image analysis from a camera feed.

Initial symptoms included:
1.  **Application Crash:** The Android application would crash on startup or when the camera component was mounted, with an error message similar to: `Compiling JS failed: 1:1:invalid empty parentheses ( )`. This cryptic error often indicates a problem in the Babel transformation pipeline, specifically related to worklet generation.
2.  **Worklet Properties Undefined:** When the crash didn't occur (e.g., after some initial fixes or with simpler configurations), the `frameProcessor` function, whether defined inline as an arrow function or as a separate named function, would lack the internal properties `__workletHash` and `__initData` (or these properties would be `undefined`). These properties are injected by the `react-native-worklets-core` Babel plugin when a function is successfully transformed into a worklet. Their absence meant the frame processor was not being recognized or executed as a worklet, leading to either errors or non-functional barcode scanning.

## Core Solution: Enabling Worklet Transformation

The root cause of the transformation failure was traced to missing or incorrect setup for `react-native-worklets-core`.

### Step 1: Babel Plugin Installation & Configuration

-   **Problem:** The `react-native-worklets-core/plugin` Babel plugin, which is responsible for transforming functions marked with `'worklet';` into actual worklets, was not included in the project's Babel configuration.
-   **Action:** The plugin was added to the `plugins` array in `babel.config.js`:
    ```javascript
    // babel.config.js
    module.exports = {
      presets: ['module:@react-native/babel-preset'],
      plugins: [
        'react-native-worklets-core/plugin', // This line was added
      ],
    };
    ```
-   **Result:** Adding the plugin resolved the immediate "invalid empty parentheses `( )`" crash. However, inline arrow functions used as frame processors still weren't being transformed correctly in all scenarios initially, necessitating further investigation into their implementation.

## Debugging the Frame Processor Transformation

Even with the Babel plugin in place, ensuring the frame processor function itself is correctly defined and its dependencies managed is crucial.

### Step 2: Isolating the Transformation Issue

To understand why inline arrow functions might not be transforming, several experiments were conducted:
-   A very simple inline arrow function was used for the `frameProcessor` prop.
-   A top-level named function (e.g., `function myFrameProcessor(frame) { 'worklet'; /* ... */ }`) was defined in `App.tsx` and passed to `useFrameProcessor`.

**Observation:** Top-level named functions *were* correctly transformed by Babel (they possessed the `__workletHash` and `__initData` properties when inspected). This narrowed down the problem to how inline arrow functions were being declared or utilized within the React component, especially in conjunction with React hooks like `useFrameProcessor` and `useCallback`.

### Step 3: Correctly Implementing the Inline Frame Processor

The key to getting inline arrow functions to transform correctly involved two main aspects:

1.  **The `'worklet';` Directive:**
    -   It is absolutely critical that the `'worklet';` directive is the **very first statement** within the frame processor function's body. No comments, `console.log` statements, or any other code can precede it.
    ```javascript
    // App.tsx - Correct placement of 'worklet';
    const frameProcessor = useFrameProcessor((frame: Frame) => {
      'worklet'; // MUST be the first line
      // ... rest of the frame processing logic
      try {
        const detectedBarcodes = scanBarcodes(frame);
        if (detectedBarcodes && detectedBarcodes.length > 0) {
          onBarcodeDetectedOnJsSide(detectedBarcodes);
        }
      } catch (e: any) {
        console.error('[App Worklet] Error in frame processor:', e.message);
      }
    }, [/* dependencies */]);
    ```

2.  **`useFrameProcessor` Hook Dependencies:**
    -   The `useFrameProcessor` hook from `react-native-vision-camera` memoizes the frame processor function. If this function relies on any props, state, or other functions from the component's scope, these **must** be included in its dependency array.
    -   In this application, the frame processor calls `scanBarcodes` (obtained from `useBarcodeScanner`) and `onBarcodeDetectedOnJsSide` (a callback to send results to the JS thread).
    -   **Action:** `scanBarcodes` and `onBarcodeDetectedOnJsSide` were added to the dependency array of `useFrameProcessor`.
        ```javascript
        // App.tsx
        const { scanBarcodes } = useBarcodeScanner(/* ... */);
        const onBarcodeDetectedOnJsSide = useRunOnJS(useCallback((barcodes: Barcode[]) => { /* ... */ }, []));

        const frameProcessor = useFrameProcessor((frame: Frame) => {
          'worklet';
          // ...
          const detectedBarcodes = scanBarcodes(frame); // Uses scanBarcodes
          if (detectedBarcodes && detectedBarcodes.length > 0) {
            onBarcodeDetectedOnJsSide(detectedBarcodes); // Uses onBarcodeDetectedOnJsSide
          }
          // ...
        }, [scanBarcodes, onBarcodeDetectedOnJsSide]); // Correct dependencies
        ```
    -   **`useRunOnJS` and `useCallback`:**
        -   `onBarcodeDetectedOnJsSide` is wrapped with `useRunOnJS` from `react-native-worklets-core`. This is necessary to safely call a JS thread function from the worklet thread (where the frame processor executes).
        -   The function passed to `useRunOnJS` is itself wrapped in `useCallback` to ensure it has a stable reference, preventing unnecessary re-creations of the worklet and re-renders. The dependency array of this `useCallback` should include anything it closes over from the JS scope.

-   **Result:** With the `'worklet';` directive correctly placed and all dependencies accurately listed for `useFrameProcessor` (and its constituent callbacks like `onBarcodeDetectedOnJsSide`), the inline arrow function for the frame processor was finally and reliably transformed into a worklet by Babel.

## Interfacing with the Barcode Scanner Library

Once the worklet transformation was stable, the next step was to correctly use `react-native-vision-camera-barcodes-scanner`.

### Step 4: Type Definitions for `react-native-vision-camera-barcodes-scanner`

-   **Problem:** The project encountered TypeScript errors. This was often due to a mismatch between the assumed or auto-generated types for the barcode scanner library and its actual API (e.g., expecting `barcode.value` when the library provided `barcode.rawValue`).
-   **Solution:** A custom type definition file was created at `src/types/react-native-vision-camera-barcodes-scanner.d.ts`.
-   **Action:** This file was populated with the official type definitions (or types inferred from runtime `console.log`s of the `Barcode` objects if official ones were initially unclear). Key definitions included:
    ```typescript
    // src/types/react-native-vision-camera-barcodes-scanner.d.ts
    declare module 'react-native-vision-camera-barcodes-scanner' {
      import type { Frame } from 'react-native-vision-camera';

      export type BarcodeFormat = 'code_128' | 'code_39' | 'code_93' | 'codabar' | 'data_matrix' | 'ean_13' | 'ean_8' | 'itf' | 'qr_code' | 'upc_a' | 'upc_e' | 'pdf_417' | 'aztec'; // Add other formats as needed

      export interface Barcode {
        displayValue?: string;
        rawValue?: string; // Ensured rawValue was present
        format: BarcodeFormat;
        // Add other properties like cornerPoints, boundingBox as observed or defined by the library
      }

      export interface ScanBarcodeOptions {
        barcodeTypes?: BarcodeFormat[]; // Or specific string literals like ('pdf_417')[]
        // Add other options if the library supports them
      }

      export function scanBarcodes(frame: Frame, options?: ScanBarcodeOptions): Barcode[];
      export function useBarcodeScanner(options?: ScanBarcodeOptions): {
        scanBarcodes: (frame: Frame) => Barcode[];
      };
    }
    ```
    This ensured that the TypeScript compiler understood the shape of the `Barcode` objects and the options for `useBarcodeScanner`.

### Step 5: Configuring `useBarcodeScanner` and Accessing Data

-   **Action (Scanner Configuration):** `useBarcodeScanner` was configured to specifically look for `['pdf_417']` barcodes, as this was the initial target.
    ```javascript
    // App.tsx
    const scannerOptions: ScanBarcodeOptions = ['pdf_417']; // Using the type
    const { scanBarcodes } = useBarcodeScanner({
      barcodeTypes: scannerOptions,
    });
    ```
-   **Action (Data Access):** The detected barcode's string value was accessed using `barcodes[0].rawValue` within the `onBarcodeDetectedOnJsSide` callback, aligning with the updated and correct type definitions.
    ```javascript
    // App.tsx
    const onBarcodeDetectedOnJsSide = useRunOnJS(useCallback((barcodes: Barcode[]) => {
      if (barcodes.length > 0 && barcodes[0].rawValue) {
        console.log('[App JS] PDF417 Barcode raw value:', barcodes[0].rawValue);
        setBarcodeValue(barcodes[0].rawValue); // Using rawValue
      }
    }, []), []);
    ```

## ongoing work here

While online-generated PDF417 barcodes scanned relatively easily, physical PDF417 barcodes on driver's licenses proved more challenging. This often requires better image quality and processing.

### Step 6: Camera Configuration - Resolution and FPS

-   **Observation:** Default camera settings were not always sufficient for the small, dense PDF417 barcodes on licenses.
-   **Hypothesis:** Increasing the camera's input resolution to the frame processor and ensuring an adequate frame rate (FPS) could improve scanning robustness.
-   **Action (Initial Investigation & Logging):** To understand the camera's capabilities, `console.log` statements were added in `App.tsx`'s `useEffect` hook (specifically when the `device` object becomes available). This log listed all `device.formats` and these were then sorted by resolution (`photoWidth * photoHeight`) to identify the highest-resolution options.
    ```javascript
    // App.tsx
    useEffect(() => {
      if (device) {
        console.log("[App] Camera device found. Available formats:", device.formats);
        const sortedFormats = [...device.formats].sort((a, b) => (b.photoWidth * b.photoHeight) - (a.photoWidth * a.photoHeight));
        console.log("[App] Sorted Formats (highest resolution first):", sortedFormats);
      } else {
        console.warn("[App] No camera device found!");
      }
    }, [device]);
    ```
-   **Action (Camera Props):** The `<Camera>` component was updated with a `pixelFormat="yuv"` prop, which is often recommended for frame processing tasks as it provides raw pixel data in an efficient format.
    ```tsx
    // App.tsx
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      pixelFormat="yuv" // Added for optimal frame processing
      // format={selectedFormat} // To be set based on logs
      // fps={targetFps} // To be set based on format capabilities
    />
    ```
-   **Next Steps (Mentioned for Future Optimization):**
    *   Based on the console logs of `device.formats`, a specific high-resolution `format` object would be chosen and passed to the `format` prop of the `<Camera>` component.
    *   The `fps` prop would be set to a value supported by the chosen format (e.g., 30 or 60, if available at the desired resolution). This often involves inspecting the `format.frameRateRanges` for the selected format.

## Summary of Key Libraries & Their Roles

-   **`react-native-vision-camera`:** The core library providing access to the device camera and the mechanism for attaching a frame processor to the camera's video stream.
-   **`react-native-vision-camera-barcodes-scanner`:** A plugin for `react-native-vision-camera`. It exposes the `useBarcodeScanner` hook, which provides the `scanBarcodes` function. This function, when called within a frame processor worklet, analyzes the camera frame for barcodes.
-   **`react-native-worklets-core`:** This library is the magic behind running JavaScript code (worklets) on a separate, high-priority thread. This is crucial for the `scanBarcodes` function to operate without freezing the UI. Its Babel plugin (`react-native-worklets-core/plugin`) is responsible for the actual transformation of functions marked with `'worklet';` into executable worklet objects. The `useRunOnJS` hook is also provided by this library to safely communicate results from a worklet back to the main JS thread.

By following these steps, the application successfully implemented barcode scanning, addressing both the initial worklet transformation issues and the subsequent type-related and data handling challenges. Further optimization for specific barcode types like those on licenses involves fine-tuning camera resolution and FPS settings.

## Key Package Versions

The following versions of key packages were used in this integration:

-   **React:** `18.2.0`
-   **React Native:** `0.74.3`
-   **React Native Vision Camera:** `^4.5.2`
-   **React Native Vision Camera Barcodes Scanner:** `^2.0.1` (later uninstalled in favor of a custom ML Kit solution)
-   **React Native Worklets Core:** `^1.3.3`

## Transition to Custom ML Kit Module for PDF417 Scanning

Despite the setup above, reliable scanning of PDF417 barcodes, especially from driver's licenses, remained a challenge with `react-native-vision-camera-barcodes-scanner`.
To address this, a custom native Android module (`MLKitBarcodeScannerModule.java`) was developed, leveraging Google's ML Kit directly for more robust barcode detection.

### Native Module and Frame Processing Adjustments:

1.  **`MLKitBarcodeScannerModule.java` & `MLKitBarcodeScannerPackage.java`:** Created to house the ML Kit barcode scanning logic.
2.  **`MainApplication.kt`:** Registered the new native package.
3.  **`android/app/build.gradle`:** Added the `com.google.mlkit:barcode-scanning:17.3.0` dependency.
4.  **`App.tsx` Modifications:**
    *   Installed `vision-camera-cropper` to prepare frame data for the native module.
    *   The `frameProcessor` was updated to call `MLKitBarcodeScanner.processFrame(frameData, frame.width, frame.height, frame.orientation)`.
    *   `frameData` is a base64 encoded string of the cropped frame, obtained using `crop(frame, cropRegion, { format: 'base64' })` from `vision-camera-cropper`.
    *   The native module handles decoding the base64 string, creating an `InputImage` (initially from `ByteBuffer`, later from `Bitmap` for better orientation handling), and processing it with ML Kit's `BarcodeScanner`.
5.  **Orientation Handling:** Significant effort was invested in correctly handling frame orientation between the `Frame` object from `react-native-vision-camera` and the `InputImage` for ML Kit. This involved passing `frame.orientation` to the native module and converting it to ML Kit's `IMAGE_ROTATION_*` constants.
6.  **File Logging:** Implemented in `MLKitBarcodeScannerModule.java` to write logs to `mlkit_scanner_logs.txt` on the device for easier debugging of the native code.

### Build System Struggles & Linker Errors:

A major hurdle during this phase was persistent C++/CMake linking errors between `react-native-vision-camera` and `react-native-worklets-core`. These errors often manifested as `undefined reference to` symbols related to `RNWorklet::Worklet` or JSI bindings.

**Resolution Steps for Linker Errors (Iterative Process):**

1.  **Thorough Cleaning:** Multiple rounds of `./gradlew clean`, deleting `node_modules`, `android/.gradle`, `android/app/build`, and reinstalling dependencies (`yarn install`).
2.  **Gradle File Adjustments:**
    *   Uninstalled `react-native-vision-camera-barcodes-scanner` as it was no longer used.
    *   Explicitly added `implementation project(':react-native-vision-camera')` in `android/app/build.gradle` (though this should typically be auto-linked).
    *   Corrected a path in `deleteCmakeCache` task within `react-native-vision-camera/android/build.gradle`.
3.  **CMakeLists.txt Modifications (Directly in `node_modules` initially, then via `patch-package`):
    *   **`react-native-vision-camera/android/CMakeLists.txt`:**
        *   Added `set(ENABLE_FRAME_PROCESSORS ON)` near the top to explicitly enable frame processor support, as this seemed to be a point of contention.
        *   Experimented with `target_link_libraries` to ensure `react-native-worklets-core::rnworklets` was correctly linked.
    *   **`react-native-worklets-core/android/CMakeLists.txt`:**
        *   Standardized `target_link_libraries` calls and ensured JSI bindings were correctly exposed.
4.  **`patch-package`:**
    *   Installed `patch-package` and `postinstall-postinstall`.
    *   Added a `postinstall` script to `package.json`: `"postinstall": "patch-package"`.
    *   The crucial change of adding `set(ENABLE_FRAME_PROCESSORS ON)` to `react-native-vision-camera/android/CMakeLists.txt` was made permanent using `npx patch-package react-native-vision-camera`.
5.  **Dependency Management:** Switched to `yarn` for consistency and to manage the `yarn.lock` file, which had been manually edited at one point.

After these steps, particularly the `patch-package` application and ensuring `ENABLE_FRAME_PROCESSORS` was explicitly `ON` in VisionCamera's CMake build, the linker errors were resolved, and the build became stable.

This detailed journey highlights the complexities of integrating advanced camera functionalities and native modules in React Native, especially when dealing with build system intricacies and inter-library dependencies at the native C++/CMake level.
