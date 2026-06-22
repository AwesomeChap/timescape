import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MONUMENTS, MY_POSITION, SALZBURG_CENTER, nearestMonuments } from './monuments';
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

const ME_ICON = L.divIcon({
  className: '',
  html: '<span class="map-landing__me"><span class="map-landing__me-dot"></span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function MapLanding({ onEnterTimescape }) {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const markersRef = useRef({});
  const [menuOpen, setMenuOpen] = useState(false);
  const nearest = useMemo(() => nearestMonuments(MY_POSITION, 3), []);
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

      markersRef.current[monument.id] = marker;
    });

    // Fixed "you are here" blue dot — non-interactive so it never blocks pins.
    L.marker([MY_POSITION.lat, MY_POSITION.lng], {
      icon: ME_ICON,
      interactive: false,
      keyboard: false,
      title: MY_POSITION.label,
    }).addTo(map);

    // Reset-view control — stacks under the +/- zoom buttons (both top-left).
    const resetControl = L.control({ position: 'topleft' });
    resetControl.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control map-landing__reset');
      const link = L.DomUtil.create('a', '', container);
      link.href = '#';
      link.setAttribute('role', 'button');
      link.title = 'Reset view';
      link.setAttribute('aria-label', 'Reset map view');
      link.innerHTML =
        '<svg viewBox="0 0 24 24" class="map-landing__reset-icon" aria-hidden="true">' +
        '<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>' +
        '</svg>';
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(link, 'click', L.DomEvent.stop).on(link, 'click', () => {
        map.setView([SALZBURG_CENTER.lat, SALZBURG_CENTER.lng], SALZBURG_CENTER.zoom);
      });
      return container;
    };
    resetControl.addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      markersRef.current = {};
    };
  }, []);

  const handleNearestClick = (monument) => {
    if (monument.available) {
      enterRef.current?.();
      return;
    }
    const map = mapRef.current;
    if (map) {
      map.flyTo([monument.lat, monument.lng], Math.max(map.getZoom(), 16), {
        duration: 0.8,
      });
    }
    markersRef.current[monument.id]?.openPopup();
    setMenuOpen(false);
  };

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

      <div className="map-landing__nearest">
        <button
          type="button"
          className="map-landing__nearest-btn"
          aria-expanded={menuOpen}
          aria-controls="map-nearest-panel"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Nearest sights
        </button>
        {menuOpen && (
          <div id="map-nearest-panel" className="map-landing__nearest-panel">
            {nearest.map((monument) => (
              <button
                key={monument.id}
                type="button"
                className="map-landing__nearest-item"
                onClick={() => handleNearestClick(monument)}
              >
                <span className="map-landing__nearest-name">{monument.name}</span>
                <span className="map-landing__nearest-dist">
                  {formatDistance(monument.distance)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
