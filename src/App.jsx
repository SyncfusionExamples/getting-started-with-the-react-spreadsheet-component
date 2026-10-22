import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { SimpleDemo } from './components/SimpleDemo';
import { JsonDataDemo } from './components/JsonDataDemo';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('simple');

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('simple')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'simple' ? '#28a745' : '#f0f0f0',
              color: activeTab === 'simple' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === 'simple' ? 'bold' : 'normal',
            }}
          >
            📌 Simple Demo (openUrl)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'json' ? '#28a745' : '#f0f0f0',
              color: activeTab === 'json' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === 'json' ? 'bold' : 'normal',
            }}
          >
            📊 JSON Data Demo (openFromJson)
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {activeTab === 'simple' && <SimpleDemo />}
        {activeTab === 'json' && <JsonDataDemo />}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);