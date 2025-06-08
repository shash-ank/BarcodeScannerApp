declare module 'react-native-vision-camera-barcodes-scanner' {
  import type { CameraProps, Frame, FrameProcessorPlugin, ReadonlyFrameProcessor } from 'react-native-vision-camera';

  // Re-exporting these types from react-native-vision-camera as per the author's types.ts
  export type { Frame, ReadonlyFrameProcessor, FrameProcessorPlugin };

  export type BarCodeType = Readonly<{
    aztec: string;
    code_128: string;
    code_39: string;
    code_93: string;
    codabar: string;
    ean_13: string;
    ean_8: string;
    pdf_417: string;
    qr: string;
    upc_e: string;
    upc_a: string;
    itf: string;
    data_matrix: string;
    all: string;
  }>;

  export type ScanBarcodeOptions = Array<keyof BarCodeType>;

  export type Barcode = {
    bottom: number;
    height: number;
    left: number;
    rawValue: string;
    right: number;
    top: number;
    width: number;
    // Note: 'type' and 'displayValue' are not in the author's Barcode type directly,
    // but 'type' was in your previous logs. If needed, it would be part of a different structure
    // or implied by the key from BarCodeType used in options.
    // For now, sticking to the author's exact Barcode type.
  };

  // This CameraTypes seems to be for a component, which might not be directly used by useBarcodeScanner hook's return.
  // export type CameraTypes = {
  //   callback: (data: Barcode[]) => void;
  //   options?: ScanBarcodeOptions;
  // } & CameraProps;

  // This is the plugin type, which useBarcodeScanner hook uses.
  export type BarcodeScannerPlugin = {
    scanBarcodes: (frame: Frame) => Barcode[];
  };

  // Adjusting useBarcodeScanner to reflect it returns an object with scanBarcodes method
  export function useBarcodeScanner(options?: { barcodeTypes?: ScanBarcodeOptions, checkInverted?: boolean }): BarcodeScannerPlugin;
}