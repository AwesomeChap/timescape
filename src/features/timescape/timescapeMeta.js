export const MONUMENT = {
  name: "Mozart's Wohnhaus",
  location: 'Makartplatz, Salzburg, Austria',
};

/** Discrete timeline stops — present → past (left to right). */
export const TIMELINE_ERAS = [
  {
    id: 'era1994',
    year: 1994,
    label: 'Present day',
    description:
      'Fully restored salmon-pink residence with shuttered windows, basement slits, stone arched portal, dormered shingle roof, and planters along Makartplatz.',
  },
  {
    id: 'era1952',
    year: 1952,
    label: 'Insurance office',
    description:
      'Two-thirds of the bombed house was sold to an insurance company. The brown-grey surviving third — with arched shopfronts and a hedge — remained on the left; a five-storey beige office block rose on the right.',
  },
  {
    id: 'era1944',
    year: 1944,
    label: 'Bombing aftermath',
    description:
      'An air raid destroyed roughly two-thirds of the house. The surviving third on the left still stood; the right two-thirds collapsed into a settled rubble mound.',
  },
  {
    id: 'era1685',
    year: 1685,
    label: 'Merged residence',
    description:
      'Two original town houses were combined into one long Mozart family residence — tall shuttered windows, a shop awning, arched shopfronts, ridge chimneys, and a continuous hipped roof.',
  },
  {
    id: 'era1617',
    year: 1617,
    label: 'Twin houses',
    description:
      'Before the merger, two separate Baroque town houses stood side by side on the plot — the earliest chapter of the site.',
  },
];

/** Shared morph duration — canvas + timeline track stay in sync. */
export const MORPH_DURATION_MS = 1800;

/** Smoothstep easing for morph transitions. */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
