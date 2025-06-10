# PDF417 Barcode Scanner Test Guide

## 🧪 Testing Your PDF417 Scanner

Your React Native Vision Camera barcode scanner is now ready for testing! Here's how to verify it works correctly:

### 1. Test with Online Generated PDF417 Codes

First, test with simple PDF417 codes to verify basic functionality:

**Test URLs:**
- https://barcode.tec-it.com/en/PDF417 (Generate custom PDF417 codes)
- https://www.free-barcode-generator.net/pdf417/ (Another PDF417 generator)

**Test Data Examples:**
```
Test 1: "HELLO WORLD"
Test 2: "123456789"
Test 3: "PDF417 TEST DATA"
Test 4: Your name and address
```

### 2. Driver's License PDF417 Format

Driver's licenses use AAMVA (American Association of Motor Vehicle Administrators) format:

**Typical Structure:**
```
@ANSI 636000120002DL00410178ZA03290015DLDAQG12345678
DBA01012020
DACS12345678
DADEN
DAALAST,FIRST,MIDDLE
DAG123 MAIN ST
DAICITY
DAJST
DAK12345  
DARD
DASO
```

**Key Fields:**
- `@ANSI`: Header
- `DBA`: Expiration date
- `DACS`: Last name
- `DBA`: First name
- `DAG`: Address
- `DAJ`: State

### 3. Testing Procedure

1. **Launch the app** on your Android device
2. **Check permissions** - ensure camera access is granted
3. **Point camera** at a PDF417 barcode
4. **Watch debug logs** in Metro/React Native logs
5. **Check file logs** on device at:
   ```
   /storage/emulated/0/Android/data/com.barcodescannerapp/files/mlkit_scanner_logs.txt
   ```

### 4. Debug Information to Look For

**In Metro Logs:**
```
🔍 DEBUG: Available formats for device
🔍 DEBUG: Selected format: [resolution details]
🎯 Frame data length: [bytes]
🎯 Processing time: [ms] ms
🎯 Barcode Scan Result: [detected data]
```

**In Device File Logs:**
```
[TIMESTAMP] DEBUG/MLKitBarcodeScanner: processFrame called with base64 data
[TIMESTAMP] DEBUG/MLKitBarcodeScanner: Bitmap created: [width]x[height]
[TIMESTAMP] DEBUG/MLKitBarcodeScanner: Enhanced bitmap created
[TIMESTAMP] DEBUG/MLKitBarcodeScanner: PDF417 found: [detected value]
```

### 5. Test Images Saved

The app automatically saves test images for inspection:
- `test_frame_original.jpg` - Original camera frame
- `test_frame_enhanced.jpg` - Enhanced contrast version
- `test_frame_high_contrast.jpg` - High contrast version

**Location:** `/storage/emulated/0/Android/data/com.barcodescannerapp/files/`

### 6. Troubleshooting Tips

**If no barcodes are detected:**
1. **Check lighting** - ensure good, even lighting
2. **Verify focus** - ensure barcode is in focus
3. **Check distance** - try different distances from barcode
4. **Verify barcode quality** - ensure barcode is clear and not damaged
5. **Check orientation** - try different angles

**If app crashes:**
1. Check Metro logs for JavaScript errors
2. Check Android Studio logs for native errors
3. Verify permissions are granted
4. Ensure build configuration is correct

**Performance issues:**
- Check processing time in logs (should be < 200ms)
- Verify camera resolution isn't too high for device
- Check memory usage

### 7. Expected Results

**Working Scanner Should:**
- ✅ Display camera preview
- ✅ Show debug information overlay
- ✅ Process frames smoothly (15-30 FPS)
- ✅ Detect PDF417 codes within 1-2 seconds
- ✅ Display alert with barcode content
- ✅ Save test images to device storage
- ✅ Generate comprehensive logs

**Processing Times:**
- Frame crop: < 50ms
- Native processing: < 200ms
- Total: < 300ms per frame

### 8. Advanced Testing

**Custom Test Barcodes:**
Create PDF417 codes with various data types:
- Plain text
- JSON data
- Driver's license format
- Large data blocks (1KB+)

**Stress Testing:**
- Multiple barcodes in frame
- Different lighting conditions
- Various angles and distances
- Damaged or partially obscured codes

### 9. Next Steps

If basic testing works:
1. Test with real driver's licenses
2. Optimize image preprocessing if needed
3. Add custom UI elements
4. Implement barcode data parsing
5. Add error handling for edge cases

---

## 📱 Quick Test Checklist

- [ ] App builds and runs successfully
- [ ] Camera preview displays
- [ ] Debug overlay shows information
- [ ] Test images are saved to device
- [ ] Logs are written to file
- [ ] Simple PDF417 codes are detected
- [ ] Alert shows barcode content
- [ ] No crashes or errors

**Happy Testing!** 🎉

Your PDF417 scanner is now ready for real-world use with driver's licenses and other PDF417 barcodes.
