import { MONUMENT } from '@/features/timescape/timescapeMeta';

/** Initial map framing — central Salzburg, all sights in view. */
export const SALZBURG_CENTER = { lat: 47.8, lng: 13.045, zoom: 15 };

/** Fixed "you are here" demo position (near Residenzplatz / Mozartplatz). */
export const MY_POSITION = { lat: 47.7986, lng: 13.046, label: 'You are here' };

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

/** Great-circle distance between two {lat,lng} points, in metres (haversine). */
export function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** The `count` monuments closest to `position`, each annotated with `distance` (m). */
export function nearestMonuments(position, count = 3) {
  return MONUMENTS.map((m) => ({ ...m, distance: distanceMeters(position, m) }))
    .sort((x, y) => x.distance - y.distance)
    .slice(0, count);
}
