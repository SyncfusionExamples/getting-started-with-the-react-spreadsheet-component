import * as React from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import { SpreadsheetWrapper } from './SpreadsheetWrapper';

/**
 * Advanced demo showing openFromJson usage with SpreadsheetWrapper
 * Demonstrates loading JSON data and memory management
 */
export function JsonDataDemo() {
  const [showSpreadsheet, setShowSpreadsheet] = React.useState(false);
  const [dataSource, setDataSource] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [openCount, setOpenCount] = React.useState(0);
  const spreadsheetRef = React.useRef(null);

  /**
   * Load JSON data from the public folder
   */
  const loadJsonData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/SpreadsheetData.json');
      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${response.statusText}`);
      }
      const data = await response.json();
      setDataSource(data);
      console.log('JSON data loaded successfully:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading JSON:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Open spreadsheet with JSON data
   */
  const handleOpenWithJson = React.useCallback(async () => {
    if (!dataSource) {
      await loadJsonData();
    }
    setShowSpreadsheet(true);
    setOpenCount((prev) => prev + 1);
    console.log(`Opened spreadsheet with JSON #${openCount + 1}`);
  }, [dataSource, loadJsonData, openCount]);

  /**
   * Close spreadsheet
   */
  const handleClose = React.useCallback(() => {
    setShowSpreadsheet(false);
    console.log(`Closed spreadsheet #${openCount}`);
  }, [openCount]);

  /**
   * Load JSON data when mounted
   */
  React.useEffect(() => {
    loadJsonData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📊 Spreadsheet with JSON Data</h1>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px',
          border: '1px solid #4a90e2',
        }}
      >
        <h3>ℹ️ About This Demo</h3>
        <p>
          This demo shows how to load a Spreadsheet component from JSON data using the{' '}
          <code>openFromJson()</code> method. The JSON file contains product data with
          formulas for total calculations.
        </p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          The JSON file is located at: <code>/public/SpreadsheetData.json</code>
        </p>
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffc107',
        }}
      >
        <h3>📋 Status</h3>
        <p>
          <strong>Spreadsheet:</strong> {showSpreadsheet ? '✓ Open' : '✗ Closed'}
        </p>
        <p>
          <strong>JSON Data:</strong>{' '}
          {loading
            ? '⏳ Loading...'
            : dataSource
              ? '✓ Loaded'
              : '✗ Not loaded'}
        </p>
        <p>
          <strong>Times Opened:</strong> {openCount}
        </p>
        {error && (
          <p style={{ color: '#d9534f', marginTop: '10px' }}>
            <strong>⚠️ Error:</strong> {error}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleOpenWithJson}
          disabled={showSpreadsheet || loading}
          style={{
            padding: '10px 20px',
            backgroundColor:
              showSpreadsheet || loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: showSpreadsheet || loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {loading ? '⏳ Loading...' : '📂 Open with JSON Data'}
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
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ✕ Close Spreadsheet
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        💡 <strong>Tip:</strong> Open Chrome DevTools → Memory tab to monitor memory usage.
        The memory should return to baseline after each close.
      </p>

      {showSpreadsheet && dataSource && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            marginTop: '20px',
          }}
        >
          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
            <strong>Spreadsheet Component (Height: 500px)</strong>
          </div>
          <div style={{ height: '500px', width: '100%' }}>
            <SpreadsheetJsonWrapper
              ref={spreadsheetRef}
              jsonData={dataSource}
              height="100%"
              width="100%"
              onCreated={(instance) => {
                console.log('Spreadsheet created with JSON data:', instance);
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

/**
 * Enhanced SpreadsheetWrapper that supports openFromJson
 */
const SpreadsheetJsonWrapper = React.forwardRef(
  ({ jsonData, onCreated, onDestroyed, height = '100%', width = '100%', ...props }, ref) => {
    const spreadsheetRef = React.useRef(null);
    const isDestroyingRef = React.useRef(false);

    React.useEffect(() => {
      const spreadsheet = spreadsheetRef.current;

      if (spreadsheet && jsonData) {
        // Load JSON data into spreadsheet
        setTimeout(() => {
          try {
            if (spreadsheet.openFromJson && typeof spreadsheet.openFromJson === 'function') {
              console.log('Loading JSON data into spreadsheet...');
              spreadsheet.openFromJson({ file: jsonData });
              console.log('JSON data loaded successfully');
            }
          } catch (error) {
            console.error('Error loading JSON into spreadsheet:', error);
          }

          if (onCreated && spreadsheet) {
            try {
              onCreated(spreadsheet);
            } catch (e) {
              console.warn('Error in onCreated callback:', e);
            }
          }
        }, 100);
      }

      // Cleanup on unmount
      return () => {
        if (isDestroyingRef.current) return;
        isDestroyingRef.current = true;

        try {
          const instance = spreadsheetRef.current;
          if (!instance) return;

          // Remove event listeners
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
            'beforeDelete',
            'deleteComplete',
            'beforeInsert',
            'insertComplete',
          ];

          events.forEach((eventName) => {
            try {
              if (instance.off && typeof instance.off === 'function') {
                instance.off(eventName);
              }
            } catch (e) {
              // Ignore
            }
          });

          // Clear data references
          if (instance.sheets && Array.isArray(instance.sheets)) {
            instance.sheets.forEach((sheet) => {
              if (sheet.rows) sheet.rows = [];
              if (sheet.columns) sheet.columns = [];
              sheet.rows = null;
              sheet.columns = null;
            });
            instance.sheets = null;
          }

          // Destroy component
          try {
            if (instance.destroy && typeof instance.destroy === 'function') {
              instance.destroy();
            }
          } catch (e) {
            console.warn('Warning during destroy:', e.message);
          }

          spreadsheetRef.current = null;

          if (onDestroyed) {
            try {
              onDestroyed();
            } catch (e) {
              console.warn('Error in onDestroyed callback:', e);
            }
          }
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      };
    }, [jsonData, onCreated, onDestroyed]);

    React.useImperativeHandle(ref, () => ({
      getInstance: () => spreadsheetRef.current,
    }));

    return (
      <SpreadsheetComponent
        ref={spreadsheetRef}
        height={height}
        width={width}
        {...props}
      />
    );
  }
);

SpreadsheetJsonWrapper.displayName = 'SpreadsheetJsonWrapper';
