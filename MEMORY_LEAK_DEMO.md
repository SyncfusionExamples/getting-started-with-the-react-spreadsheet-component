# Spreadsheet Memory Leak Demo

## Overview
This demo setup is designed to replicate and help diagnose the memory leak issue reported by customers where the Spreadsheet component memory is not released after component destruction.

## What Was Created

### 1. **SpreadsheetDemo.jsx** (`src/SpreadsheetDemo.jsx`)
A React component that provides:
- **Open Spreadsheet Button**: Dynamically loads a large spreadsheet (250,000 rows × 10 columns)
- **Close Spreadsheet Button**: Destroys the spreadsheet component
- **Cycle Counter**: Tracks how many open/close cycles have been performed
- **On-screen Instructions**: Step-by-step guide for memory profiling

### 2. **Large Test Data** (`public/spreadsheetData.json`)
- Contains 250,000 rows with 10 columns each
- File size: ~95 MB
- Mimics the customer's real-world scenario with large workbooks
- Loads using the `openFromJson()` method

### 3. **Updated App** (`src/App.jsx`)
- Modified to use the SpreadsheetDemo component
- Maintains the same project structure

## How to Use

### Memory Profiling Steps:
1. **Open Chrome DevTools**: Press `F12`
2. **Navigate to Memory tab**: Click on the "Memory" tab
3. **Take baseline snapshot**:
   - Click "Collect garbage" button
   - Note the JS heap size
4. **Open Spreadsheet**: Click the "Open Spreadsheet" button
5. **After load - Check memory increase**:
   - Wait for the spreadsheet to fully load (~2-3 seconds)
   - Click "Collect garbage"
   - Note the new heap size (should increase by ~400-500 MB)
6. **Close Spreadsheet**: Click the "Close Spreadsheet" button
7. **Check memory release**:
   - Click "Collect garbage"
   - Compare heap size to baseline
   - If memory leak exists, heap size will remain high
8. **Repeat**: Steps 4-7 multiple times to see cumulative memory growth

### Expected Behavior

**Memory Leak (Current Issue)**:
- Baseline heap: ~206 MB
- After load: ~692 MB (+486 MB)
- After destroy + GC: ~680 MB (memory NOT released)
- Each cycle adds 450-500 MB that accumulates

**Expected Behavior (After Fix)**:
- Baseline heap: ~206 MB
- After load: ~692 MB (+486 MB)
- After destroy + GC: ~210 MB (memory properly released)

## Files Modified

```
/public
  ├── spreadsheetData.json          (NEW - 95 MB test data, 250k rows)
  └── [existing files]

/src
  ├── SpreadsheetDemo.jsx           (NEW - Main demo component)
  ├── App.jsx                       (MODIFIED - Uses SpreadsheetDemo)
  ├── App.css                       (MODIFIED - Added styling)
  └── [other existing files]
```

## Running the Demo

```bash
npm install
npm run dev
```

Then open your browser and follow the memory profiling steps above.

## Key Observations

When the memory leak exists:
- Heap snapshots will show destroyed `SpreadsheetComponent` instances still in memory
- Each destroyed instance retains ~380 MB of workbook data
- The `isDestroyed` flag will be `true` but memory is not released

## Notes

- The large test data file (95 MB) is included in version control. If using Git LFS is preferred, add `public/spreadsheetData.json` to `.gitattributes`
- The component unmounts and remounts on each open/close cycle to simulate the real-world scenario where users dynamically create/destroy spreadsheet components
- Monitor Chrome's memory warning - after several cycles, the browser tab may show high memory usage warnings
