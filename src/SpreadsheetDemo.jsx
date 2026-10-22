import React, { useRef, useState } from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';

export default function SpreadsheetDemo() {
  const spreadsheetRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const handleOpenSpreadsheet = async () => {
    setIsOpen(true);
    
    // Wait for component to mount
    setTimeout(async () => {
      if (spreadsheetRef.current) {
        try {
          await spreadsheetRef.current.openFromJson({ file: 'spreadsheetData.json' });
          console.log('✓ Spreadsheet loaded - Cycle:', cycleCount + 1);
        } catch (error) {
          console.error('Error loading spreadsheet:', error);
        }
      }
    }, 100);
  };

  const handleCloseSpreadsheet = () => {
    setIsOpen(false);
    setCycleCount(cycleCount + 1);
    console.log('✓ Spreadsheet destroyed - Cycle:', cycleCount + 1);
    console.log('→ Now run Chrome DevTools > Memory > Collect garbage to check heap size');
  };

  const handleForceGC = () => {
    // This button text instructs the user to run GC manually in DevTools
    console.log('To check memory: Press F12 → Memory tab → Click "Collect garbage" button');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Spreadsheet Memory Leak Demo</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Open Chrome DevTools: Press F12</li>
          <li>Go to Memory tab</li>
          <li>Click "Collect garbage" button to get baseline heap size</li>
          <li>Click "Open Spreadsheet" button below</li>
          <li>After spreadsheet loads, click "Collect garbage" again and note the heap size</li>
          <li>Click "Close Spreadsheet" button</li>
          <li>Click "Collect garbage" and check if memory is released</li>
          <li>Repeat steps 4-7 multiple times to see memory growth</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          Cycle: {cycleCount}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenSpreadsheet}
            disabled={isOpen}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: isOpen ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isOpen ? 'not-allowed' : 'pointer'
            }}
          >
            Open Spreadsheet
          </button>

          <button
            onClick={handleCloseSpreadsheet}
            disabled={!isOpen}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: !isOpen ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: !isOpen ? 'not-allowed' : 'pointer'
            }}
          >
            Close Spreadsheet
          </button>

          <button
            onClick={handleForceGC}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Instructions for GC
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '5px', 
          padding: '10px',
          backgroundColor: '#fff'
        }}>
          <SpreadsheetComponent ref={spreadsheetRef} />
        </div>
      )}

      {!isOpen && (
        <div style={{
          padding: '20px',
          backgroundColor: '#e8f5e9',
          borderRadius: '5px',
          textAlign: 'center',
          color: '#2e7d32'
        }}>
          Spreadsheet is closed. Click "Open Spreadsheet" to load data.
        </div>
      )}
    </div>
  );
}
