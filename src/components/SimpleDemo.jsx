import * as React from 'react';
import { SpreadsheetWrapper } from './SpreadsheetWrapper';

/**
 * Simple demo showing basic usage of SpreadsheetWrapper
 * This component demonstrates the memory leak fix in action
 */
export function SimpleDemo() {
  const [showSpreadsheet, setShowSpreadsheet] = React.useState(false);
  const [openCount, setOpenCount] = React.useState(0);
  const spreadsheetRef = React.useRef(null);

  const handleOpen = React.useCallback(() => {
    setShowSpreadsheet(true);
    setOpenCount((prev) => prev + 1);
    console.log(`Opened spreadsheet #${openCount + 1}`);
  }, [openCount]);

  const handleClose = React.useCallback(() => {
    setShowSpreadsheet(false);
    console.log(`Closed spreadsheet #${openCount}`);
  }, [openCount]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Spreadsheet Component - Memory Leak Fix</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>
          <strong>Status:</strong> {showSpreadsheet ? '✓ Open' : '✗ Closed'}
        </p>
        <p>
          <strong>Times Opened:</strong> {openCount}
        </p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleOpen}
          disabled={showSpreadsheet}
          style={{
            padding: '10px 20px',
            backgroundColor: showSpreadsheet ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: showSpreadsheet ? 'not-allowed' : 'pointer',
          }}
        >
          Open Spreadsheet
        </button>

        <button
          onClick={handleClose}
          disabled={!showSpreadsheet}
          style={{
            padding: '10px 20px',
            backgroundColor: !showSpreadsheet ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !showSpreadsheet ? 'not-allowed' : 'pointer',
          }}
        >
          Close Spreadsheet
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#666' }}>
        💡 <strong>Tip:</strong> Open Chrome DevTools → Memory tab to monitor memory usage while opening and closing the
        spreadsheet. The memory should return to baseline after each close.
      </p>

      {showSpreadsheet && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          <div style={{ height: '500px', width: '100%' }}>
            <SpreadsheetWrapper
              ref={spreadsheetRef}
              openUrl="https://cdn.syncfusion.com/ej2/sample-data/spreadsheet/sample.xlsx"
              height="100%"
              width="100%"
              onCreated={(instance) => {
                console.log('Spreadsheet created:', instance);
              }}
              onDestroyed={() => {
                console.log('Spreadsheet destroyed - all resources cleaned up');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
