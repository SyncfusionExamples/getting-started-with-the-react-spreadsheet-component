import * as React from 'react';
import { SpreadsheetWrapper } from './SpreadsheetWrapper';
import { generateLargeWorkbookData } from '../utils/workbookGenerator';
import { MemoryTracker } from '../utils/memoryTracker';

/**
 * Component to reproduce the memory leak issue with Syncfusion Spreadsheet
 * Allows opening and closing spreadsheets to observe memory behavior
 */
export function MemoryLeakReproduction() {
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = React.useState(false);
  const [cycleCount, setCycleCount] = React.useState(0);
  const [workbookData, setWorkbookData] = React.useState(null);
  const [memoryTracker] = React.useState(
    () => new MemoryTracker('Spreadsheet Memory Test')
  );
  const [measurements, setMeasurements] = React.useState([]);
  const spreadsheetRef = React.useRef(null);

  // Take initial memory measurement
  React.useEffect(() => {
    memoryTracker.snapshot('Initial');
    setMeasurements([...memoryTracker.getMeasurements()]);
  }, []);

  const handleGenerateAndOpenSpreadsheet = React.useCallback(() => {
    console.log(`Opening spreadsheet cycle ${cycleCount + 1}...`);
    memoryTracker.snapshot(`Before open cycle ${cycleCount + 1}`);

    // Generate large workbook (simulate 10,000 rows x 10 columns)
    const data = generateLargeWorkbookData(10000, 10);
    setWorkbookData(data);
    setIsSpreadsheetOpen(true);

    setTimeout(() => {
      memoryTracker.snapshot(`After load cycle ${cycleCount + 1}`);
      setMeasurements([...memoryTracker.getMeasurements()]);
      console.log(
        `Spreadsheet opened. Heap: ${MemoryTracker.formatBytes(performance.memory?.usedJSHeapSize)}`
      );
    }, 100);
  }, [cycleCount]);

  const handleCloseSpreadsheet = React.useCallback(() => {
    console.log(`Closing spreadsheet cycle ${cycleCount + 1}...`);
    setIsSpreadsheetOpen(false);
    setWorkbookData(null);

    // Take measurement after close but before GC
    setTimeout(() => {
      memoryTracker.snapshot(`After close cycle ${cycleCount + 1}`);
      setMeasurements([...memoryTracker.getMeasurements()]);
      console.log(
        `Spreadsheet closed. Heap: ${MemoryTracker.formatBytes(performance.memory?.usedJSHeapSize)}`
      );
    }, 100);
  }, [cycleCount]);

  const handleCycle = React.useCallback(() => {
    if (!isSpreadsheetOpen) {
      handleGenerateAndOpenSpreadsheet();
    } else {
      handleCloseSpreadsheet();
      setCycleCount((c) => c + 1);
    }
  }, [isSpreadsheetOpen, handleGenerateAndOpenSpreadsheet, handleCloseSpreadsheet]);

  const handleMultipleCycles = React.useCallback(() => {
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 5) {
        clearInterval(interval);
        return;
      }

      if (!isSpreadsheetOpen) {
        handleGenerateAndOpenSpreadsheet();
        count++;
      } else {
        handleCloseSpreadsheet();
      }
    }, 2000);
  }, [isSpreadsheetOpen]);

  const handleForceGC = React.useCallback(() => {
    console.log('Forcing garbage collection...');
    if (window.gc) {
      window.gc();
      memoryTracker.snapshot('After GC');
      setMeasurements([...memoryTracker.getMeasurements()]);
      console.log(
        `After GC. Heap: ${MemoryTracker.formatBytes(performance.memory?.usedJSHeapSize)}`
      );
    } else {
      alert(
        'Garbage collection not available. Run Chrome with --js-flags="--expose-gc"'
      );
    }
  }, []);

  const handlePrintReport = React.useCallback(() => {
    memoryTracker.printReport();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Memory Leak Reproduction Test</h1>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
        }}
      >
        <h2>Instructions:</h2>
        <ol>
          <li>Open Chrome DevTools → Memory tab</li>
          <li>Click "Take Heap Snapshot" to establish baseline</li>
          <li>Click "Open Spreadsheet" below</li>
          <li>Note the memory increase</li>
          <li>Click "Close Spreadsheet"</li>
          <li>Click "Collect Garbage" to force GC</li>
          <li>Take another heap snapshot</li>
          <li>Repeat steps 3-7 several times</li>
          <li>Monitor if memory is released (expected) or retained (bug)</li>
        </ol>
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '5px',
          border: '1px solid #ffc107',
        }}
      >
        <h3>Status: {isSpreadsheetOpen ? '✓ Open' : '✗ Closed'}</h3>
        <p>Cycle Count: {cycleCount}</p>
        <p>
          Current Heap:{' '}
          {MemoryTracker.formatBytes(performance.memory?.usedJSHeapSize)}
        </p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleGenerateAndOpenSpreadsheet}
          disabled={isSpreadsheetOpen}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSpreadsheetOpen ? 'not-allowed' : 'pointer',
            opacity: isSpreadsheetOpen ? 0.6 : 1,
          }}
        >
          Open Spreadsheet
        </button>

        <button
          onClick={handleCloseSpreadsheet}
          disabled={!isSpreadsheetOpen}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !isSpreadsheetOpen ? 'not-allowed' : 'pointer',
            opacity: !isSpreadsheetOpen ? 0.6 : 1,
          }}
        >
          Close Spreadsheet
        </button>

        <button
          onClick={handleForceGC}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Collect Garbage
        </button>

        <button
          onClick={handleMultipleCycles}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Run 5 Cycles
        </button>

        <button
          onClick={handlePrintReport}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Print Report
        </button>
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '5px',
          border: '1px solid #ddd',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        <h3>Memory Measurements:</h3>
        {measurements.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Label</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Heap Size</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Time (ms)</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{m.label}</td>
                  <td style={{ padding: '8px' }}>
                    {MemoryTracker.formatBytes(m.usedJSHeapSize)}
                  </td>
                  <td style={{ padding: '8px' }}>{m.timeElapsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No measurements yet</p>
        )}
      </div>

      {isSpreadsheetOpen && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '5px',
          }}
        >
          <h3>Spreadsheet Component:</h3>
          <div style={{ height: '400px', width: '100%' }}>
            <SpreadsheetWrapper
              ref={spreadsheetRef}
              openUrl="https://cdn.syncfusion.com/ej2/sample-data/spreadsheet/sample.xlsx"
              height="100%"
              width="100%"
              onDestroyed={() => {
                console.log('Spreadsheet destroyed, memory should be released');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
