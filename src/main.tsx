import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';
import './lib/firebase.ts';

window.onerror = function (message, source, lineno, colno, error) {
  if (!message || message === 'Script error.' || message.toString().includes('Script error')) {
    return true; // Ignore third-party / cross-origin ad script errors
  }
  return false;
};

window.addEventListener('error', (event) => {
  if (!event.message || event.message === 'Script error.' || event.message?.includes('Script error')) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason === 'Script error.' || event.reason?.message?.includes('Script error')) {
    event.preventDefault();
  } else {
    console.warn('Unhandled promise rejection caught:', event.reason);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);



