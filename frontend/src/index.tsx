// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; // Ensure Tailwind directives are imported

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount the React application.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* BrowserRouter enables routing capabilities for the entire App */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);