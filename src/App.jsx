import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './App.css';

function SpreadsheetDemo() {
  const [spreadsheetData, setSpreadsheetData] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [cycleCount, setCycleCount] = React.useState(0);
  const [isControlsCollapsed, setIsControlsCollapsed] = React.useState(false);
  const spreadsheetRef = React.useRef(null);

  const handleOpenSpreadsheet = async () => {
    try {
      const response = await fetch('/spreadsheetData.json');
      const data = await response.json();
      setSpreadsheetData(data);
      setIsOpen(true);
      setCycleCount(prev => prev + 1);
      console.log(`✓ Spreadsheet opened (Cycle #${cycleCount + 1})`);
    } catch (error) {
      console.error('Error loading spreadsheet data:', error);
    }
  };

  const handleCloseSpreadsheet = () => {
    // Destroy the spreadsheet instance
    if (spreadsheetRef.current) {
      spreadsheetRef.current.destroy();
    }
    
    setIsOpen(false);
    setSpreadsheetData(null);
    console.log(`✓ Spreadsheet destroyed (Cycle #${cycleCount})`);
    console.log('Now: Force garbage collection in Chrome DevTools > Memory > Collect garbage');
  };

  const handleOpenFromJson = () => {
    if (spreadsheetRef.current && spreadsheetData) {
      spreadsheetRef.current.openFromJson({
        file: spreadsheetData
      });
      console.log('Workbook loaded with openFromJson');
    }
  };

  return (
    <div className="app-container">
      <div className={`controls ${isControlsCollapsed ? 'collapsed' : ''}`}>
        <h1>
          Spreadsheet Memory Leak Test
          <button 
            className="toggle-btn"
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            title={isControlsCollapsed ? 'Expand' : 'Collapse'}
          >
            {isControlsCollapsed ? '▼' : '▲'}
          </button>
        </h1>
        
        {!isControlsCollapsed && (
          <>
            <div className="status-info">
              <div className="status-item">
                <strong>Cycle Count:</strong>
                <span className="status-badge">{cycleCount}</span>
              </div>
              <div className="status-item">
                <strong>Status:</strong>
                <span className={`status-badge ${isOpen ? 'open' : 'closed'}`}>
                  {isOpen ? '🟢 Open' : '🔴 Closed'}
                </span>
              </div>
            </div>

            <div className="button-group">
              <button 
                onClick={handleOpenSpreadsheet}
                disabled={isOpen}
                className="btn btn-primary"
              >
                Open Spreadsheet
              </button>
              {isOpen && spreadsheetData && (
                <button 
                  onClick={handleOpenFromJson}
                  className="btn btn-secondary"
                >
                  Load Workbook (openFromJson)
                </button>
              )}
              <button 
                onClick={handleCloseSpreadsheet}
                disabled={!isOpen}
                className="btn btn-danger"
              >
                Close & Destroy
              </button>
            </div>

            <div className="info">
              <p className="instructions">Steps to check memory leak:</p>
              <ol>
                <li>Click "Open Spreadsheet" to load data</li>
                <li>Click "Load Workbook (openFromJson)" to open the workbook</li>
                <li>Click "Close & Destroy" to destroy the component</li>
                <li>Open Chrome DevTools → Memory → Take heap snapshot</li>
                <li>Click "Collect garbage" button</li>
                <li>Repeat steps 1-5 and check if memory grows indefinitely</li>
              </ol>
            </div>
          </>
        )}
      </div>

      {isOpen && (
        <div className="spreadsheet-wrapper">
          <SpreadsheetComponent 
            ref={spreadsheetRef}
            allowOpen={true}
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
