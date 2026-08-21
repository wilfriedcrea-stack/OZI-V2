import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { OziProvider } from './context/OziContext.tsx';
import './index.css';

// Enregistrement du Service Worker pour le support PWA / APK
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OziProvider>
      <App />
    </OziProvider>
  </StrictMode>,
);
