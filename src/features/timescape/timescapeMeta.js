export const MONUMENT = {
  name: 'Mozart Wohnhaus',
  location: 'Makartplatz 8 (Tanzmeisterhaus), Salzburg',
};

/** Discrete timeline stops — 1617 → 1996 (oldest to newest). */
export const TIMELINE_ERAS = [
  {
    id: '1617',
    year: 1617,
    label: 'Two Buildings',
    description:
      'First documented as two separate buildings on Hannibalplatz. The square was a social hub for Salzburg nobility.',
    photo: null,
  },
  {
    id: '1773',
    year: 1773,
    label: 'Mozart Moves In',
    description:
      'The Mozart family moves into a spacious 8-room apartment on the first floor. Wolfgang lives here until 1781 and composes prolific works including the "Paris" Symphony.',
    photo: null,
  },
  {
    id: '1944',
    year: 1944,
    label: 'Allied Bombing',
    description:
      'October 16, 1944. An Allied air raid destroys two thirds of the building. Only the Tanzmeistersaal wing survives.',
    photo: '/textures/historic_1944.jpg',
  },
  {
    id: '1996',
    year: 1996,
    label: 'Reconstruction',
    description:
      'Reconstructed true to original plans using authentic materials. Reopened January 26, 1996 as the Mozart Residence Museum.',
    photo: null,
  },
];

/** Shared morph duration — canvas + timeline track stay in sync. */
export const MORPH_DURATION_MS = 1800;

/** Smoothstep easing for morph transitions. */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
