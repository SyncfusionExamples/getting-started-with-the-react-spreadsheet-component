import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './App.css';

function SpreadsheetDemo() {
  const [spreadsheetData, setSpreadsheetData] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const spreadsheetRef = React.useRef(null);

  const handleOpenSpreadsheet = async () => {
    try {
      const response = await fetch('/spreadsheetData.json');
      const data = await response.json();
      setSpreadsheetData(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Error loading spreadsheet data:', error);
    }
  };

  const handleCloseSpreadsheet = () => {
    if (spreadsheetRef.current) {
      spreadsheetRef.current.destroy();
    }
    setIsOpen(false);
    setSpreadsheetData(null);
  };

  return (
    <div className="app-container">
      <div className="controls">
        <button 
          onClick={handleOpenSpreadsheet}
          disabled={isOpen}
          className="btn btn-primary"
        >
          Create Spreadsheet
        </button>
        <button 
          onClick={handleCloseSpreadsheet}
          disabled={!isOpen}
          className="btn btn-danger"
        >
          Destroy Spreadsheet
        </button>
      </div>

      {isOpen && (
        <div className="spreadsheet-wrapper">
          <SpreadsheetComponent 
            ref={spreadsheetRef}
            allowOpen={true}
            openFromJson={{ file: spreadsheetData }}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <SpreadsheetDemo />;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
