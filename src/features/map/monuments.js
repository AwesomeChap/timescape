import { MONUMENT } from '@/features/timescape/timescapeMeta';

/** Initial map framing — central Salzburg, all sights in view. */
export const SALZBURG_CENTER = { lat: 47.8, lng: 13.045, zoom: 15 };

/**
 * Sightseeing monuments shown on the landing map. Only `available` monuments
 * open an experience on click; the rest surface a "Coming soon" popup.
 * `mozart-wohnhaus` reuses the canonical name/location from timescapeMeta.
 */
export const MONUMENTS = [
  {
    id: 'mozart-wohnhaus',
    name: MONUMENT.name,
    lat: 47.8019,
    lng: 13.044,
    available: true,
    blurb: MONUMENT.location,
  },
  {
    id: 'hohensalzburg',
    name: 'Hohensalzburg Fortress',
    lat: 47.7949,
    lng: 13.0476,
    available: false,
    blurb: 'Festungsberg, Salzburg, Austria',
  },
  {
    id: 'cathedral',
    name: 'Salzburg Cathedral',
    lat: 47.7979,
    lng: 13.047,
    available: false,
    blurb: 'Domplatz, Salzburg, Austria',
  },
  {
    id: 'mirabell',
    name: 'Mirabell Palace & Gardens',
    lat: 47.8055,
    lng: 13.0419,
    available: false,
    blurb: 'Mirabellplatz, Salzburg, Austria',
  },
  {
    id: 'geburtshaus',
    name: "Mozart's Birthplace",
    lat: 47.8003,
    lng: 13.0436,
    available: false,
    blurb: 'Getreidegasse 9, Salzburg, Austria',
  },
];
