import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { OziProvider } from './context/OziContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OziProvider>
      <App />
    </OziProvider>
  </StrictMode>,
);

