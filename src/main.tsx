
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * RISOLUZIONE ERRORE SAFARI "Load failed" / "FetchEvent.respondWith"
 * Molti problemi di Safari iOS con le PWA sono dovuti a Service Worker corrotti.
 * Questo blocco assicura che eventuali Service Worker problematici vengano rimossi al caricamento.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  }).catch((err) => {
    console.error('Errore durante il reset del Service Worker:', err);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Impossibile trovare l'elemento root nel documento.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
