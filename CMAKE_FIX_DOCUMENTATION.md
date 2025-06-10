# CMake Linking Issue Resolution - VisionCamera + Worklets

## Problem
React Native VisionCamera failed to link with react-native-worklets-core during Android build:
```
ninja: error: '../../../../../react-native-worklets-core/android/build/intermediates/cxx/RelWithDebInfo/5v4w4758/obj/arm64-v8a/librnworklets.so', needed by '../../../../build/intermediates/cxx/Debug/3s373t57/obj/arm64-v8a/libVisionCamera.so', missing and no known rule to make it
```

## Root Cause
- **Path Resolution Issue**: CMake was using relative paths (`../`) to locate worklets library
- **Build Configuration Mismatch**: VisionCamera (Debug) vs Worklets (RelWithDebInfo) build types
- **Timing Issue**: CMake couldn't find worklets library during configure phase

## Systematic Solution

### Step 1: Identified the Core Issue
Located in `/node_modules/react-native-vision-camera/android/CMakeLists.txt`:
```cmake
# BROKEN - Relative path resolution
set(WORKLETS_BASE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../react-native-worklets-core/android/build/intermediates")
```

### Step 2: Fixed Path Resolution
```cmake
# WORKING - Absolute path using NODE_MODULES_DIR
set(WORKLETS_BASE_DIR "${NODE_MODULES_DIR}/react-native-worklets-core/android/build/intermediates")
```

### Step 3: Added Multiple Fallback Paths
```cmake
set(WORKLETS_PATHS
    "${WORKLETS_BASE_DIR}/cmake/debug/obj/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cmake/release/obj/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cxx/Debug/291y2y5i/obj/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/cxx/RelWithDebInfo/5v4w4758/obj/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/merged_native_libs/release/out/lib/${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/prefab_package/debug/prefab/modules/rnworklets/libs/android.${ANDROID_ABI}/librnworklets.so"
    "${WORKLETS_BASE_DIR}/prefab_package/release/prefab/modules/rnworklets/libs/android.${ANDROID_ABI}/librnworklets.so"
)
```

### Step 4: Added Robust Library Detection
```cmake
foreach(WORKLETS_PATH ${WORKLETS_PATHS})
    if(EXISTS ${WORKLETS_PATH})
        set(WORKLETS_LIB_FILE ${WORKLETS_PATH})
        message("VisionCamera: Found worklets at: ${WORKLETS_LIB_FILE}")
        break()
    endif()
endforeach()
```

## Build Process
1. **Clean Build**: `./gradlew clean`
2. **Build Worklets**: `./gradlew :react-native-worklets-core:build`
3. **Build VisionCamera**: CMake now finds and links worklets library correctly
4. **Release APK**: `./gradlew assembleRelease` - SUCCESS ✅

## Result
- ✅ CMake configuration successful for all architectures (arm64-v8a, armeabi-v7a, x86, x86_64)
- ✅ Native libraries properly linked: `libVisionCamera.so` + `librnworklets.so`
- ✅ Release APK generated: 76MB with all architectures
- ✅ App installs and runs with frame processors enabled

## Key Learning
**Never use relative paths in CMake for cross-module dependencies**. Always use absolute paths with well-defined variables like `NODE_MODULES_DIR` to ensure reliable library resolution across different build configurations.
