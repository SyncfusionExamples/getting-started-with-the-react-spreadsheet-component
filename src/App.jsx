import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './App.css';

let spreadsheetRef = null;
let spreadsheetContainer = null;

async function createSpreadsheet() {
  const response = await fetch('/spreadsheetData.json');
  const data = await response.json();
  
  spreadsheetContainer.innerHTML = '<div id="spreadsheet"></div>';
  const root = createRoot(document.getElementById('spreadsheet'));
  root.render(
    <SpreadsheetComponent 
      ref={(ref) => { spreadsheetRef = ref; }}
      allowOpen={true}
      openFromJson={{ file: data }}
    />
  );
}

function destroySpreadsheet() {
  if (spreadsheetRef) {
    spreadsheetRef.destroy();
  }
  spreadsheetContainer.innerHTML = '';
}

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
