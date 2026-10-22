# Syncfusion Spreadsheet Memory Leak Fix Guide

## Problem Statement

Users experience a critical memory leak when using the Syncfusion Spreadsheet component in React applications. When spreadsheet instances are destroyed, their memory is never released, causing the browser tab to crash after multiple open/close cycles.

### Symptoms
- JS heap grows by ~450-500 MB with each open/close cycle
- Memory is not released after component destruction
- Destroyed component instances remain in heap snapshots with `isDestroyed = true`
- Browser tab crashes when JS heap reaches ~4 GB limit

### Root Causes

1. **Event Listeners Not Removed**: Syncfusion Spreadsheet registers many event listeners that are not properly removed on component destruction
2. **Data References Retained**: Internal sheet data, rows, and workbook data maintain references even after component unmount
3. **Missing Destroy Cleanup**: The component's destroy method doesn't fully clean up all internal state
4. **DOM References**: Element references and cached calculations are not cleared

## Solution Overview

The fix involves implementing comprehensive cleanup in the component lifecycle, ensuring:

1. All event listeners are properly unregistered
2. Data references are explicitly nullified
3. Internal caches are cleared
4. The destroy method is called appropriately
5. DOM references are released

## Implementation Patterns

### Pattern 1: Basic SpreadsheetWrapper (Recommended for Most Cases)

Use `SpreadsheetWrapper` for straightforward cleanup:

```jsx
import { SpreadsheetWrapper } from './components/SpreadsheetWrapper';

export function MyComponent() {
  const [showSpreadsheet, setShowSpreadsheet] = React.useState(false);
  const ref = React.useRef(null);

  const handleOpen = () => {
    setShowSpreadsheet(true);
  };

  const handleClose = () => {
    setShowSpreadsheet(false);
  };

  return (
    <>
      <button onClick={handleOpen}>Open</button>
      <button onClick={handleClose}>Close</button>
      {showSpreadsheet && (
        <SpreadsheetWrapper
          ref={ref}
          openUrl="https://cdn.syncfusion.com/ej2/sample-data/spreadsheet/sample.xlsx"
          saveUrl="https://services.syncfusion.com/js/production/api/spreadsheet/save"
          height="600px"
          width="100%"
          onDestroyed={() => console.log('Cleanup complete')}
        />
      )}
    </>
  );
}
```

**Key Features:**
- Automatic event listener cleanup
- Data reference nullification
- Proper destroy method invocation
- Callback support for lifecycle events

### Pattern 2: Advanced SpreadsheetWithAdvancedCleanup (Complex Scenarios)

For applications with complex event handling:

```jsx
import { SpreadsheetWithAdvancedCleanup } from './components/SpreadsheetWithAdvancedCleanup';

export function ComplexComponent() {
  const handleCreated = (spreadsheet) => {
    console.log('Spreadsheet created:', spreadsheet);
  };

  return (
    <SpreadsheetWithAdvancedCleanup
      onCreated={handleCreated}
      onDestroyed={() => console.log('Cleanup complete')}
      height="600px"
      width="100%"
    />
  );
}
```

**Key Features:**
- Event listener tracking and cleanup
- Syncfusion-specific event handling
- Data cache clearing
- DOM reference cleanup

### Pattern 3: useSpreadsheetCleanup Hook

For more control:

```jsx
import { useSpreadsheetCleanup } from './components/SpreadsheetWithAdvancedCleanup';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

export function CustomComponent() {
  const { spreadsheetRef, cleanup, isDestroyed } = useSpreadsheetCleanup();

  const handleManualCleanup = () => {
    cleanup();
  };

  return (
    <>
      <SpreadsheetComponent ref={spreadsheetRef} />
      <button onClick={handleManualCleanup}>Cleanup</button>
      {isDestroyed && <p>Component cleaned up</p>}
    </>
  );
}
```

## Key Cleanup Operations

### 1. Event Listener Removal

```javascript
const events = [
  'created',
  'beforeOpen',
  'openComplete',
  'beforeSave',
  'saveComplete',
  'cellSave',
  'cellEditing',
  'cellEdit',
  'cellSelected',
  'selectionComplete',
];

events.forEach((event) => {
  try {
    spreadsheet.off(event);
  } catch (e) {
    // Silently ignore if event doesn't exist
  }
});
```

### 2. Data Reference Nullification

```javascript
// Clear sheet data
if (spreadsheet.sheets) {
  spreadsheet.sheets.forEach((sheet) => {
    if (sheet.rows) sheet.rows = [];
    if (sheet.columns) sheet.columns = [];
  });
}

// Clear workbook data
if (spreadsheet.workbookData) {
  spreadsheet.workbookData = null;
}

// Clear cached calculations
if (spreadsheet.cellModel) {
  spreadsheet.cellModel = null;
}
```

### 3. Destroy Method Invocation

```javascript
if (spreadsheet.destroy && typeof spreadsheet.destroy === 'function') {
  spreadsheet.destroy();
}
```

### 4. DOM Cleanup

```javascript
// Clear DOM content
if (spreadsheet.element) {
  spreadsheet.element.innerHTML = '';
}

// Clear references
spreadsheetRef.current = null;
```

## Memory Leak Reproduction Test

The repository includes a reproduction test component (`MemoryLeakReproduction.jsx`) that allows you to:

1. Monitor memory usage in real-time
2. Open and close spreadsheets multiple times
3. Force garbage collection
4. Observe memory growth patterns

### Running the Test

1. Install Chrome with garbage collection flag:
   ```bash
   chrome --js-flags="--expose-gc"
   ```

2. Start the development server
3. Open Chrome DevTools → Memory tab
4. Take initial heap snapshot
5. Use the test UI to open/close spreadsheets
6. Take heap snapshots after each cycle
7. Compare memory usage

### Expected Results

**Before Fix:**
- Memory grows by ~450-500 MB per cycle
- Destroyed instances remain in heap
- Garbage collection has minimal effect

**After Fix:**
- Memory usage returns to baseline after cleanup
- Destroyed instances are eligible for garbage collection
- No significant memory growth across cycles

## Memory Tracking Utilities

### MemoryTracker Class

```javascript
import { MemoryTracker } from './utils/memoryTracker';

const tracker = new MemoryTracker('MyTest');

// Take snapshots
tracker.snapshot('Before load');
// ... do work ...
tracker.snapshot('After load');

// Get measurements
const measurements = tracker.getMeasurements();
measurements.forEach(m => {
  console.log(`${m.label}: ${MemoryTracker.formatBytes(m.usedJSHeapSize)}`);
});

// Print report
tracker.printReport();
```

### Global Tracker

```javascript
import { initGlobalMemoryTracker, getGlobalMemoryTracker } from './utils/memoryTracker';

// Initialize at app start
initGlobalMemoryTracker('App');

// Use anywhere
const tracker = getGlobalMemoryTracker();
tracker.snapshot('Event occurred');
```

## Best Practices

### 1. Always Unmount Spreadsheet

```jsx
// ✓ Good: Conditional rendering ensures unmount
const [showSpreadsheet, setShowSpreadsheet] = React.useState(false);

return showSpreadsheet ? <SpreadsheetWrapper /> : null;

// ✗ Bad: Just hiding with CSS
return <div style={{ display: showSpreadsheet ? 'block' : 'none' }}><SpreadsheetWrapper /></div>;
```

### 2. Use Refs for Access

```jsx
// ✓ Good: Ref provides direct access for cleanup
const ref = React.useRef(null);

// In cleanup effect:
ref.current?.getInstance()?.destroy();

// ✗ Bad: Using state for component instances
const [spreadsheet, setSpreadsheet] = React.useState(null);
```

### 3. Implement useEffect Cleanup

```jsx
// ✓ Good: Cleanup function ensures resources are released
React.useEffect(() => {
  return () => {
    // Cleanup code
  };
}, []);

// ✗ Bad: No cleanup on unmount
React.useEffect(() => {
  // Setup code
}, []);
```

### 4. Handle Large Datasets Efficiently

```jsx
// ✓ Good: Use virtualization for large datasets
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

<SpreadsheetComponent
  allowScrolling={true}
  allowResizing={true}
  showHeaders={true}
  // Large data handled by Syncfusion's internal virtualization
/>

// ✗ Bad: Loading entire dataset at once without virtualization
const allRows = generateMillionRows(); // Don't do this
```

### 5. Monitor in Development

```javascript
// Development-only memory monitoring
if (process.env.NODE_ENV === 'development') {
  const tracker = new MemoryTracker('Dev Monitor');
  
  window.addEventListener('beforeunload', () => {
    tracker.printReport();
  });
}
```

## Testing Checklist

- [ ] Spreadsheet opens successfully
- [ ] Large workbook (10k+ rows) loads without issues
- [ ] Spreadsheet closes cleanly
- [ ] Memory returns to baseline after garbage collection
- [ ] No console errors or warnings during open/close
- [ ] Multiple open/close cycles don't cause memory growth
- [ ] Destroyed instances are garbage collected
- [ ] No detached DOM nodes remain
- [ ] Event listeners are properly removed

## Debugging Tips

### Check for Retained References

```javascript
// In Chrome DevTools Console:
// 1. Take heap snapshot
// 2. Search for "Detached" nodes
// 3. Look for SpreadsheetComponent instances
// 4. Check retainers to identify what's holding references
```

### Enable Verbose Logging

```javascript
// Add to SpreadsheetWrapper
const handleDestroyed = () => {
  console.group('Spreadsheet Cleanup');
  console.log('✓ Event listeners removed');
  console.log('✓ Data references cleared');
  console.log('✓ DOM cleaned');
  console.log('✓ Destroy method called');
  console.groupEnd();
};
```

### Monitor Heap Growth

```javascript
window.addEventListener('beforeunload', () => {
  if (performance.memory) {
    console.table({
      'Heap Limit': MemoryTracker.formatBytes(performance.memory.jsHeapSizeLimit),
      'Heap Used': MemoryTracker.formatBytes(performance.memory.usedJSHeapSize),
      'Heap Total': MemoryTracker.formatBytes(performance.memory.totalJSHeapSize),
    });
  }
});
```

## Version Compatibility

- **Syncfusion**: 34.2.5+ (@syncfusion/ej2-react-spreadsheet)
- **React**: 16.8+ (requires Hooks support)
- **Browser**: Chrome, Firefox, Safari (with Memory API support)

## Additional Resources

- [Syncfusion Spreadsheet Documentation](https://www.syncfusion.com/react-components/react-spreadsheet)
- [Chrome DevTools Memory Profiler](https://developer.chrome.com/docs/devtools/memory-problems/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Memory Leak Detection Best Practices](https://web.dev/bfcache/)

## Support

For issues or questions about the memory leak fix:

1. Run the reproduction test to confirm the issue
2. Check the browser console for error messages
3. Verify all cleanup operations in SpreadsheetWrapper
4. Check that event listeners are being properly removed
5. Ensure destroy method is called in cleanup phase

## Summary

The memory leak fix involves implementing comprehensive cleanup patterns in the Spreadsheet component lifecycle. By properly removing event listeners, clearing data references, and calling the destroy method, you can ensure that spreadsheet instances are fully garbage collected after component destruction, preventing memory growth and browser crashes.

Key components:
- **SpreadsheetWrapper**: Basic wrapper with automatic cleanup
- **SpreadsheetWithAdvancedCleanup**: Advanced patterns for complex scenarios
- **useSpreadsheetCleanup**: Custom hook for fine-grained control
- **MemoryTracker**: Utilities for monitoring and debugging
- **MemoryLeakReproduction**: Test component for validation
