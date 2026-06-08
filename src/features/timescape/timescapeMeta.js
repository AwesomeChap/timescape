export const MONUMENT = {
  name: 'Mozart Residence',
  location: 'Makartplatz 8, Salzburg, Austria',
};

/** Discrete timeline stops — chronological (left to right). Index 0 is the default view. */
export const TIMELINE_ERAS = [
  {
    id: 'original',
    year: 1773,
    label: 'The Mozart house',
    description:
      "The Mozart family's home from 1773 — a four-story Baroque corner house on Makartplatz with an austere window grid, pitched roof, and the grand Tanzmeistersaal dance hall.",
  },
  {
    id: 'destroyed',
    year: 1944,
    label: 'After the bombing',
    description:
      'On 16 October 1944 an aerial bomb destroyed roughly two-thirds of the building. Only the lower street-front survived beneath the rubble of the upper floors.',
  },
  {
    id: 'office',
    year: 1952,
    label: 'The office block',
    description:
      'In 1952 a plain modern office building for Assicurazioni Generali (architect Josef Becvar) rose on the footprint — flat parapet roof and horizontal ribbon windows. It stood until 1994.',
  },
  {
    id: 'restored',
    year: 1996,
    label: 'Reconstructed museum',
    description:
      'Between 1994 and 1996 the house was rebuilt to the original plans. The Mozart-Wohnhaus museum reopened in 1996, the Baroque facade and Tanzmeistersaal restored.',
  },
];

/** Shared morph duration — canvas + timeline track stay in sync. */
export const MORPH_DURATION_MS = 1800;

/** Smoothstep easing for morph transitions. */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
