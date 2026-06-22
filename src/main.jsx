import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import AppRoot from './AppRoot';
import PixelBlinkBackground from '@/shared/background/PixelBlinkBackground';
import SiteChrome from '@/components/SiteChrome';
import { ThemeProvider } from '@/shared/theme/ThemeContext';
import './styles/main.scss';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="app-shell">
      <PixelBlinkBackground className="pixel-blink-bg--visible" enabled />
      <div className="app-content-layer">
        <ThemeProvider>
          <SiteChrome />
          <AppRoot />
        </ThemeProvider>
      </div>
    </div>
  </React.StrictMode>
);
