import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Lenis from '@studio-freight/lenis';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize smooth scrolling with Lenis
try {
  const lenis = new (Lenis as any)({
    smoothWheel: true,
    smoothTouch: false,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
} catch (e) {
  // fail silently if Lenis is unavailable
}
