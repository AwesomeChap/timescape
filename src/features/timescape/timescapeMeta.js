export const MONUMENT = {
  name: 'Salzburg Cathedral',
  location: 'Domplatz, Salzburg, Austria',
};

/** Discrete timeline stops — present → past (left to right). */
export const TIMELINE_ERAS = [
  {
    id: 'present',
    year: 2024,
    label: 'Present day',
    description:
      'The same Baroque cathedral as before the war, plus Domplatz visitor pavilion, crypt canopy, glazed connector, kiosk, and forecourt railings.',
  },
  {
    id: 'post-war',
    year: 1945,
    label: 'After the air raid',
    description:
      'On 16 October 1944 a bomb pierced the crossing dome. The vault caved inward, burying the choir under timber and stone.',
  },
  {
    id: 'pre-war',
    year: 1938,
    label: 'Before the war',
    description:
      'Early Baroque cathedral by Santino Solari — twin west towers, copper crossing dome, triple portal, and Domplatz forecourt.',
  },
];

/** Shared morph duration — canvas + timeline track stay in sync. */
export const MORPH_DURATION_MS = 1800;

/** Smoothstep easing for morph transitions. */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
