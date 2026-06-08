export { TIMELINE_ERAS } from './eras';

export const MONUMENT = {
  name: 'Mozart Wohnhaus',
  location: 'Makartplatz 8 (Tanzmeisterhaus), Salzburg',
};

/** Shared morph duration — canvas + timeline track stay in sync. */
export const MORPH_DURATION_MS = 1800;

/** Smoothstep easing for morph transitions. */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
