import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import PixelBlinkBackground from '@/shared/background/PixelBlinkBackground';
import SiteChrome from '@/components/SiteChrome';
import './styles/main.scss';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="app-shell">
      <PixelBlinkBackground className="pixel-blink-bg--visible" enabled />
      <div className="app-content-layer">
        <SiteChrome />
        <App />
      </div>
    </div>
  </React.StrictMode>
);
