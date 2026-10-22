import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryLeakReproduction } from './components/MemoryLeakReproduction';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MemoryLeakReproduction />
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);