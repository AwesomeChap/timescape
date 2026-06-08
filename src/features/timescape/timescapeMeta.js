/**
 * Structural timeline data — present → past (left to right).
 * User-facing strings (monument name/location, era labels + descriptions) live in
 * the i18n locale files (src/i18n/locales/*.json), keyed by era id.
 */
export const TIMELINE_ERAS = [
  { id: 'era1994', year: 1994 },
  { id: 'era1952', year: 1952 },
  { id: 'era1944', year: 1944 },
  { id: 'era1685', year: 1685 },
  { id: 'era1617', year: 1617 },
];

/** Shared morph duration — canvas + timeline track stay in sync. */
export const MORPH_DURATION_MS = 1800;

/** Smoothstep easing for morph transitions. */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
