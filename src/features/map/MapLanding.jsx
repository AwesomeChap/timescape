import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MONUMENTS, SALZBURG_CENTER } from './monuments';
import { useTheme } from '@/shared/theme/ThemeContext';

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

// Teardrop location pin (tip at bottom-centre). Body inherits `currentColor`,
// with a plain dot inside.
const PIN_BODY =
  '<path d="M12 1.5C7.86 1.5 4.5 4.86 4.5 9c0 5.4 6.6 12.5 6.88 12.8a.85.85 0 0 0 1.24 0C12.9 21.5 19.5 14.4 19.5 9c0-4.14-3.36-7.5-7.5-7.5z"/>';
const DOT = '<circle class="map-landing__marker-glyph" cx="12" cy="9" r="2.4"/>';

function buildIcon(available) {
  const variant = available
    ? 'map-landing__marker--available'
    : 'map-landing__marker--coming-soon';
  const svg =
    '<svg class="map-landing__marker-svg" viewBox="0 0 24 24" aria-hidden="true">' +
    PIN_BODY +
    DOT +
    '</svg>';
  return L.divIcon({
    className: '',
    html: `<span class="map-landing__marker ${variant}">${svg}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 31],
    popupAnchor: [0, -28],
  });
}

export default function MapLanding({ onEnterTimescape }) {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  // Keep the latest callback without re-running the map-init effect.
  const enterRef = useRef(onEnterTimescape);
  enterRef.current = onEnterTimescape;

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return undefined;

    const map = L.map(containerRef.current, {
      center: [SALZBURG_CENTER.lat, SALZBURG_CENTER.lng],
      zoom: SALZBURG_CENTER.zoom,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;

    MONUMENTS.forEach((monument) => {
      const marker = L.marker([monument.lat, monument.lng], {
        icon: buildIcon(monument.available),
        title: monument.name,
        riseOnHover: true,
      }).addTo(map);

      if (monument.available) {
        marker.on('click', () => enterRef.current?.());
      } else {
        marker.bindPopup(
          `<span class="map-landing__popup-title">${monument.name}</span>` +
            '<span class="map-landing__popup-soon">Coming soon</span>'
        );
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, []);

  // Swap the tile layer when the theme changes (light = standard OSM, dark = CARTO).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) {
      tileRef.current.remove();
      tileRef.current = null;
    }
    tileRef.current = L.tileLayer(TILE_URLS[theme] || TILE_URLS.dark, {
      maxZoom: 19,
    }).addTo(map);
  }, [theme]);

  return (
    <div className="map-landing">
      <div ref={containerRef} className="map-landing__canvas" />
      <p className="map-landing__hint">Select Mozart&rsquo;s Wohnhaus to begin</p>
    </div>
  );
}
