# React Native Vision Camera Barcode Scanner App

A React Native app with **react-native-vision-camera** and **frame processors** for PDF417 barcode scanning using ML Kit.

## 🚀 Quick Start

### Prerequisites
- React Native development environment set up
- Android device or emulator
- Node.js 18+ and npm/yarn

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
- **Cross-platform compatibility** (Android focus)

### Technical Implementation
- **Custom ML Kit module** (`MLKitBarcodeScannerModule.java`)
- **Frame processors** via `react-native-worklets-core`
- **Advanced camera configuration** with high-resolution support
- **Base64 frame processing** with orientation handling

## 🔧 Build Configuration

### Key Dependencies
- **react-native**: 0.74.3
- **react-native-vision-camera**: 4.5.3  
- **react-native-worklets-core**: 1.4.0
- **vision-camera-cropper**: 1.3.1
- **ML Kit Barcode Scanning**: 17.3.0

### Required Gradle Properties
Ensure these are set in `android/gradle.properties`:
```properties
VisionCamera_enableFrameProcessors=true
hermesEnabled=true
newArchEnabled=false
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

### Camera Permissions
The app requires camera permissions. These are configured in:
- `android/app/src/main/AndroidManifest.xml`
- `ios/BarcodeScannerApp/Info.plist`

## 🛠️ Installation & Testing

### Install Release APK
```bash
# Install the release APK
adb install -r BarcodeScannerApp-Release-v2.apk
```

### Test Features
1. **Launch the app** - "PDF417 Scanner"
2. **Grant camera permission** when prompted
3. **Point camera at barcodes** - supports PDF417, QR codes, and more
4. **Real-time detection** with frame processor integration

## 🔧 Critical CMake Linking Fix

### The Problem
The original issue was a **CMake linking race condition** where:

1. `react-native-worklets-core` builds and generates `librnworklets.so`
2. `react-native-vision-camera` tries to link but can't find worklets symbols
3. The prefab configuration doesn't properly expose the library
4. Build fails with: `ninja: error: missing and no known rule to make it`

### The Solution
Our CMake fix in `node_modules/react-native-vision-camera/android/CMakeLists.txt`:

```cmake
# Fixed path resolution using NODE_MODULES_DIR
set(WORKLETS_BASE_DIR "${NODE_MODULES_DIR}/react-native-worklets-core/android/build/intermediates")

# Multiple fallback paths for different build configurations
set(WORKLETS_LIB_PATHS
    "${WORKLETS_BASE_DIR}/cxx/Debug/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cxx/Release/${ANDROID_ABI}/librnworklets.so" 
    "${WORKLETS_BASE_DIR}/cxx/RelWithDebInfo/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cmake/debug/obj/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cmake/release/obj/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cmake/relwithdebinfo/obj/${ANDROID_ABI}/librnworklets.so"
)

# Find first existing worklets library
foreach(LIB_PATH ${WORKLETS_LIB_PATHS})
    if(EXISTS ${LIB_PATH})
        set(WORKLETS_LIB_PATH ${LIB_PATH})
        message(STATUS "VisionCamera: Found worklets at: ${WORKLETS_LIB_PATH}")
        break()
    endif()
endforeach()

# Link the library directly
if(WORKLETS_LIB_PATH)
    target_link_libraries(VisionCamera ${WORKLETS_LIB_PATH})
    message(STATUS "VisionCamera: Successfully linked worklets library")
else()
    message(WARNING "VisionCamera: Could not find worklets library")
endif()
```

### Why This Fix Works
1. **Explicit path resolution**: Uses `NODE_MODULES_DIR` instead of unreliable relative paths
2. **Multiple fallback paths**: Handles different build configurations (Debug/Release/RelWithDebInfo)
3. **Library existence checking**: Ensures the library exists before attempting to link
4. **Deterministic build order**: Links the library directly without relying on prefab

### Architecture Support
The fix works for all Android architectures:
- `arm64-v8a` (64-bit ARM)
- `armeabi-v7a` (32-bit ARM) 
- `x86` (32-bit Intel)
- `x86_64` (64-bit Intel)

## 🔍 Troubleshooting Guide

### Step-by-Step Debugging Process

This section documents the complete debugging journey for resolving CMake linking issues between `react-native-vision-camera` and `react-native-worklets-core`.

#### Step 1: Initial Error Diagnosis
```bash
# Clean all build artifacts
rm -rf node_modules android/.gradle android/app/build
npm install
```

**Common Error**: `ninja: error: missing and no known rule to make it`
- **Root Cause**: Race condition where VisionCamera tries to link worklets before it's built
- **Symptoms**: Undefined references to `RNWorklet::Worklet` symbols

#### Step 2: Build Dependencies First
```bash
# Build worklets library first to ensure availability
cd android
./gradlew :react-native-worklets-core:assembleRelease
```

**Expected Output**: 
```
VisionCamera: Found worklets at: [path]
VisionCamera: Successfully linked worklets library
```

#### Step 3: Path Resolution Issues
If the build still fails, check library paths:

```bash
# Verify worklets library exists
find node_modules/react-native-worklets-core/android/build -name "librnworklets.so"
```

**Expected Locations**:
- `node_modules/react-native-worklets-core/android/build/intermediates/cxx/Release/*/obj/*/librnworklets.so`
- `node_modules/react-native-worklets-core/android/build/intermediates/cxx/Debug/*/obj/*/librnworklets.so`

#### Step 4: CMake Configuration Debug
Add debug messages to CMakeLists.txt to trace path resolution:

```cmake
# Debug: Check which paths are being tested
message(STATUS "VisionCamera: Checking worklets at: ${LIB_PATH}")
```

#### Step 5: Build Configuration Mismatch
**Issue**: Debug vs Release vs RelWithDebInfo configuration conflicts

**Solution**: Update CMakeLists.txt with multiple fallback paths:
```cmake
set(WORKLETS_LIB_PATHS
    "${WORKLETS_BASE_DIR}/cxx/Debug/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cxx/Release/${ANDROID_ABI}/librnworklets.so" 
    "${WORKLETS_BASE_DIR}/cxx/RelWithDebInfo/${ANDROID_ABI}/librnworklets.so"
)
```

#### Step 6: Final Build Process
```bash
# Clean and rebuild with proper configuration
cd android
./gradlew clean
./gradlew assembleRelease
```

### Common Error Messages & Solutions

#### "Could not read script 'native_modules.gradle'"
**Solution**: Ensure `node_modules` is properly installed
```bash
rm -rf node_modules
npm install
```

#### "VisionCamera: Worklets library not found, using prefab target"
**Root Cause**: CMake path resolution failing
**Solution**: Apply the CMake fix with proper `NODE_MODULES_DIR` usage

#### "undefined reference to `RNWorklet::Worklet::*`"
**Root Cause**: Worklets library not linked properly
**Solution**: Ensure worklets library is built before VisionCamera

#### Lint Errors During Build
**Temporary Fix**: Skip lint during debugging
```bash
./gradlew assembleRelease -x lint
```

### Build Success Indicators
Look for these messages in the build output:
```
[VisionCamera] VisionCamera_enableFrameProcessors is set to true!
[VisionCamera] react-native-worklets-core found, Frame Processors are enabled!
VisionCamera: Frame Processors: ON!
VisionCamera: Found worklets at: [path]
VisionCamera: Successfully linked worklets library
```

### Advanced Debugging Techniques

#### 1. Verbose CMake Output
```bash
./gradlew assembleRelease --info
```

#### 2. Check Native Library Inclusion
```bash
# Verify libraries are in APK
unzip -l app-release.apk | grep -E "(libVisionCamera|librnworklets)"
```

#### 3. Architecture-Specific Issues
```bash
# Check specific architecture builds
ls -la node_modules/react-native-worklets-core/android/build/intermediates/cxx/*/obj/
```

### Recovery Commands

If you encounter persistent issues, use these recovery commands:

```bash
# Nuclear option: Complete cleanup
rm -rf node_modules android/.gradle android/app/build ~/.gradle/caches
npm install

# Rebuild worklets first
cd android && ./gradlew :react-native-worklets-core:assembleRelease

# Apply CMake fix and build
./gradlew clean && ./gradlew assembleRelease
```

### Frame Processors Troubleshooting

#### Not Working After CMake Fix?
1. **Check gradle.properties**: Ensure `VisionCamera_enableFrameProcessors=true`
2. **Verify worklet directive**: Ensure `'worklet';` is first line in frame processor
3. **Check dependencies**: Ensure all dependencies in `useFrameProcessor` are correct
4. **Native module registration**: Verify `MLKitBarcodeScannerPackage` is registered in `MainApplication.kt`

## 🔍 Detailed Troubleshooting Guide

### Step-by-Step Debugging Process

This section documents the complete troubleshooting process we went through to resolve the CMake linking issues. Follow these steps if you encounter similar problems:

#### Step 1: Initial Dependency Issues
**Problem**: Build fails with "Could not read script... native_modules.gradle as it does not exist"
**Solution**:
```bash
# Clean and reinstall dependencies
rm -rf node_modules
npm install
# or
yarn install
```

#### Step 2: Apply the Race Condition Patch
**Problem**: Even with dependencies, CMake linking fails
**Action**: Install and apply the patch (if using patch-package):
```bash
npm install patch-package postinstall-postinstall
npm run postinstall
```

#### Step 3: Build Worklets Library First
**Problem**: CMake shows "Worklets library not found, using prefab target"
**Action**: Build worklets library in the correct configuration:
```bash
cd android
./gradlew :react-native-worklets-core:buildCMakeRelWithDebInfo[arm64-v8a]
./gradlew :react-native-worklets-core:buildCMakeDebug[arm64-v8a]
```

#### Step 4: Verify Library Locations
**Check where worklets libraries are actually built**:
```bash
find node_modules/react-native-worklets-core -name "librnworklets.so" -exec ls -la {} \;
```

**Expected locations**:
- `node_modules/react-native-worklets-core/android/build/intermediates/cxx/Debug/[hash]/obj/[arch]/librnworklets.so`
- `node_modules/react-native-worklets-core/android/build/intermediates/cxx/Release/[hash]/obj/[arch]/librnworklets.so`

#### Step 5: Debug CMake Path Resolution
**Add debug messages to CMakeLists.txt** (temporarily):
```cmake
message(STATUS "VisionCamera: NODE_MODULES_DIR = ${NODE_MODULES_DIR}")
message(STATUS "VisionCamera: Checking path: ${LIB_PATH}")
```

#### Step 6: Build Configuration Mismatch
**Problem**: CMake looking for RelWithDebInfo but building Debug
**Observation**: Path includes `/Debug/[hash]/` but CMake expects `/RelWithDebInfo/[hash]/`
**Solution**: Update CMakeLists.txt with multiple fallback paths for different build configurations

#### Step 7: Correct Path Resolution
**Problem**: Relative paths (`../`) not resolving correctly in CMake
**Solution**: Use absolute paths with `NODE_MODULES_DIR`:
```cmake
set(WORKLETS_BASE_DIR "${NODE_MODULES_DIR}/react-native-worklets-core/android/build/intermediates")
```

#### Step 8: Final Verification
**Check APK contents** to ensure libraries are included:
```bash
unzip -l app-release.apk | grep -E "(libVisionCamera|librnworklets)"
```

### Common Error Messages and Solutions

#### "ninja: error: missing and no known rule to make it"
- **Cause**: CMake can't find the worklets library to link against
- **Solution**: Apply the CMake fix with proper path resolution
- **Verification**: Look for "VisionCamera: Found worklets at:" in build output

#### "Could not read script... native_modules.gradle"
- **Cause**: Missing or corrupted node_modules
- **Solution**: Clean and reinstall dependencies
- **Command**: `rm -rf node_modules && npm install`

#### "VisionCamera: Worklets library not found, using prefab target"
- **Cause**: Library exists but CMake path resolution fails
- **Solution**: Update CMakeLists.txt with correct base directory
- **Debug**: Add temporary message() calls to see actual paths being checked

#### Build succeeds but frame processors don't work
- **Check**: `VisionCamera_enableFrameProcessors=true` in gradle.properties
- **Check**: `'worklet';` directive is first line in frame processor
- **Check**: All dependencies in `useFrameProcessor` dependency array

### Advanced Debugging Techniques

#### Enable Verbose CMake Output
```bash
cd android
./gradlew assembleRelease --info | grep -i cmake
```

#### Check Build Configuration
```bash
cd android
./gradlew tasks --all | grep -i cmake
```

#### Monitor File System During Build
```bash
# In another terminal, watch the worklets build directory
watch -n 1 'find node_modules/react-native-worklets-core -name "*.so" -exec ls -la {} \;'
```

#### Inspect Gradle Configuration
```bash
cd android
./gradlew dependencies | grep -i worklets
./gradlew dependencies | grep -i vision
```

### Recovery Commands

If you need to completely reset the build environment:

```bash
# Complete clean
rm -rf node_modules
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

# Clear React Native cache
npx react-native-clean-project --clean-node-modules --clean-android-build

# Reinstall and rebuild
npm install
cd android && ./gradlew clean && cd ..
npm run android
```
