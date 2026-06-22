export const MONUMENT = {
  name: "Mozart's Wohnhaus",
  location: 'Makartplatz, Salzburg, Austria',
};

/** Discrete timeline stops, chronological — past → present (left to right). */
export const TIMELINE_ERAS = [
  {
    id: 'era1994',
    year: 1994,
    label: 'Present day',
    description: `1989: The International Mozarteum Foundation, which had already acquired the preserved portion of the Tanzmeistersaal for museum purposes in 1955, purchased the remaining part of the building.

1994: The office building was demolished, and reconstruction began based on the original plans.

1996: Opening of the Museum Mozarts Residence.

2022: The restored Magic Flute cottage has been placed in the courtyard. It was moved from its long-time location in the Mozarteum garden following renovations in the 2020s.`,
  },
  {
    id: 'era1952',
    year: 1952,
    label: 'Insurance office',
    description:
      'The owner at the time sold the bombed-out section to the insurance company Assicurazioni Generali, which built an office building there in 1952.',
  },
  {
    id: 'era1944',
    year: 1944,
    label: 'Bombing aftermath',
    description: 'Two-thirds of the house was destroyed by an aerial bomb.',
  },
  {
    id: 'era1685',
    year: 1685,
    label: 'Merged residence',
    description: `Until 1685, it consisted of two houses.

1711: Franz Gottlieb Spöckner was granted permission by decree to hold dance lessons for members of the nobility in this house. For this reason, the house was called the "Tanzmeistersaal" starting in 1713.

1773: The Mozarts moved into their new, much more spacious home on what was then Hannibalplatz (now Makartplatz 8).

1939: The house has been designated a historic landmark.`,
  },
  {
    id: 'era1617',
    year: 1617,
    label: 'Twin houses',
    description: 'The building was first mentioned in historical records in 1617.',
  },
  // Authored newest → oldest above; reversed here so the timeline reads
  // oldest → newest (left → right). Geometry buffers in monumentData.js are
  // reversed in lockstep to keep era indices aligned.
].reverse();

/** Shared morph duration — canvas + timeline track stay in sync. */
export const MORPH_DURATION_MS = 1800;

/** Smoothstep easing for morph transitions. */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
