# React Native Vision Camera PDF417 Barcode Scanner

A React Native app that successfully implements **PDF417 barcode scanning** using:
- **react-native-vision-camera** for camera access and frame processing  
- **react-native-vision-camera-barcodes-scanner** for direct ML Kit integration
- **react-native-worklets-core** for high-performance frame processors
- **Custom ML Kit native module** (alternative implementation) for advanced barcode detection

## 🎯 **WORKING SOLUTION - CURRENT IMPLEMENTATION**

This app demonstrates a **fully functional PDF417 barcode scanner** that successfully scans driver licenses and other PDF417 barcodes in real-time.

### **Current Working Architecture:**

**App.tsx** - Uses `react-native-vision-camera-barcodes-scanner` directly:
```typescript
import { useBarcodeScanner } from 'react-native-vision-camera-barcodes-scanner';

const { scanBarcodes } = useBarcodeScanner({
  barcodeTypes: ['pdf_417'], // Focus on PDF417 format
});

const frameProcessor = useFrameProcessor((frame: Frame) => {
  'worklet';
  try {
    const detectedBarcodes = scanBarcodes(frame);
    if (detectedBarcodes && detectedBarcodes.length > 0) {
      onBarcodeDetectedOnJsSide(detectedBarcodes);
    }
  } catch (e: any) {
    console.error('[App Worklet] Error in frame processor:', e.message);
  }
}, [scanBarcodes, onBarcodeDetectedOnJsSide]);
```

**MLKitBarcodeScannerModule.java** - Custom native module (alternative approach):
- Direct Google ML Kit integration with enhanced image processing
- Bitmap enhancement algorithms for difficult-to-read barcodes
- Progressive scanning (high contrast → enhanced → original)
- Comprehensive error handling and debug logging

## 🎯 Technical Implementation Overview

This app demonstrates a **working solution** for PDF417 barcode scanning that overcomes common issues with frame processing, worklet transformation, and ML Kit integration.

### **Key Technical Achievements:**

✅ **Successful PDF417 Detection** - Real-time scanning of driver licenses and PDF417 barcodes  
✅ **Worklet Transformation** - Proper Babel plugin configuration for frame processors  
✅ **Frame Processing Pipeline** - Efficient camera frame → barcode detection workflow  
✅ **Type Safety** - Complete TypeScript definitions for barcode scanner library  
✅ **Error Handling** - Comprehensive error catching and user feedback  
✅ **Performance Optimization** - Smart frame throttling and processing state management  
✅ **Dual Implementation** - Both direct scanner library and custom native module approaches

### **Architecture Components:**

1. **App.tsx** - React Native front-end with camera and frame processor
2. **react-native-vision-camera-barcodes-scanner** - Direct ML Kit integration (current working solution)
3. **MLKitBarcodeScannerModule.java** - Custom Android native module (alternative approach)
4. **Worklet Configuration** - Proper Babel setup for high-performance frame processing

## 📋 Current Working Implementation

This codebase contains a **fully functional PDF417 barcode scanner** that has been tested and validated. The key components work together seamlessly:

### Working Components:
1. **App.tsx** - Camera interface with frame processor using `vision-camera-cropper`
2. **MLKitBarcodeScannerModule.java** - Custom native module with image enhancement
3. **Integration** - Smooth React Native ↔ Android native communication

### Key Success Factors:
- **Simple crop() usage**: No explicit cropRegion specified (avoids IllegalArgumentException)
- **Progressive image enhancement**: Multiple bitmap processing attempts for better detection
- **Proper throttling**: ~3% frame processing rate for optimal performance
- **Comprehensive error handling**: Robust error catching at all levels

📖 **For detailed technical implementation, see [README_DETAILED.md](./README_DETAILED.md)**

## 🚨 Critical Build Issue & Solution

If you encounter C++ linking errors with `react-native-vision-camera` and `react-native-worklets-core`, this is the **exact fix** that works:

### Problem Symptoms:
- `ld.lld: error: undefined symbol: RNWorklet::JsiWorkletContext::initialize`
- `ld.lld: error: undefined symbol: RNWorklet::JsiHostObject::JsiHostObject()`
- Build fails during CMake linking phase between vision-camera and worklets-core
- Frame processors not working due to missing worklets symbols

### Root Cause:
The issue occurs because `react-native-vision-camera`'s CMake configuration doesn't properly link with the `react-native-worklets-core` library, even when `ENABLE_FRAME_PROCESSORS=ON` is set in gradle. This is a **build order race condition** where the worklets library symbols aren't available during vision-camera linking.

### Exact Solution:

#### Step 1: Install patch-package
```bash
npm install --save-dev patch-package
```

#### Step 2: Add postinstall script to package.json
```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios", 
    "lint": "eslint .",
    "start": "react-native start",
    "test": "jest",
    "postinstall": "patch-package"
  }
}
```

#### Step 3: Create the CMake fix patch
Create file `patches/react-native-vision-camera+4.5.3.patch` with this content:

```diff
diff --git a/node_modules/react-native-vision-camera/android/CMakeLists.txt b/node_modules/react-native-vision-camera/android/CMakeLists.txt
index 1234567..abcdefg 100644
--- a/node_modules/react-native-vision-camera/android/CMakeLists.txt
+++ b/node_modules/react-native-vision-camera/android/CMakeLists.txt
@@ -69,6 +69,18 @@ message("VisionCamera: Frame Processors: ${ENABLE_FRAME_PROCESSORS}!")
 if (ENABLE_FRAME_PROCESSORS)
     message("VisionCamera: Linking react-native-worklets...")
     find_package(react-native-worklets-core REQUIRED CONFIG)
+    
+    # Manually specify worklets library path for each architecture to fix linking
+    set(WORKLETS_LIB_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../react-native-worklets-core/android/build/intermediates/prefab_package/debug/prefab/modules/rnworklets/libs/android.${ANDROID_ABI}")
+    find_library(WORKLETS_LIB rnworklets PATHS ${WORKLETS_LIB_PATH} NO_DEFAULT_PATH)
+    
+    if(WORKLETS_LIB)
+        message("VisionCamera: Added worklets library for ${ANDROID_ABI}")
+        target_link_libraries(${PACKAGE_NAME} ${WORKLETS_LIB})
+        # Add worklets headers
+        target_include_directories(${PACKAGE_NAME} PRIVATE "${NODE_MODULES_DIR}/react-native-worklets-core/android/build/headers/rnworklets")
+    else()
+        message("VisionCamera: Worklets library not found, using prefab target")
+    endif()
+    
     target_link_libraries(
             ${PACKAGE_NAME}
             react-native-worklets-core::rnworklets
```

#### Step 4: Ensure gradle.properties is configured
In `android/gradle.properties`, add:
```properties
VisionCamera_enableFrameProcessors=true
```

#### Step 5: Clean and reinstall
```bash
# Remove node_modules and reinstall to apply patch
rm -rf node_modules
npm install

# Clean Android build 
cd android && ./gradlew clean && cd ..

# Build the app
npm run android
```

### What This Fix Does:
1. **Manually locates** the `librnworklets.so` file for each Android architecture
2. **Explicitly links** the worklets library before the prefab target
3. **Adds worklets headers** to the include path
4. **Ensures deterministic linking** by specifying exact library paths

### Verified Working Configuration:
- **react-native**: 0.74.3
- **react-native-vision-camera**: 4.5.3  
- **react-native-worklets-core**: 1.4.0
- **vision-camera-cropper**: 1.3.1

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