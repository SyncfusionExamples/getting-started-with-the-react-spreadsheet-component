import * as React from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './App.css';

let spreadsheetInstance = null;

async function createSpreadsheet() {
  const response = await fetch('/spreadsheetData.json');
  const data = await response.json();
  
  spreadsheetContainer.innerHTML = '<div id="spreadsheet"></div>';
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(document.getElementById('spreadsheet'));
  
  root.render(
    <SpreadsheetComponent 
      ref={(ref) => { spreadsheetInstance = ref; }}
      created={() => {
        if (spreadsheetInstance) {
          spreadsheetInstance.openFromJson({ file: data });
        }
      }}
    />
  );
}

function destroySpreadsheet() {
  if (spreadsheetInstance) {
    spreadsheetInstance.destroy();
  }
  spreadsheetContainer.innerHTML = '';
}

let spreadsheetContainer = null;

export default function App() {
  return (
    <div className="app-container">
      <div className="controls">
        <button onClick={createSpreadsheet} className="btn btn-primary">
          Create Spreadsheet
        </button>
        <button onClick={destroySpreadsheet} className="btn btn-danger">
          Destroy Spreadsheet
        </button>
      </div>
      <div className="spreadsheet-wrapper" ref={(ref) => { spreadsheetContainer = ref; }}></div>
    </div>
  );
}
