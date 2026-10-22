import * as React from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

/**
 * Wrapper component for Syncfusion Spreadsheet with proper cleanup
 * Fixes memory leak issues by ensuring all event listeners and data are properly released
 */
export const SpreadsheetWrapper = React.forwardRef(
  (
    {
      onCreated,
      onDestroyed,
      height = '100%',
      width = '100%',
      ...props
    },
    ref
  ) => {
    const spreadsheetRef = React.useRef(null);
    const isDestroyingRef = React.useRef(false);

    React.useEffect(() => {
      const spreadsheet = spreadsheetRef.current;

      // Call the created callback if provided
      if (onCreated && spreadsheet) {
        try {
          onCreated(spreadsheet);
        } catch (e) {
          console.warn('Error in onCreated callback:', e);
        }
      }

      // Cleanup on unmount
      return () => {
        if (isDestroyingRef.current) {
          return; // Already cleaning up
        }

        isDestroyingRef.current = true;

        try {
          const instance = spreadsheetRef.current;
          if (!instance) {
            return;
          }

          // First, remove all event listeners safely
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
            'beforeHyperlinkClick',
            'hyperlinkClick',
            'beforeCellRender',
            'cellRender',
            'beforeImageLoad',
            'imageLoad',
          ];

          events.forEach((eventName) => {
            try {
              if (instance.off && typeof instance.off === 'function') {
                instance.off(eventName);
              }
            } catch (e) {
              // Silently ignore if event doesn't exist or off fails
            }
          });

          // Clear data references carefully
          try {
            if (instance.sheets && Array.isArray(instance.sheets)) {
              instance.sheets.forEach((sheet) => {
                try {
                  if (sheet && typeof sheet === 'object') {
                    if (sheet.rows) {
                      sheet.rows = [];
                    }
                    if (sheet.columns) {
                      sheet.columns = [];
                    }
                  }
                } catch (e) {
                  // Ignore errors clearing individual sheet
                }
              });
            }
          } catch (e) {
            // Ignore errors clearing sheets
          }

          // Clear workbook data
          try {
            if (instance.workbookData !== undefined) {
              instance.workbookData = null;
            }
          } catch (e) {
            // Ignore errors clearing workbook data
          }

          // Finally, destroy the component if possible
          try {
            if (instance.destroy && typeof instance.destroy === 'function') {
              instance.destroy();
            }
          } catch (e) {
            console.warn('Warning during spreadsheet destroy:', e.message);
          }

          // Clear the ref
          spreadsheetRef.current = null;
        } catch (error) {
          console.warn('Warning during spreadsheet cleanup:', error.message);
        } finally {
          // Call the destroyed callback if provided
          if (onDestroyed) {
            try {
              onDestroyed();
            } catch (e) {
              console.warn('Error in onDestroyed callback:', e);
            }
          }

          isDestroyingRef.current = false;
        }
      };
    }, [onCreated, onDestroyed]);

    // Expose ref methods
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

SpreadsheetWrapper.displayName = 'SpreadsheetWrapper';
