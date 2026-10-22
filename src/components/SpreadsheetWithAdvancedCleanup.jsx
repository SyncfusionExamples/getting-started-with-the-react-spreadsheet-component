import * as React from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

/**
 * Advanced Spreadsheet component with comprehensive cleanup patterns
 * Addresses known memory leak issues in Syncfusion Spreadsheet
 */
export function SpreadsheetWithAdvancedCleanup({
  onCreated,
  onDestroyed,
  workbookConfig,
  ...props
}) {
  const spreadsheetRef = React.useRef(null);
  const eventListenersRef = React.useRef(new Map());
  const dataRef = React.useRef(null);

  /**
   * Register event listener with tracking for cleanup
   */
  const registerEventListener = React.useCallback((element, event, handler) => {
    if (!element) return;

    const key = `${event}`;
    if (!eventListenersRef.current.has(key)) {
      eventListenersRef.current.set(key, []);
    }

    element.addEventListener(event, handler);
    eventListenersRef.current.get(key).push({ element, handler });
  }, []);

  /**
   * Register Syncfusion event with tracking
   */
  const registerSyncfusionEvent = React.useCallback(
    (spreadsheet, eventName, handler) => {
      if (!spreadsheet || !spreadsheet.on) return;

      spreadsheet.on(eventName, handler);

      const key = `syncfusion:${eventName}`;
      if (!eventListenersRef.current.has(key)) {
        eventListenersRef.current.set(key, []);
      }

      eventListenersRef.current.get(key).push({
        spreadsheet,
        eventName,
        handler,
      });
    },
    []
  );

  /**
   * Comprehensive cleanup function
   */
  const performCleanup = React.useCallback(() => {
    const spreadsheet = spreadsheetRef.current;

    if (!spreadsheet) return;

    try {
      // 1. Remove all registered event listeners
      eventListenersRef.current.forEach((listeners, key) => {
        if (key.startsWith('syncfusion:')) {
          // Syncfusion events
          listeners.forEach(({ spreadsheet: sp, eventName, handler }) => {
            if (sp && sp.off) {
              try {
                sp.off(eventName, handler);
              } catch (e) {
                console.warn(`Failed to remove Syncfusion event: ${eventName}`, e);
              }
            }
          });
        } else {
          // DOM events
          listeners.forEach(({ element, handler }) => {
            if (element) {
              element.removeEventListener(key, handler);
            }
          });
        }
      });

      eventListenersRef.current.clear();

      // 2. Clear data references
      if (spreadsheet.sheets && Array.isArray(spreadsheet.sheets)) {
        spreadsheet.sheets.forEach((sheet) => {
          if (sheet.rows) {
            sheet.rows = [];
          }
          if (sheet.columns) {
            sheet.columns = [];
          }
          if (sheet.data) {
            sheet.data = [];
          }
        });
        spreadsheet.sheets = [];
      }

      // 3. Clear workbook data
      if (spreadsheet.workbookData) {
        spreadsheet.workbookData = null;
      }

      // 4. Clear calculated data caches
      if (spreadsheet.cellModel) {
        spreadsheet.cellModel = null;
      }

      // 5. Clear internal references
      if (spreadsheet._parser) {
        spreadsheet._parser = null;
      }

      // 6. Clear DOM references
      if (spreadsheet.element) {
        spreadsheet.element.innerHTML = '';
      }

      // 7. Call destroy if available
      if (typeof spreadsheet.destroy === 'function') {
        try {
          spreadsheet.destroy();
        } catch (e) {
          console.warn('Error calling spreadsheet destroy:', e);
        }
      }

      // 8. Clear local reference
      dataRef.current = null;
    } catch (error) {
      console.error('Error during advanced cleanup:', error);
    }
  }, []);

  /**
   * Handle spreadsheet creation
   */
  const handleCreated = React.useCallback(
    (args) => {
      const spreadsheet = spreadsheetRef.current;

      if (!spreadsheet) return;

      // Store data reference
      dataRef.current = {
        sheets: spreadsheet.sheets,
        workbookData: spreadsheet.workbookData,
      };

      // Set up common event handlers with cleanup tracking
      const commonEvents = [
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

      commonEvents.forEach((eventName) => {
        registerSyncfusionEvent(spreadsheet, eventName, (event) => {
          // Event handler placeholder
        });
      });

      // Call user callback
      if (onCreated) {
        onCreated(spreadsheet);
      }
    },
    [registerSyncfusionEvent, onCreated]
  );

  /**
   * Cleanup on unmount
   */
  React.useEffect(() => {
    return () => {
      performCleanup();

      if (onDestroyed) {
        onDestroyed();
      }
    };
  }, [performCleanup, onDestroyed]);

  return (
    <SpreadsheetComponent
      ref={spreadsheetRef}
      created={handleCreated}
      {...props}
    />
  );
}

/**
 * Custom hook for Spreadsheet lifecycle management
 */
export function useSpreadsheetCleanup() {
  const spreadsheetRef = React.useRef(null);
  const [isDestroyed, setIsDestroyed] = React.useState(false);

  const cleanup = React.useCallback(() => {
    const spreadsheet = spreadsheetRef.current;

    if (!spreadsheet || isDestroyed) return;

    try {
      // Remove all event listeners
      const eventNames = [
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

      eventNames.forEach((eventName) => {
        try {
          spreadsheet.off(eventName);
        } catch (e) {
          // Silently ignore
        }
      });

      // Clear references
      if (spreadsheet.sheets) {
        spreadsheet.sheets.forEach((sheet) => {
          sheet.rows = [];
          sheet.columns = [];
        });
        spreadsheet.sheets = [];
      }

      // Destroy
      if (typeof spreadsheet.destroy === 'function') {
        spreadsheet.destroy();
      }

      setIsDestroyed(true);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, [isDestroyed]);

  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    spreadsheetRef,
    cleanup,
    isDestroyed,
  };
}
