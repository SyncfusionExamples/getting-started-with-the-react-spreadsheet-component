import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

let spreadsheet;

function handleExportXlsx() {
  if (spreadsheet) {
    spreadsheet.save({ url: 'https://services.syncfusion.com/js/api/spreadsheet/save', fileName: 'spreadsheet.xlsx' });
  }
}

export default function App() {
  return (
    <SpreadsheetComponent
      ref={(instance) => { spreadsheet = instance; }}
      created={() => {
        if (spreadsheet) {
          spreadsheet.addToolbarItems(
            [{ prefixIcon: 'e-icons e-download', tooltipText: 'Export as XLSX', text: 'Export XLSX', id: 'exportXlsx', click: handleExportXlsx }],
            2
          );
        }
      }}
    />
  );
}
const root = createRoot(document.getElementById('root'));
root.render(<App />);