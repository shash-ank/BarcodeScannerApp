package com.barcodescannerapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Paint;
import android.util.Base64;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;

import java.io.File;
import java.io.FileOutputStream; // Added for saving bitmap
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MLKitBarcodeScannerModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private BarcodeScanner barcodeScanner;
    private static final String TAG = "MLKitBarcodeScanner";
    private static final String LOG_FILE_NAME = "mlkit_scanner_logs.txt";
    private boolean hasLoggedPath = false; // To log path only once
    private boolean hasSavedTestImage = false; // To save only one test image

    // Helper method to enhance bitmap for better barcode detection
    private Bitmap enhanceBitmapForPDF417(Bitmap originalBitmap) {
        d(TAG, "🔧 Enhancing bitmap for PDF417 detection...");
        
        // Create a copy for processing
        Bitmap enhancedBitmap = Bitmap.createBitmap(
            originalBitmap.getWidth(), 
            originalBitmap.getHeight(), 
            Bitmap.Config.ARGB_8888
        );
        
        Canvas canvas = new Canvas(enhancedBitmap);
        Paint paint = new Paint();
        
        // Increase contrast and convert to grayscale for better barcode detection
        ColorMatrix colorMatrix = new ColorMatrix();
        colorMatrix.setSaturation(0); // Convert to grayscale
        
        // Increase contrast more aggressively for PDF417 (values > 1.0 increase contrast)
        float contrast = 2.0f; // Increased from 1.5f for better PDF417 detection
        float brightness = 10.0f; // Slight brightness boost
        colorMatrix.set(new float[] {
            contrast, 0, 0, 0, brightness,
            0, contrast, 0, 0, brightness,
            0, 0, contrast, 0, brightness,
            0, 0, 0, 1, 0
        });
        
        paint.setColorFilter(new ColorMatrixColorFilter(colorMatrix));
        canvas.drawBitmap(originalBitmap, 0, 0, paint);
        
        d(TAG, "🔧 Bitmap enhanced: contrast=" + contrast + ", brightness=" + brightness);
        return enhancedBitmap;
    }
    
    // Create additional enhanced versions for PDF417
    private Bitmap createHighContrastBitmap(Bitmap originalBitmap) {
        d(TAG, "🔧 Creating high contrast bitmap for stubborn PDF417...");
        
        Bitmap highContrastBitmap = Bitmap.createBitmap(
            originalBitmap.getWidth(), 
            originalBitmap.getHeight(), 
            Bitmap.Config.ARGB_8888
        );
        
        Canvas canvas = new Canvas(highContrastBitmap);
        Paint paint = new Paint();
        
        // Extreme contrast for very faded or low-contrast PDF417 codes
        ColorMatrix colorMatrix = new ColorMatrix();
        colorMatrix.setSaturation(0); // Grayscale
        
        float extremeContrast = 3.0f; // Very high contrast
        float extremeBrightness = 20.0f; // Higher brightness
        colorMatrix.set(new float[] {
            extremeContrast, 0, 0, 0, extremeBrightness,
            0, extremeContrast, 0, 0, extremeBrightness,
            0, 0, extremeContrast, 0, extremeBrightness,
            0, 0, 0, 1, 0
        });
        
        paint.setColorFilter(new ColorMatrixColorFilter(colorMatrix));
        canvas.drawBitmap(originalBitmap, 0, 0, paint);
        
        d(TAG, "🔧 High contrast bitmap created: contrast=" + extremeContrast + ", brightness=" + extremeBrightness);
        return highContrastBitmap;
    }

    // Helper method to write logs to a file
    private void logToFile(String level, String tag, String message) {
        try {
            File externalFilesDir = reactContext.getExternalFilesDir(null);
            if (externalFilesDir == null) {
                Log.e(TAG, "External files directory is null. Cannot write logs to file.");
                return;
            }
            File logFile = new File(externalFilesDir, LOG_FILE_NAME);

            if (!hasLoggedPath) {
                // Log the absolute path to Logcat and to the file itself once
                String absPath = logFile.getAbsolutePath();
                Log.i(TAG, "Log file path: " + absPath); // Log to Logcat
                
                // Write path to the file itself
                FileWriter fwInit = new FileWriter(logFile, true);
                BufferedWriter bwInit = new BufferedWriter(fwInit);
                bwInit.write(String.format("[%s] %s/%s: %s\\n", 
                    new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.getDefault()).format(new Date()), 
                    "INFO", TAG, "Log file started. Path: " + absPath));
                bwInit.newLine();
                bwInit.close();
                fwInit.close();
                hasLoggedPath = true;
            }
            
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.getDefault());
            String timestamp = sdf.format(new Date());
            
            FileWriter fw = new FileWriter(logFile, true); // true for append
            BufferedWriter bw = new BufferedWriter(fw);
            bw.write(String.format("[%s] %s/%s: %s\\n", timestamp, level, tag, message));
            bw.newLine();
            bw.close();
            fw.close();
        } catch (IOException e) {
            Log.e(TAG, "Error writing to log file", e);
        }
    }

    // Wrapper for Log.d
    private void d(String tag, String message) {
        Log.d(tag, message);
        logToFile("DEBUG", tag, message);
    }

    // Wrapper for Log.e
    private void e(String tag, String message) {
        Log.e(tag, message);
        logToFile("ERROR", tag, message);
    }
    
    private void e(String tag, String message, Throwable tr) {
        Log.e(tag, message, tr);
        logToFile("ERROR", tag, message + (tr != null ? "\\n" + Log.getStackTraceString(tr) : ""));
    }

    // Wrapper for Log.w
    private void w(String tag, String message) {
        Log.w(tag, message);
        logToFile("WARN", tag, message);
    }

    public MLKitBarcodeScannerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        d(TAG, "MLKitBarcodeScannerModule initialized");
        BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_PDF417) // Only PDF417 for driver licenses - maximum speed
                .build();
        barcodeScanner = BarcodeScanning.getClient(options);
        d(TAG, "🚀 BarcodeScanner configured for PDF417-ONLY (driver licenses) - MAXIMUM SPEED");
    }

    @NonNull
    @Override
    public String getName() {
        return "MLKitBarcodeScanner";
    }

    @ReactMethod
    public void processFrame(String base64FrameData, int width, int height, String orientation, Promise promise) {
        d(TAG, "🚀 FAST processFrame: " + width + "x" + height + " Orientation: " + orientation); 
        
        Bitmap bitmap = null;
        try {
            long startTime = System.currentTimeMillis();
            
            byte[] imageData = Base64.decode(base64FrameData, Base64.DEFAULT);
            d(TAG, "🚀 Decoded base64, length: " + imageData.length);

            if (imageData.length == 0) {
                promise.reject("BASE64_ERROR", "Invalid base64 data");
                return;
            }

            bitmap = BitmapFactory.decodeByteArray(imageData, 0, imageData.length);
            if (bitmap == null) {
                promise.reject("BITMAP_ERROR", "Failed to create Bitmap");
                return;
            }
            
            d(TAG, "🚀 Bitmap created: " + bitmap.getWidth() + "x" + bitmap.getHeight());

            final int rotationDegrees;
            switch (orientation) {
                case "portrait": rotationDegrees = 0; break;
                case "landscape-left": rotationDegrees = 90; break;
                case "portrait-upside-down": rotationDegrees = 180; break;
                case "landscape-right": rotationDegrees = 270; break;
                default: rotationDegrees = 0; break;
            }

            // SPEED OPTIMIZATION: Try original image first (fastest path)
            InputImage originalImage = InputImage.fromBitmap(bitmap, rotationDegrees);
            d(TAG, "🚀 Trying original image first for speed...");

            final Bitmap finalBitmap = bitmap;
            final long finalStartTime = startTime;
            
            barcodeScanner.process(originalImage)
                    .addOnSuccessListener(barcodes -> {
                        long processingTime = System.currentTimeMillis() - finalStartTime;
                        d(TAG, "🚀 ORIGINAL SUCCESS: Found " + barcodes.size() + " barcodes in " + processingTime + "ms");
                        
                        if (!barcodes.isEmpty()) {
                            // SUCCESS with original image - fastest path!
                            StringBuilder result = new StringBuilder();
                            for (Barcode barcode : barcodes) {
                                result.append(barcode.getRawValue()).append("\\\\n");
                                d(TAG, "🚀 BARCODE FOUND (Original): " + barcode.getFormat() + " = " + barcode.getRawValue());
                            }
                            promise.resolve(result.toString().trim());
                            cleanupBitmap(finalBitmap);
                            return;
                        }
                        
                        // No barcodes found, try enhanced version
                        d(TAG, "🚀 Original failed, trying enhanced image...");
                        tryEnhancedScanning(finalBitmap, rotationDegrees, promise, finalStartTime);
                    })
                    .addOnFailureListener(exc -> {
                        d(TAG, "🚀 Original image failed, trying enhanced: " + exc.getMessage());
                        tryEnhancedScanning(finalBitmap, rotationDegrees, promise, finalStartTime);
                    });

        } catch (Exception e) {
            e(TAG, "🚀 ERROR: " + e.getMessage(), e);
            promise.reject("FRAME_ERROR", e.getMessage());
            if (bitmap != null && !bitmap.isRecycled()) {
                bitmap.recycle();
            }
        }
    }
    
    // Fallback enhanced scanning only when original fails
    private void tryEnhancedScanning(Bitmap originalBitmap, int rotationDegrees, Promise promise, long startTime) {
        try {
            // Create enhanced bitmap only when needed
            Bitmap enhancedBitmap = enhanceBitmapForPDF417(originalBitmap);
            InputImage enhancedImage = InputImage.fromBitmap(enhancedBitmap, rotationDegrees);
            
            barcodeScanner.process(enhancedImage)
                    .addOnSuccessListener(barcodes -> {
                        long processingTime = System.currentTimeMillis() - startTime;
                        d(TAG, "🚀 ENHANCED SUCCESS: Found " + barcodes.size() + " barcodes in " + processingTime + "ms");
                        
                        if (!barcodes.isEmpty()) {
                            StringBuilder result = new StringBuilder();
                            for (Barcode barcode : barcodes) {
                                result.append(barcode.getRawValue()).append("\\\\n");
                                d(TAG, "🚀 BARCODE FOUND (Enhanced): " + barcode.getFormat() + " = " + barcode.getRawValue());
                            }
                            promise.resolve(result.toString().trim());
                        } else {
                            // Last resort: high contrast
                            d(TAG, "🚀 Enhanced failed, trying high contrast...");
                            tryHighContrastScanning(originalBitmap, enhancedBitmap, rotationDegrees, promise, startTime);
                            return; // Don't cleanup yet
                        }
                        cleanupBitmaps(originalBitmap, enhancedBitmap, null);
                    })
                    .addOnFailureListener(exc -> {
                        d(TAG, "🚀 Enhanced failed, trying high contrast: " + exc.getMessage());
                        tryHighContrastScanning(originalBitmap, enhancedBitmap, rotationDegrees, promise, startTime);
                    });
        } catch (Exception e) {
            e(TAG, "🚀 Enhanced scanning error: " + e.getMessage(), e);
            promise.reject("ENHANCED_ERROR", e.getMessage());
            cleanupBitmap(originalBitmap);
        }
    }
    
    // Final fallback: high contrast scanning
    private void tryHighContrastScanning(Bitmap originalBitmap, Bitmap enhancedBitmap, int rotationDegrees, Promise promise, long startTime) {
        try {
            Bitmap highContrastBitmap = createHighContrastBitmap(originalBitmap);
            InputImage highContrastImage = InputImage.fromBitmap(highContrastBitmap, rotationDegrees);
            
            barcodeScanner.process(highContrastImage)
                    .addOnSuccessListener(barcodes -> {
                        long processingTime = System.currentTimeMillis() - startTime;
                        d(TAG, "🚀 HIGH CONTRAST RESULT: Found " + barcodes.size() + " barcodes in " + processingTime + "ms");
                        
                        if (!barcodes.isEmpty()) {
                            StringBuilder result = new StringBuilder();
                            for (Barcode barcode : barcodes) {
                                result.append(barcode.getRawValue()).append("\\\\n");
                                d(TAG, "🚀 BARCODE FOUND (High Contrast): " + barcode.getFormat() + " = " + barcode.getRawValue());
                            }
                            promise.resolve(result.toString().trim());
                        } else {
                            d(TAG, "🚀 No barcodes found in any variant");
                            promise.resolve("No barcodes found");
                        }
                        cleanupBitmaps(originalBitmap, enhancedBitmap, highContrastBitmap);
                    })
                    .addOnFailureListener(exc -> {
                        long processingTime = System.currentTimeMillis() - startTime;
                        e(TAG, "🚀 All scanning methods failed in " + processingTime + "ms: " + exc.getMessage());
                        promise.reject("SCAN_ERROR", exc.getMessage());
                        cleanupBitmaps(originalBitmap, enhancedBitmap, highContrastBitmap);
                    });
        } catch (Exception e) {
            e(TAG, "🚀 High contrast scanning error: " + e.getMessage(), e);
            promise.reject("HIGH_CONTRAST_ERROR", e.getMessage());
            cleanupBitmaps(originalBitmap, enhancedBitmap, null);
        }
    }
    
    // Simplified cleanup methods
    private void cleanupBitmap(Bitmap bitmap) {
        if (bitmap != null && !bitmap.isRecycled()) {
            bitmap.recycle();
        }
    }
    
    // Helper method to clean up bitmaps safely
    private void cleanupBitmaps(Bitmap bitmap, Bitmap enhancedBitmap, Bitmap highContrastBitmap) {
        if (bitmap != null && !bitmap.isRecycled()) {
            bitmap.recycle();
        }
        if (enhancedBitmap != null && !enhancedBitmap.isRecycled()) {
            enhancedBitmap.recycle();
        }
        if (highContrastBitmap != null && !highContrastBitmap.isRecycled()) {
            highContrastBitmap.recycle();
        }
    }
}
