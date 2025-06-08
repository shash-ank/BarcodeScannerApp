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


import React, { useEffect, useCallback } from 'react'; // Added useCallback
import { StyleSheet, Text, View } from 'react-native'; // Added Text, View for displaying barcode
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  Frame,
} from 'react-native-vision-camera';
import {
  useBarcodeScanner,
  Barcode,
  ScanBarcodeOptions // Import ScanBarcodeOptions
} from 'react-native-vision-camera-barcodes-scanner';
import { useRunOnJS } from 'react-native-worklets-core';

function App() {
  const device = useCameraDevice('back');

  const [barcodeValue, setBarcodeValue] = React.useState<string | null>(null);

  // Use ScanBarcodeOptions for typing if desired, though array of strings also works
  const scannerOptions: ScanBarcodeOptions = ['pdf_417'];

  const { scanBarcodes } = useBarcodeScanner({
    barcodeTypes: scannerOptions, // Use the typed options
  });

  const onBarcodeDetectedOnJsSide = useRunOnJS(useCallback((barcodes: Barcode[]) => {
    // The official type uses rawValue, so this should be correct now.
    if (barcodes.length > 0 && barcodes[0].rawValue) {
      console.log('[App JS] PDF417 Barcode raw value:', barcodes[0].rawValue);
      setBarcodeValue(barcodes[0].rawValue);
    } 
    // Removed the fallback to barcodes[0].value as it's not in the official type
  }, []), []);

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

  useEffect(() => {
    if (!device) {
      console.warn("[App] No camera device found!");
    }
  }, [device]);

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No camera device found.</Text>
      </View>
    );
  }

  return (
    <>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />
      {barcodeValue && (
        <View style={styles.barcodeDisplayContainer}>
          <Text style={styles.barcodeText}>Detected Barcode:</Text>
          <Text style={styles.barcodeTextValue}>{barcodeValue}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  barcodeDisplayContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    alignItems: 'center',
  },
  barcodeText: {
    color: 'white',
    fontSize: 16,
  },
  barcodeTextValue: {
    color: 'lightgreen',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default App;