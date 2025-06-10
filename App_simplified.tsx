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

  // Camera format selection - keep the good logic you had
  const format = useMemo(() => {
    if (!device?.formats) {
      console.log('🔍 DEBUG: No device formats available');
      return undefined;
    }
    
    console.log(`🔍 DEBUG: Available formats for device ${device.id}:`, 
      device.formats.map(f => `${f.photoWidth}x${f.photoHeight}@${f.minFps}-${f.maxFps}fps`));

    // For PDF417 scanning, prioritize higher resolution formats
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

    const selectedFormat = sortedFormats[0];
    
    if (selectedFormat) {
      const videoRes = selectedFormat.videoWidth && selectedFormat.videoHeight 
        ? `${selectedFormat.videoWidth}x${selectedFormat.videoHeight}` 
        : 'N/A';
      const photoRes = `${selectedFormat.photoWidth}x${selectedFormat.photoHeight}`;
      console.log(`Selected Camera Format: ${videoRes} @ ${selectedFormat.minFps}-${selectedFormat.maxFps} FPS (Photo: ${photoRes})`);
    }
    
    return selectedFormat;
  }, [device?.formats, device?.id]);

  // Barcode detection callback - inspired by your reference
  const onBarcodeDetected = useRunOnJS(
    useCallback((result: string) => {
      console.log('🎯 Barcode detected:', result);
      if (result && result !== 'No barcodes found') {
        setBarcodeResult({
          value: result,
          timestamp: Date.now()
        });
        Alert.alert('Barcode Scanned', result);
      }
      setIsProcessing(false);
    }, []),
    []
  );

  const onProcessingError = useRunOnJS(
    useCallback((error: string) => {
      console.error('🚨 Processing error:', error);
      setIsProcessing(false);
      Alert.alert('Scan Error', error);
    }, []),
    []
  );

  const updateFrameCount = useRunOnJS(
    useCallback(() => {
      setFrameCount(prev => prev + 1);
    }, []),
    []
  );

  // Simplified frame processor - inspired by your reference
  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';
    
    // Simple throttling - process every 30 frames (roughly 2fps at 60fps)
    if (frameCount % 30 !== 0) {
      return;
    }

    // Skip if already processing
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    updateFrameCount();

    console.log('🔄 Processing frame:', frame.width, 'x', frame.height);

    try {
      const cropResult = crop(frame, {
        includeImageBase64: true,
      });

      if (cropResult && typeof cropResult.base64 === 'string') {
        console.log('🔄 Sending to ML Kit...');
        
        // Process the frame
        MLKitBarcodeScanner.processFrame(
          cropResult.base64, 
          frame.width, 
          frame.height, 
          frame.orientation
        )
        .then((result) => {
          onBarcodeDetected(result);
        })
        .catch((error) => {
          onProcessingError(error.message || 'Unknown error');
        });
      } else {
        console.log('🔄 No valid crop result');
        setIsProcessing(false);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('🔄 Frame processor error:', errorMsg);
      onProcessingError(errorMsg);
    }
  }, [frameCount, isProcessing, onBarcodeDetected, onProcessingError, updateFrameCount]);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      console.log(`Camera permission status: ${cameraPermission}`);
      if (cameraPermission !== 'granted') {
        Alert.alert('Error', 'Camera permission is required.');
      }
    })();
  }, []);

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
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        format={format}
        frameProcessor={frameProcessor}
        fps={15}
        pixelFormat='yuv'
        photo={false} 
        video={false}
        audio={false} 
        enableZoomGesture={true}
      />
      
      {/* Simple debug info - inspired by your reference */}
      <View style={styles.debugOverlay}>
        <Text style={styles.debugTitle}>📱 PDF417 Scanner</Text>
        <Text style={styles.debugText}>
          Frames: {frameCount} | Processing: {isProcessing ? '🟢' : '🔴'}
        </Text>
      </View>

      {/* Barcode result display - inspired by your reference */}
      {barcodeResult && (
        <View style={styles.barcodeDisplayContainer}>
          <Text style={styles.barcodeText}>Detected Barcode:</Text>
          <Text style={styles.barcodeTextValue} numberOfLines={3}>
            {barcodeResult.value}
          </Text>
          <Text style={styles.timestampText}>
            {new Date(barcodeResult.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000
  },
  debugTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  barcodeDisplayContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    alignItems: 'center',
  },
  barcodeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  barcodeTextValue: {
    color: 'lightgreen',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  timestampText: {
    color: 'lightgray',
    fontSize: 12,
    marginTop: 5,
  },
});
