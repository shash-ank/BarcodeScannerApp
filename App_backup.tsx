// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */
/**ORIGINIAL VERSION */


// import React from 'react';
// import { StyleSheet } from "react-native";
// import {
//   Camera,
//   useCameraDevice,
//   useFrameProcessor,
// } from "react-native-vision-camera";
// import { useBarcodeScanner } from "react-native-vision-camera-barcodes-scanner";

// function App() {
//   const device = useCameraDevice('back');
//   const options: ("pdf_417")[] = ["pdf_417"];
//   const { scanBarcodes } = useBarcodeScanner(options);

//   const frameProcessor = useFrameProcessor((frame) => {
//     'worklet';
//     try {
//       const data = scanBarcodes(frame);
//       console.log(data, 'data');
//     } catch (error) {
//       console.error('Error scanning barcode:', error);
//     }
//   }, []);

//   return (
//     <>
//       {!!device && (
//         <Camera
//           style={StyleSheet.absoluteFill}
//           device={device}
//           isActive
//           frameProcessor={frameProcessor}
//         />
//       )}
//     </>
//   );
// }

// export default App;


import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { View, Text, NativeModules, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  Frame,
} from 'react-native-vision-camera';
import { crop } from 'vision-camera-cropper';
import { useRunOnJS } from 'react-native-worklets-core';

interface MLKitBarcodeScannerInterface {
  processFrame(base64FrameData: string, width: number, height: number, orientation: string): Promise<string>;
}

const MLKitBarcodeScanner = NativeModules.MLKitBarcodeScanner as MLKitBarcodeScannerInterface;

interface BarcodeResult {
  value: string;
  timestamp: number;
}

export default function App() { 
  const device = useCameraDevice('back');
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const format = useMemo(() => {
    if (!device?.formats) {
      console.log('🔍 DEBUG: No device formats available');
      return undefined;
    }
    
    console.log(`🔍 DEBUG: Available formats for device ${device.id}:`, 
      device.formats.map(f => `${f.photoWidth}x${f.photoHeight}@${f.minFps}-${f.maxFps}fps`));

    // For PDF417 scanning, prioritize higher resolution formats
    // Sort by video resolution (for frame processing) or photo resolution as fallback
    const sortedFormats = device.formats
      .filter(f => f.minFps <= 30 && f.maxFps >= 15) // Reasonable fps range
      .sort((a, b) => {
        // Priority 1: Video resolution (frame processors use video stream)
        const aVideoRes = (a.videoWidth || 0) * (a.videoHeight || 0);
        const bVideoRes = (b.videoWidth || 0) * (b.videoHeight || 0);
        
        if (aVideoRes !== bVideoRes) {
          return bVideoRes - aVideoRes; // Descending order (highest first)
        }
        
        // Priority 2: Photo resolution as fallback
        const aPhotoRes = (a.photoWidth || 0) * (a.photoHeight || 0);
        const bPhotoRes = (b.photoWidth || 0) * (b.photoHeight || 0);
        return bPhotoRes - aPhotoRes; // Descending order (highest first)
      });

    // Select the highest resolution format that has reasonable fps
    const selectedFormat = sortedFormats[0];
    
    console.log('🔍 DEBUG: Selected format:', selectedFormat);
    
    if (selectedFormat) {
      const videoRes = selectedFormat.videoWidth && selectedFormat.videoHeight 
        ? `${selectedFormat.videoWidth}x${selectedFormat.videoHeight}` 
        : 'N/A';
      const photoRes = `${selectedFormat.photoWidth}x${selectedFormat.photoHeight}`;
      console.log(`Selected Camera Format: ${videoRes} @ ${selectedFormat.minFps}-${selectedFormat.maxFps} FPS (Photo: ${photoRes})`);
    }
    
    return selectedFormat;
  }, [device?.formats, device?.id]);

  // Original JS logic for processing barcode results
  const processBarcodeNativeResult = useCallback((base64: string, width: number, height: number, orientation: string) => {
    const startTime = Date.now();
    console.log('🎯 DEBUG BREAKPOINT 1: JS Thread - Frame received for processing');
    console.log('🎯 Frame data length:', base64.length);
    console.log('🎯 Frame dimensions:', width, 'x', height);
    console.log('🎯 Frame orientation:', orientation);
    // console.log('🎯 First 50 chars of base64:', base64.substring(0, 50)); // Can be very verbose
    
    setDebugInfo(prev => ({
      ...prev,
      processingActive: true,
      lastProcessTime: startTime
    }));
    
    // debugger; // Keep for your debugging if needed
    
    MLKitBarcodeScanner.processFrame(base64, width, height, orientation)
      .then((result) => {
        const endTime = Date.now();
        console.log('🎯 DEBUG BREAKPOINT 2: Native processing completed');
        console.log('🎯 Processing time:', endTime - startTime, 'ms');
        console.log('🎯 Barcode Scan Result:', result);
        
        // debugger; // Keep for your debugging if needed
        
        setDebugInfo(prev => ({
          ...prev,
          processingActive: false,
          lastResult: result || 'No result'
        }));
        
        global._frameProcessingActive = false;
        
        if (result && result !== 'No barcodes found') {
          Alert.alert('Barcode Scanned', result);
        }
      })
      .catch((error) => {
        const endTime = Date.now();
        console.error('🎯 DEBUG BREAKPOINT 3: Native processing error');
        console.error('🎯 Error details:', error);
        console.error('🎯 Error message:', error.message);
        console.error('🎯 Processing time before error:', endTime - startTime, 'ms');
        
        // debugger; // Keep for your debugging if needed
        
        setDebugInfo(prev => ({
          ...prev,
          processingActive: false,
          errors: [...prev.errors, error.message || 'Unknown error']
        }));
        
        global._frameProcessingActive = false;
        
        Alert.alert('Scan Error', error.message);
      });
  }, []); // Dependencies: setDebugInfo is stable, MLKitBarcodeScanner is stable.

  // --- Functions to be called from worklet via useRunOnJS ---
  const updateFrameCountOnJS = useRunOnJS(() => {
    setDebugInfo(prev => ({ ...prev, frameCount: prev.frameCount + 1 }));
  }, [setDebugInfo]);

  const updateThrottleInfoOnJS = useRunOnJS((info: string) => {
    setDebugInfo(prev => ({ ...prev, throttleInfo: info }));
  }, [setDebugInfo]);

  const callProcessBarcodeOnJS = useRunOnJS(processBarcodeNativeResult, [processBarcodeNativeResult]);

  const resetProcessingFlagOnJS = useRunOnJS(() => {
    global._frameProcessingActive = false;
    // Don't reset _lastFrameProcessTime here - let throttling handle timing
  }, []);

  const reportErrorOnJS = useRunOnJS((errorMsg: string) => {
    setDebugInfo(prev => ({
      ...prev,
      errors: [...prev.errors, `Frame processor: ${errorMsg}`]
    }));
    global._frameProcessingActive = false; // Reset flag on error
  }, [setDebugInfo]);
  // --- End of useRunOnJS wrapped functions ---

  const frameProcessor = useFrameProcessor((frame: Frame) => { // Added Frame type
    'worklet';
    
    const currentTime = Date.now();
    const THROTTLE_MS = 1000; // Process max 1 frame per second for PDF417 scanning
    
    // Initialize global variables if undefined
    if (global._lastFrameProcessTime === undefined) {
      global._lastFrameProcessTime = 0;
    }
    if (global._frameProcessingActive === undefined) {
      global._frameProcessingActive = false;
    }
    
    // Calculate time since last processing
    const timeSinceLastProcess = currentTime - global._lastFrameProcessTime;
    
    // Throttle to prevent too frequent processing
    if (timeSinceLastProcess < THROTTLE_MS) {
      updateThrottleInfoOnJS(`Throttled: ${timeSinceLastProcess}ms < ${THROTTLE_MS}ms`);
      return;
    }
    
    // Skip if still processing previous frame
    if (global._frameProcessingActive) {
      updateThrottleInfoOnJS('Skipped: Still processing previous frame');
      return;
    }
    
    global._frameProcessingActive = true;
    global._lastFrameProcessTime = currentTime;
    
    console.log('🔄 DEBUG: Frame processor starting - Time:', currentTime);
    console.log('🔄 Frame dimensions:', frame.width, 'x', frame.height);
    console.log('🔄 Frame pixel format:', frame.pixelFormat);
    console.log('🔄 Frame orientation:', frame.orientation);
    
    updateThrottleInfoOnJS(`Processing frame: ${timeSinceLastProcess}ms since last`);
    
    try {
      const cropStart = Date.now();
      const cropResult = crop(frame, {
        includeImageBase64: true,
        // Optional cropRegion if needed:
        // cropRegion: { left: 10, top: 20, width: 80, height: 60, unit: 'percent' }
      });
      const cropEnd = Date.now();
      
      console.log('🔄 Crop processing time:', cropEnd - cropStart, 'ms');
      console.log('🔄 Crop result available:', !!cropResult);
      console.log('🔄 Base64 available:', !!(cropResult && cropResult.base64));
      
      if (cropResult && typeof cropResult.base64 === 'string') {
        console.log('🔄 Sending to JS thread for ML Kit processing...');
        
        updateFrameCountOnJS();
        callProcessBarcodeOnJS(cropResult.base64, frame.width, frame.height, frame.orientation);

      } else {
        console.log('🔄 No valid crop result or base64 data');
        resetProcessingFlagOnJS();
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('🔄 Frame processor error:', errorMsg);
      reportErrorOnJS(errorMsg);
    }
  }, [updateFrameCountOnJS, updateThrottleInfoOnJS, callProcessBarcodeOnJS, resetProcessingFlagOnJS, reportErrorOnJS]); // Dependencies for useFrameProcessor

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      console.log(`Camera permission status: ${cameraPermission}`);
      if (cameraPermission !== 'granted') {
        Alert.alert('Error', 'Camera permission is required.');
      }
    })();
  }, []);

  useEffect(() => {
    if (format) {
      const res = format.videoWidth ? `${format.videoWidth}x${format.videoHeight}` : `${format.photoWidth}x${format.photoHeight}`;
      console.log(`Selected Camera Format: ${res} @ ${format.minFps}-${format.maxFps} FPS`);
    } else {
      console.log('No suitable format selected yet.');
    }
  }, [format]);

  if (device == null || format == null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading Camera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill} // Changed from flex: 1 to absoluteFill for camera preview
        device={device}
        isActive={true}
        format={format}
        frameProcessor={frameProcessor}
        fps={15} // Consider making this dynamic based on format.maxFps if desired
        pixelFormat='yuv' // yuv is generally good for performance
        // These were in your android.tsx, ensure they are intended.
        // If you only do frame processing, photo/video/audio can be false.
        photo={false} 
        video={false}
        audio={false} 
        enableZoomGesture={true} // Added to allow pinch-to-zoom, may help with focus
      />
      {/* Debug Overlay */}
      <View style={styles.debugOverlay}>
        <Text style={styles.debugTitle}>
          🔍 Debug Info:
        </Text>
        <Text style={styles.debugText}>
          Frames: {debugInfo.frameCount} | 
          Processing: {debugInfo.processingActive ? '🟢' : '🔴'} |
          Last: {debugInfo.lastResult.substring(0, 30) || 'None'} {/* Shorten result */}
        </Text>
        <Text style={styles.debugText}>
          Throttle: {debugInfo.throttleInfo || 'Waiting for frames...'}
        </Text>
        {debugInfo.errors.length > 0 && (
          <Text style={styles.debugErrorText}>
            Errors: {debugInfo.errors.slice(-2).join('; ')} {/* Show last 2 errors */}
          </Text>
        )}
      </View>
    </View>
  );
}

// Basic styles, you can expand these
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugOverlay: {
    position: 'absolute',
    top: 50, // Adjust as needed, consider SafeAreaView
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000
  },
  debugTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
  debugErrorText: {
    color: 'red',
    fontSize: 10,
    marginTop: 2,
  }
});