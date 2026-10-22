import * as React from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

/**
 * Wrapper component for Syncfusion Spreadsheet with proper cleanup
 * Fixes memory leak issues by ensuring all event listeners and data are properly released
 */
export const SpreadsheetWrapper = React.forwardRef(
  (
    {
      workbookData,
      onCreated,
      onDestroyed,
      height = '100%',
      width = '100%',
      ...props
    },
    ref
  ) => {
    const spreadsheetRef = React.useRef(null);

    React.useEffect(() => {
      const spreadsheet = spreadsheetRef.current;

      // Call the created callback if provided
      if (onCreated && spreadsheet) {
        onCreated(spreadsheet);
      }

      // Cleanup on unmount
      return () => {
        try {
          if (spreadsheet) {
            // Remove all event listeners
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

            events.forEach((event) => {
              try {
                spreadsheet.off(event);
              } catch (e) {
                // Silently ignore if event doesn't exist
              }
            });

            // Clear references to data
            if (spreadsheet.sheets) {
              spreadsheet.sheets.forEach((sheet) => {
                if (sheet.rows) {
                  sheet.rows = [];
                }
                if (sheet.columns) {
                  sheet.columns = [];
                }
              });
            }

            // Clear workbook data
            if (spreadsheet.workbookData) {
              spreadsheet.workbookData = null;
            }

            // Destroy the component if it has a destroy method
            if (spreadsheet.destroy && typeof spreadsheet.destroy === 'function') {
              spreadsheet.destroy();
            }

            // Clear the ref
            spreadsheetRef.current = null;
          }

          // Call the destroyed callback if provided
          if (onDestroyed) {
            onDestroyed();
          }
        } catch (error) {
          console.error('Error during spreadsheet cleanup:', error);
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
