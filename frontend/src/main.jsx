import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import './index.css';

console.log('[main.jsx] Starting React app mount...');

const rootElement = document.getElementById('root');
console.log('[main.jsx] Root element:', rootElement);

if (!rootElement) {
  console.error('[main.jsx] ERROR: #root element not found in DOM!');
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red;"><h1>Mount Error</h1><p>Root element #root not found in HTML.</p></div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('[main.jsx] React root created, rendering...');
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log('[main.jsx] Render complete');
  } catch (e) {
    console.error('[main.jsx] Render error:', e);
    rootElement.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red;"><h1>React Render Error</h1><pre>' + e.stack + '</pre></div>';
  }
}