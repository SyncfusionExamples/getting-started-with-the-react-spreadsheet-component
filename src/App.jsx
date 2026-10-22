import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { SimpleDemo } from './components/SimpleDemo';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <SimpleDemo />
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);