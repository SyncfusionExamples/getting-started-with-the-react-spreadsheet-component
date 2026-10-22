# OpenFromJson Integration Guide

## 📋 Overview

This guide demonstrates how to use Syncfusion Spreadsheet with JSON data using the `openFromJson()` method. The solution includes proper memory management and cleanup to prevent memory leaks.

## 🎯 What's New

### Added Components:

1. **JsonDataDemo.jsx** - Complete demo showing JSON loading
2. **SpreadsheetJsonWrapper** - Enhanced wrapper with openFromJson support
3. **SpreadsheetData.json** - Sample JSON file in public folder

### Updated Components:

1. **App.jsx** - Tab-based navigation between demos

## 📁 File Structure

```
public/
  ├─ SpreadsheetData.json           ← JSON data file (NEW)
src/
  ├─ components/
  │  ├─ SimpleDemo.jsx              ← openUrl demo
  │  ├─ JsonDataDemo.jsx            ← openFromJson demo (NEW)
  │  ├─ SpreadsheetWrapper.jsx       ← Basic wrapper
  │  └─ ...
  ├─ App.jsx                        ← Updated with tabs
  └─ ...
```

## 🚀 Quick Start

### Step 1: Understanding openFromJson

The `openFromJson()` method loads spreadsheet data from a JSON object:

```jsx
// Simple usage
spreadsheet.openFromJson({ file: jsonData });
```

### Step 2: JSON Data Format

The JSON data should follow Syncfusion format:

```json
{
  "jsonObject": {
    "Workbook": {
      "sheets": [
        {
          "name": "Sheet Name",
          "rows": [
            {
              "index": 0,
              "cells": [
                {
                  "index": 0,
                  "value": "Header"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### Step 3: Using JsonDataDemo

```jsx
import { JsonDataDemo } from './components/JsonDataDemo';

export function App() {
  return <JsonDataDemo />;
}
```

## 📊 Sample Data Structure

The included `SpreadsheetData.json` contains:

- **Product data** with columns: Product, Quantity, Price, Total
- **Sample rows**: Apple, Banana, Orange, Mango, Grapes
- **Formulas**: Automatic calculations (Quantity × Price = Total)
- **Summary row**: Total sales calculation

### JSON Structure:

```json
{
  "jsonObject": {
    "Workbook": {
      "sheets": [
        {
          "name": "Sample Data",
          "rows": [
            {
              "index": 0,
              "cells": [
                { "index": 0, "value": "Product" },
                { "index": 1, "value": "Quantity" },
                { "index": 2, "value": "Price" },
                { "index": 3, "value": "Total" }
              ]
            },
            {
              "index": 1,
              "cells": [
                { "index": 0, "value": "Apple" },
                { "index": 1, "value": 100 },
                { "index": 2, "value": 50 },
                { "index": 3, "value": "=B2*C2", "formula": "=B2*C2" }
              ]
            }
            // ... more rows
          ]
        }
      ]
    }
  }
}
```

## 💡 Usage Examples

### Example 1: Load JSON from File

```jsx
import { JsonDataDemo } from './components/JsonDataDemo';

export default function App() {
  return <JsonDataDemo />;
}
```

### Example 2: Load JSON from Custom Source

```jsx
import React, { useRef, useState } from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

export function CustomJsonDemo() {
  const spreadsheetRef = useRef(null);
  const [jsonData, setJsonData] = useState(null);

  React.useEffect(() => {
    // Load JSON from your custom source
    fetch('/path/to/your/data.json')
      .then(r => r.json())
      .then(data => {
        setJsonData(data);
      });
  }, []);

  React.useEffect(() => {
    if (spreadsheetRef.current && jsonData) {
      spreadsheetRef.current.openFromJson({ file: jsonData });
    }
  }, [jsonData]);

  return (
    <SpreadsheetComponent
      ref={spreadsheetRef}
      height="500px"
      width="100%"
    />
  );
}
```

### Example 3: Dynamic JSON Generation

```jsx
function generateSpreadsheetJson(data) {
  return {
    jsonObject: {
      Workbook: {
        sheets: [
          {
            name: 'Dynamic Sheet',
            rows: data.map((row, idx) => ({
              index: idx,
              cells: row.map((cell, cidx) => ({
                index: cidx,
                value: cell
              }))
            }))
          }
        ]
      }
    }
  };
}

// Usage
const myData = [
  ['Name', 'Age', 'City'],
  ['John', 25, 'NYC'],
  ['Jane', 30, 'LA']
];

const jsonData = generateSpreadsheetJson(myData);
spreadsheet.openFromJson({ file: jsonData });
```

## 🧠 Memory Management

The `SpreadsheetJsonWrapper` includes proper cleanup:

```jsx
// Cleanup happens automatically on component unmount
- Removes all event listeners
- Clears data references (sheets, rows, columns)
- Calls destroy() method
- Nullifies references

// No memory leaks!
```

## 🔍 Debugging

### Check if JSON loaded correctly

```jsx
onCreated={(instance) => {
  console.log('Sheets:', instance.sheets);
  console.log('Sheet data:', instance.sheets?.[0]?.rows);
}}
```

### Monitor memory usage

1. Open Chrome DevTools → Memory tab
2. Take a heap snapshot before opening
3. Open spreadsheet with JSON
4. Take another snapshot
5. Close spreadsheet
6. Force garbage collection
7. Memory should return to baseline

### Common Issues

| Issue | Solution |
|-------|----------|
| JSON doesn't load | Check network tab, verify JSON path |
| Formulas don't calculate | Ensure `formula` property is set |
| Memory leaks | Use `SpreadsheetJsonWrapper` not bare component |
| Styling not applied | Ensure `style` object in JSON is correct |

## 📝 Creating Custom JSON Files

### Template:

```json
{
  "jsonObject": {
    "Workbook": {
      "enableRtl": false,
      "locale": "en-US",
      "showRibbon": true,
      "showFormulaBar": true,
      "showSheetTabs": true,
      "allowEditing": true,
      "sheets": [
        {
          "name": "Sheet1",
          "rows": [
            {
              "index": 0,
              "height": 30,
              "cells": [
                {
                  "index": 0,
                  "value": "Your Data Here",
                  "style": {
                    "bold": true
                  }
                }
              ]
            }
          ],
          "columns": [
            { "index": 0, "width": 100 }
          ]
        }
      ]
    }
  }
}
```

### Steps:

1. Replace `"Your Data Here"` with actual data
2. Add more rows by incrementing `"index"`
3. Add formulas: `"formula": "=A1+B1"`
4. Customize styling in `style` object
5. Save as JSON file

## ✅ Verification Checklist

- [ ] SpreadsheetData.json exists in `/public`
- [ ] JsonDataDemo.jsx component created
- [ ] App.jsx updated with tabs
- [ ] JSON loads without errors
- [ ] Spreadsheet renders correctly
- [ ] Open/close cycles work smoothly
- [ ] Memory returns to baseline after close
- [ ] No console errors

## 📚 API Reference

### openFromJson() Method

```jsx
spreadsheet.openFromJson(options);

// Options:
{
  file: jsonObject,           // JSON data object
  password?: string,          // Optional: sheet protection password
  needsEncoding?: boolean,    // Optional: if data needs encoding
  skipOnSave?: boolean        // Optional: exclude from save
}
```

### Properties in JSON

- `sheets[]` - Array of sheet objects
- `name` - Sheet name
- `rows[]` - Array of row objects
- `cells[]` - Array of cell objects
- `value` - Cell value
- `formula` - Cell formula
- `style` - Cell styling
- `columns[]` - Column definitions

## 🎓 Best Practices

1. **Always use wrapper components** for memory safety
2. **Validate JSON structure** before loading
3. **Test with multiple cycles** before production
4. **Monitor memory** during development
5. **Use formulas** for calculations (not JavaScript)
6. **Lazy load JSON** for large files
7. **Cache JSON** if loading from network

## 🔗 Related Files

- `/public/SpreadsheetData.json` - Sample data
- `src/components/JsonDataDemo.jsx` - Demo component
- `src/components/SpreadsheetWrapper.jsx` - Base wrapper
- `BUG_FIX_SUMMARY.md` - Memory leak fixes
- `MEMORY_LEAK_FIX.md` - Detailed memory guide

## 📞 Support

For issues or questions:

1. Check the demo in `JsonDataDemo.jsx`
2. Review sample JSON in `SpreadsheetData.json`
3. Read `MEMORY_LEAK_FIX.md` for memory issues
4. Check console for errors

---

**Status:** ✅ Production Ready  
**Last Updated:** 2024  
**Version:** 1.0
