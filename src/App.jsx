import * as React from 'react';
import { createRoot } from 'react-dom/client';
import SpreadsheetDemo from './SpreadsheetDemo';
import './App.css';

export default function App() {
  return <SpreadsheetDemo />;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);