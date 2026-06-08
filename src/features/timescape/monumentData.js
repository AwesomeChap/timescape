/**
 * Procedural point-cloud Mozart-Wohnhaus for Timescape demo.
 * The Mozart Residence at Makartplatz 8, Salzburg — Baroque corner house (Mozart
 * family home from 1773), two-thirds destroyed by a bomb on 16 Oct 1944, replaced
 * by a 1952 office block, then reconstructed to the original plans (museum 1996).
 * Each era shares point count/order for coherent morphs.
 */

import { easeInOutCubic } from './timescapeMeta';

export { easeInOutCubic } from './timescapeMeta';

/** Grid multiplier for procedural sampling — higher = denser point cloud. */
const POINT_DENSITY = 3;

function scaleSteps(steps) {
  return Math.max(1, Math.round(steps * POINT_DENSITY));
}

const HIDDEN = [0, -8, 0];

function pushSlot(slots, original, destroyed, office, restored, mat = 'plaster') {
  slots.push({ original, destroyed, office, restored, mat });
}

function hash(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function scatterDownward(point, amount, seed) {
  const jitter = 0.22 + hash(seed) * 0.18;
  return [
    point[0] + (hash(seed + 1) - 0.5) * jitter,
    point[1] - amount - hash(seed + 2) * 0.12,
    point[2] + (hash(seed + 3) - 0.5) * jitter,
  ];
}

/** Same geometry across all four eras (optional per-era transforms). */
function pushAllEras(slots, points, mat = 'plaster', transforms = {}) {
  points.forEach((p, i) => {
    const base = [...p];
    pushSlot(
      slots,
      base,
      transforms.destroyed ? transforms.destroyed(p, i) : [...base],
      transforms.office ? transforms.office(p, i) : [...base],
      transforms.restored ? transforms.restored(p, i) : [...base],
      mat
    );
  });
}

/** Baroque fabric: intact in original & restored, rubble in destroyed, HIDDEN in office. */
function pushBaroque(slots, points, mat, rubbleFn) {
  points.forEach((p, i) => {
    const intact = [...p];
    const rubble = rubbleFn ? rubbleFn(p, i) : [...intact];
    pushSlot(slots, intact, rubble, HIDDEN, [...intact], mat);
  });
}

/** Lower third that survives the bomb and is encased by the office base. */
function pushBaroqueSurvivor(slots, points, mat, opts = {}) {
  points.forEach((p, i) => {
    const intact = [...p];
    const destroyed = opts.destroyed ? opts.destroyed(p, i) : [p[0], p[1] - 0.04, p[2]];
    const office = opts.office ? opts.office(p, i) : [...intact];
    pushSlot(slots, intact, destroyed, office, [...intact], mat);
  });
}

/** 1952 office block: visible only in the office era. */
function pushOfficeOnly(slots, points, mat) {
  points.forEach((p) => {
    pushSlot(slots, HIDDEN, HIDDEN, [...p], HIDDEN, mat);
  });
}

/** Bomb debris: visible only in the destroyed era. */
function pushDestroyedOnly(slots, points, mat, rubbleFn) {
  points.forEach((p, i) => {
    const rubble = rubbleFn ? rubbleFn(p, i) : [...p];
    pushSlot(slots, HIDDEN, rubble, HIDDEN, HIDDEN, mat);
  });
}

function fillBox(out, cx, cy, cz, sx, sy, sz, nx, ny, nz) {
  const ixMax = scaleSteps(nx);
  const iyMax = scaleSteps(ny);
  const izMax = scaleSteps(nz);

  for (let ix = 0; ix <= ixMax; ix += 1) {
    for (let iy = 0; iy <= iyMax; iy += 1) {
      for (let iz = 0; iz <= izMax; iz += 1) {
        out.push([
          cx + (ix / ixMax - 0.5) * sx,
          cy + (iy / iyMax - 0.5) * sy,
          cz + (iz / izMax - 0.5) * sz,
        ]);
      }
    }
  }
}

function fillBoxSurface(out, cx, cy, cz, sx, sy, sz, face, stepsU, stepsV) {
  const uMax = scaleSteps(stepsU);
  const vMax = scaleSteps(stepsV);

  for (let u = 0; u <= uMax; u += 1) {
    for (let v = 0; v <= vMax; v += 1) {
      const fu = u / uMax - 0.5;
      const fv = v / vMax - 0.5;
      let x = cx;
      let y = cy;
      let z = cz;

      if (face === 'front') {
        x += fu * sx;
        y += fv * sy;
        z += sz * 0.5;
      } else if (face === 'back') {
        x += fu * sx;
        y += fv * sy;
        z -= sz * 0.5;
      } else if (face === 'left') {
        x -= sx * 0.5;
        y += fv * sy;
        z += fu * sz;
      } else if (face === 'right') {
        x += sx * 0.5;
        y += fv * sy;
        z += fu * sz;
      } else if (face === 'top') {
        x += fu * sx;
        y += sy * 0.5;
        z += fv * sz;
      }

      out.push([x, y, z]);
    }
  }
}

function fillCylinder(out, cx, cy, cz, radius, height, radialSteps, heightSteps) {
  const radialMax = scaleSteps(radialSteps);
  const heightMax = scaleSteps(heightSteps);

  for (let h = 0; h <= heightMax; h += 1) {
    const y = cy + (h / heightMax - 0.5) * height;
    for (let r = 0; r < radialMax; r += 1) {
      const angle = (r / radialMax) * Math.PI * 2;
      out.push([cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius]);
    }
  }
}

function fillDome(out, cx, cy, cz, radius, rings, segments) {
  const ringMax = scaleSteps(rings);
  const segmentMax = scaleSteps(segments);

  for (let ring = 0; ring <= ringMax; ring += 1) {
    const phi = (ring / ringMax) * (Math.PI / 2);
    const y = cy + Math.sin(phi) * radius;
    const ringRadius = Math.cos(phi) * radius;
    for (let seg = 0; seg < segmentMax; seg += 1) {
      const theta = (seg / segmentMax) * Math.PI * 2;
      out.push([cx + Math.cos(theta) * ringRadius, y, cz + Math.sin(theta) * ringRadius]);
    }
  }
}

function fillSpire(out, cx, cy, cz, baseRadius, height, radialSteps, heightSteps) {
  const radialMax = scaleSteps(radialSteps);
  const heightMax = scaleSteps(heightSteps);

  for (let h = 0; h <= heightMax; h += 1) {
    const t = h / heightMax;
    const y = cy + t * height;
    const radius = baseRadius * (1 - t * 0.88);
    for (let r = 0; r < radialMax; r += 1) {
      const angle = (r / radialMax) * Math.PI * 2;
      out.push([cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius]);
    }
  }
}

function fillArch(out, cx, cy, cz, width, height, depth, segments, rings) {
  const segmentMax = scaleSteps(segments);
  const ringMax = scaleSteps(rings);

  for (let ring = 0; ring <= ringMax; ring += 1) {
    const t = ring / ringMax;
    const y = cy + t * height;
    const halfWidth = (width * 0.5) * Math.sin((t * Math.PI) / 2);
    for (let s = 0; s <= segmentMax; s += 1) {
      const u = s / segmentMax;
      const x = cx + (u - 0.5) * halfWidth * 2;
      out.push([x, y, cz + (hash(ring * 31 + s) - 0.5) * depth]);
    }
  }
}

function fillRoofRidge(out, x1, y, z1, x2, z2, steps) {
  const stepMax = scaleSteps(steps);

  for (let i = 0; i <= stepMax; i += 1) {
    const t = i / stepMax;
    out.push([x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t]);
  }
}

function fillStairs(out, cx, cy, cz, width, depth, steps, rise) {
  const stepMax = scaleSteps(steps);
  const widthMax = scaleSteps(6);

  for (let s = 0; s <= stepMax; s += 1) {
    const y = cy + s * rise;
    const z = cz + (s / stepMax - 0.5) * depth;
    for (let w = 0; w <= widthMax; w += 1) {
      const x = cx + (w / widthMax - 0.5) * width;
      out.push([x, y, z]);
    }
  }
}

function fillWindowGrid(out, cx, cy, cz, width, height, cols, rows) {
  const colMax = scaleSteps(cols);
  const rowMax = scaleSteps(rows);

  for (let row = 0; row <= rowMax; row += 1) {
    for (let col = 0; col <= colMax; col += 1) {
      out.push([
        cx + (col / colMax - 0.5) * width,
        cy + (row / rowMax - 0.5) * height,
        cz,
      ]);
    }
  }
}

function fillButtress(out, cx, cy, cz, height, depth) {
  fillBox(out, cx, cy + height * 0.15, cz, 0.18, height * 0.7, depth, 2, 5, 2);
  fillArch(out, cx, cy - height * 0.15, cz, 0.35, height * 0.35, depth * 0.4, 5, 3);
}

/**
 * Mozart-Wohnhaus, an L-shaped four-story Baroque corner house on Makartplatz.
 * Facade faces +Z, building ~5 wide / ~2.5 tall, ground at y≈-1.1.
 * Lower third (ground + 1st floor, y up to ≈-0.1) survives the 1944 bomb; the
 * upper two-thirds + roof become rubble. A taller, plainer 1952 office block
 * occupies the same footprint in the office era only.
 */
function buildPointSlots() {
  const slots = [];
  let seed = 0;

  // Footprint + key heights (facade faces +Z, ground at GY).
  // The Mozart-Wohnhaus is long and low — 3 stories under a tall dormered hipped roof.
  const W = 6.0; // main block width (x) — long facade
  const D = 2.6; // main block depth (z)
  // Only the right 2/3 was destroyed/replaced; the left 1/3 stays the original house in every era.
  const LEFT_X = -W / 2 + W / 3; // = -1.0 — boundary between the permanent left and the rebuilt right
  const GY = -1.1; // ground / street level
  const EAVE = 0.45; // top of walls (~3 stories); the big roof sits above
  const ROOF_RISE = 0.85; // tall hipped roof — the dominant mass
  // Right return wing forms the L-shaped corner house (extends back from the corner).
  const WW = 1.8; // wing width (x)
  const WD = 2.0; // wing depth (z)
  const WX = W / 2 - WW / 2; // wing centred under the right end
  const WZ = -D / 2 - WD / 2 + 0.2; // wing reaches back behind the main block

  /** Solid box — interior volume + four upright wall faces (box centre + size). */
  function wallBox(out, cx, cy, cz, w, h, d) {
    const su = Math.max(6, Math.round(w * 5));
    const sv = Math.max(5, Math.round(h * 6));
    const sd = Math.max(6, Math.round(d * 5));
    fillBox(out, cx, cy, cz, w, h, d, Math.round(w * 4), Math.round(h * 5), Math.round(d * 4));
    fillBoxSurface(out, cx, cy, cz, w, h, d, 'front', su, sv);
    fillBoxSurface(out, cx, cy, cz, w, h, d, 'back', su, sv);
    fillBoxSurface(out, cx, cy, cz, w, h, d, 'left', sd, sv);
    fillBoxSurface(out, cx, cy, cz, w, h, d, 'right', sd, sv);
  }

  /** Four-sided hipped roof: stacked rectangle rings shrinking to a short ridge. */
  function hipRoof(out, cx, cz, hw, hd, eaveY, rise) {
    const rings = scaleSteps(8);
    const perim = scaleSteps(28);
    for (let s = 0; s <= rings; s += 1) {
      const t = s / rings;
      const y = eaveY + t * rise;
      const w = hw * (1 - t * 0.8);
      const d = hd * (1 - t * 0.8);
      for (let k = 0; k < perim; k += 1) {
        const u = (k / perim) * 4;
        let x;
        let z;
        if (u < 1) {
          x = -w + 2 * w * u;
          z = d;
        } else if (u < 2) {
          x = w;
          z = d - 2 * d * (u - 1);
        } else if (u < 3) {
          x = w - 2 * w * (u - 2);
          z = -d;
        } else {
          x = -w;
          z = -d + 2 * d * (u - 3);
        }
        out.push([cx + x, y, cz + z]);
      }
    }
  }

  /** A roof dormer — a small box face poking out of the roof slope + a tiny hip cap. */
  function dormer(out, x, y, z) {
    fillBox(out, x, y, z, 0.2, 0.24, 0.16, 3, 4, 2);
    fillBoxSurface(out, x, y, z, 0.2, 0.24, 0.16, 'front', 4, 5);
    for (let s = 0; s <= scaleSteps(3); s += 1) {
      const t = s / scaleSteps(3);
      out.push([x, y + 0.12 + t * 0.1, z + 0.08 * (1 - t)]); // little ridge cap
    }
  }

  /** An explicit window: recessed glass pane + proud frame & muntins + two shutters. */
  function addWindow(glass, frame, shutter, x, y, z, w, h) {
    fillBox(glass, x, y, z - 0.02, w * 0.74, h * 0.82, 0.01, 2, 3, 1);
    fillBox(frame, x, y + h * 0.5, z, w + 0.05, 0.05, 0.04, 4, 1, 1); // lintel
    fillBox(frame, x, y - h * 0.5, z, w + 0.05, 0.05, 0.04, 4, 1, 1); // sill
    fillBox(frame, x - w * 0.5, y, z, 0.05, h, 0.04, 1, 4, 1); // jambs
    fillBox(frame, x + w * 0.5, y, z, 0.05, h, 0.04, 1, 4, 1);
    fillBox(frame, x, y, z, w, 0.025, 0.04, 4, 1, 1); // cross muntins
    fillBox(frame, x, y, z, 0.025, h, 0.04, 1, 4, 1);
    if (shutter) {
      fillBox(shutter, x - w * 0.62, y, z + 0.01, w * 0.34, h, 0.02, 1, 4, 1);
      fillBox(shutter, x + w * 0.62, y, z + 0.01, w * 0.34, h, 0.02, 1, 4, 1);
    }
  }

  /** An explicit window on a +X-facing wall: glass pane + frame (w spans along Z). */
  function addWindowX(glass, frame, x, y, z, w, h) {
    fillBox(glass, x - 0.02, y, z, 0.01, h * 0.82, w * 0.74, 1, 3, 2);
    fillBox(frame, x, y + h * 0.5, z, 0.04, 0.05, w + 0.05, 1, 1, 4); // lintel
    fillBox(frame, x, y - h * 0.5, z, 0.04, 0.05, w + 0.05, 1, 1, 4); // sill
    fillBox(frame, x, y, z - w * 0.5, 0.04, h, 0.05, 1, 4, 1); // jambs
    fillBox(frame, x, y, z + w * 0.5, 0.04, h, 0.05, 1, 4, 1);
  }

  /** An explicit door: dark panel + surround frame (y is the threshold). */
  function addDoor(door, frame, x, y, z, w, h) {
    fillBox(door, x, y + h * 0.5, z - 0.01, w * 0.82, h, 0.02, 3, 6, 1);
    fillBox(frame, x - w * 0.5, y + h * 0.5, z, 0.05, h, 0.05, 1, 6, 1);
    fillBox(frame, x + w * 0.5, y + h * 0.5, z, 0.05, h, 0.05, 1, 6, 1);
    fillBox(frame, x, y + h, z, w + 0.06, 0.06, 0.05, 4, 1, 1);
  }

  const FRONT = D / 2 + 0.03; // front facade plane (slightly proud)
  const fall = (amt) => (p, i) => scatterDownward(p, amt + (i % 6) * 0.07, seed++);

  /**
   * House fabric with the left/right destruction split:
   * left 1/3 (x < LEFT_X) is the original house in ALL eras; the right 2/3 follows the
   * arc original → rubble (destroyed) → HIDDEN (office replaces it) → rebuilt (restored).
   */
  function pushHouseFabric(slots, points, mat, rubbleFn) {
    points.forEach((p, i) => {
      const intact = [...p];
      if (p[0] < LEFT_X) {
        pushSlot(slots, intact, [...intact], [...intact], [...intact], mat);
      } else {
        const rubble = rubbleFn ? rubbleFn(p, i) : [...intact];
        pushSlot(slots, intact, rubble, HIDDEN, [...intact], mat);
      }
    });
  }

  // Street base + Makartplatz paving (all eras)
  const base = [];
  fillBox(base, 0, GY - 0.04, -0.2, W + 1.0, 0.14, D + WD + 1.2, 24, 1, 18);
  fillStairs(base, 0, GY - 0.06, D / 2 + 0.4, 1.0, 0.4, 4, 0.04);
  const pavingStep = 0.34 / POINT_DENSITY;
  for (let px = -3.0; px <= 3.0; px += pavingStep) {
    for (let pz = D / 2 + 0.15; pz <= D / 2 + 1.4; pz += pavingStep * 0.9) {
      base.push([px, GY + 0.02, pz]);
    }
  }
  pushAllEras(slots, base, 'base');

  const splitY = GY + 0.52; // top of the ground floor (the part that survives the bomb)

  // Ground floor walls (survive the bomb) — main block + return wing
  const lower = [];
  wallBox(lower, 0, (GY + splitY) / 2, 0, W, splitY - GY, D);
  wallBox(lower, WX, (GY + splitY) / 2, WZ, WW, splitY - GY, WD);
  pushHouseFabric(slots, lower, 'plaster', fall(0.4));

  // Ground-floor arcade (stone) + two carriage doors at the portal axes
  const arcade = [];
  const doorPanel = [];
  const doorFrame = [];
  for (let a = 0; a < 7; a += 1) {
    const ax = -2.4 + a * 0.8;
    const portal = a === 2 || a === 4;
    fillArch(arcade, ax, GY, D / 2 + 0.02, 0.5, portal ? 0.78 : 0.6, 0.1, 9, portal ? 8 : 6);
    if (portal) addDoor(doorPanel, doorFrame, ax, GY, FRONT, 0.4, 0.66);
  }
  pushHouseFabric(slots, arcade, 'stone', fall(0.4));
  pushHouseFabric(slots, doorPanel, 'door', fall(0.4));
  pushHouseFabric(slots, doorFrame, 'frame', fall(0.4));

  // Upper two floors of walls (become rubble) — main block + return wing
  const upper = [];
  wallBox(upper, 0, (splitY + EAVE) / 2, 0, W, EAVE - splitY, D);
  wallBox(upper, WX, (splitY + EAVE) / 2, WZ, WW, EAVE - splitY, WD);
  pushHouseFabric(slots, upper, 'plaster', fall(0.9));

  // Explicit windows on the two upper floors (9 axes), with shutters
  const winGlass = [];
  const winFrame = [];
  const winShutter = [];
  const axisN = 9;
  for (let c = 0; c < axisN; c += 1) {
    const x = (c / (axisN - 1) - 0.5) * W * 0.86;
    [splitY + 0.3, splitY + 0.8].forEach((y) => {
      addWindow(winGlass, winFrame, winShutter, x, y, FRONT, 0.34, 0.42);
    });
  }
  pushHouseFabric(slots, winGlass, 'window', fall(0.85));
  pushHouseFabric(slots, winFrame, 'frame', fall(0.85));
  pushHouseFabric(slots, winShutter, 'shutter', fall(0.85));

  // Horizontal floor string-courses + eaves cornice (stone banding)
  const bands = [];
  fillBox(bands, 0, splitY + 0.02, D / 2 + 0.04, W, 0.05, 0.06, 24, 1, 1);
  fillBox(bands, 0, splitY + 0.55, D / 2 + 0.04, W, 0.05, 0.06, 24, 1, 1);
  fillBox(bands, 0, EAVE, D / 2 + 0.05, W, 0.07, 0.08, 24, 1, 1);
  pushHouseFabric(slots, bands, 'stone', fall(0.8));

  // Tall hipped roof (the dominant mass) + dormers (with glass) + chimneys — become rubble
  const roof = [];
  const dormerGlass = [];
  hipRoof(roof, 0, 0, W / 2, D / 2, EAVE, ROOF_RISE);
  hipRoof(roof, WX, WZ, WW / 2, WD / 2, EAVE, ROOF_RISE * 0.8);
  for (let dx = -2.4; dx <= 2.4; dx += 0.8) {
    dormer(roof, dx, EAVE + 0.2, 1.0);
    fillBox(dormerGlass, dx, EAVE + 0.2, 1.06, 0.12, 0.14, 0.01, 2, 2, 1);
  }
  const chimneys = [];
  [-1.9, -0.6, 0.8, 2.1].forEach((cx) => {
    fillBox(chimneys, cx, EAVE + ROOF_RISE - 0.02, 0, 0.16, 0.42, 0.16, 2, 5, 2);
  });
  pushHouseFabric(slots, roof, 'roof', fall(1.1));
  pushHouseFabric(slots, dormerGlass, 'window', fall(1.1));
  pushHouseFabric(slots, chimneys, 'chimney', fall(1.2));

  // 1952 office block (office era only) — a nicer modern corner block: glazed ground-floor
  // shopfront + entrance, framed windows wrapping two faces, cornice, shallow hipped roof.
  const officeWall = [];
  const officeGlass = [];
  const officeFrame = [];
  const officeDoor = [];
  const officeTrim = [];
  const officeRoof = [];
  // Office occupies the RIGHT 2/3 only (left wall abuts the surviving original left third).
  const OCX = (LEFT_X + W / 2) / 2; // = 1.0 — centre of the right 2/3
  const OW = W / 2 - LEFT_X; // = 4.0 — right 2/3 width
  const OD = D + 0.2;
  const officeWallTop = EAVE + ROOF_RISE + 0.15;
  const officeCY = (GY + officeWallTop) / 2;
  const officeH = officeWallTop - GY;
  const OFZ = OD / 2 + 0.03; // front face plane (+Z)
  const OFX = OCX + OW / 2 + 0.03; // right face plane (+X) — the corner

  wallBox(officeWall, OCX, officeCY, 0, OW, officeH, OD);

  // Ground-floor glazed shopfront on the front + right faces, with mullions and a canopy
  fillBox(officeGlass, OCX, GY + 0.32, OFZ, OW * 0.82, 0.5, 0.01, 16, 3, 1);
  fillBox(officeGlass, OFX, GY + 0.32, -0.1, 0.01, 0.5, OD * 0.7, 1, 3, 8);
  for (let m = -3; m <= 3; m += 1) {
    fillBox(officeTrim, OCX + (m * OW * 0.82) / 7, GY + 0.32, OFZ + 0.01, 0.03, 0.52, 0.03, 1, 4, 1);
  }
  fillBox(officeTrim, OCX, GY + 0.6, OFZ + 0.07, OW * 0.86, 0.03, 0.18, 14, 1, 2); // canopy
  addDoor(officeDoor, officeFrame, OCX + 0.9, GY, OFZ, 0.42, 0.62); // entrance

  // Upper floors — framed modern windows (no shutters) wrapping front + right faces
  const officeRows = [GY + 1.05, GY + 1.5, GY + 1.95, GY + 2.4].filter((y) => y < officeWallTop - 0.12);
  officeRows.forEach((y) => {
    for (let col = 0; col < 8; col += 1) {
      const x = OCX + (col / 7 - 0.5) * OW * 0.84;
      addWindow(officeGlass, officeFrame, null, x, y, OFZ, 0.3, 0.34);
    }
    for (let s = 0; s < 4; s += 1) {
      const z = (s / 3 - 0.5) * OD * 0.7 - 0.1;
      addWindowX(officeGlass, officeFrame, OFX, y, z, 0.3, 0.34);
    }
  });

  // Cornice band + shallow hipped roof
  fillBox(officeTrim, OCX, officeWallTop - 0.04, OFZ + 0.02, OW, 0.08, 0.06, 18, 1, 1);
  fillBox(officeTrim, OFX + 0.02, officeWallTop - 0.04, -0.1, 0.06, 0.08, OD, 1, 1, 12);
  hipRoof(officeRoof, OCX, 0, OW / 2, OD / 2, officeWallTop, 0.32);

  pushOfficeOnly(slots, officeWall, 'officeWall');
  pushOfficeOnly(slots, officeGlass, 'officeGlass');
  pushOfficeOnly(slots, officeFrame, 'frame');
  pushOfficeOnly(slots, officeDoor, 'door');
  pushOfficeOnly(slots, officeTrim, 'officeTrim');
  pushOfficeOnly(slots, officeRoof, 'officeRoof');

  // Bomb debris piles on the RIGHT 2/3 (destroyed era only)
  const debris = [];
  fillBox(debris, 1.0, GY + 0.3, 0.4, W * 0.5, 0.3, D * 0.8, 14, 3, 9);
  fillBox(debris, WX, GY + 0.34, WZ + 0.3, WW * 0.9, 0.26, WD * 0.7, 9, 3, 7);
  fillBox(debris, 2.0, GY + 0.24, 0.9, 1.6, 0.22, 1.1, 9, 3, 6);
  pushDestroyedOnly(slots, debris, 'rubble', (p, i) =>
    scatterDownward(p, 0.05 + (i % 5) * 0.03, seed++)
  );

  return slots;
}

const POINT_SLOTS = buildPointSlots();

function flattenEra(key) {
  const positions = new Float32Array(POINT_SLOTS.length * 3);
  POINT_SLOTS.forEach((slot, i) => {
    const p = slot[key];
    positions[i * 3] = p[0];
    positions[i * 3 + 1] = p[1];
    positions[i * 3 + 2] = p[2];
  });
  return positions;
}

/**
 * Per-material colour, one RGB per era [original, destroyed, office, restored].
 * Materials only visible in a single era share one colour across all four so they
 * don't flash while teleporting in/out of the HIDDEN sentinel.
 */
const ASH = [0.44, 0.42, 0.4];
const CONCRETE = [0.6, 0.62, 0.64];
const MAT = {
  plaster: [[0.84, 0.73, 0.66], ASH, CONCRETE, [0.9, 0.79, 0.72]],
  roof: [[0.42, 0.26, 0.22], [0.32, 0.28, 0.26], CONCRETE, [0.46, 0.28, 0.23]],
  window: [[0.16, 0.19, 0.24], [0.12, 0.12, 0.12], [0.26, 0.32, 0.4], [0.17, 0.21, 0.27]],
  frame: [[0.93, 0.92, 0.88], [0.5, 0.48, 0.45], [0.72, 0.74, 0.76], [0.96, 0.95, 0.92]],
  shutter: [[0.44, 0.52, 0.42], [0.34, 0.33, 0.3], CONCRETE, [0.47, 0.56, 0.45]],
  door: [[0.32, 0.22, 0.16], [0.22, 0.18, 0.15], [0.3, 0.3, 0.32], [0.34, 0.24, 0.18]],
  stone: [[0.66, 0.62, 0.56], [0.46, 0.44, 0.42], CONCRETE, [0.7, 0.66, 0.6]],
  base: [[0.42, 0.42, 0.44], [0.38, 0.37, 0.36], [0.45, 0.46, 0.48], [0.44, 0.44, 0.46]],
  chimney: [[0.55, 0.4, 0.34], [0.36, 0.32, 0.3], CONCRETE, [0.58, 0.42, 0.36]],
  rubble: [ASH, ASH, ASH, ASH],
  officeWall: [CONCRETE, CONCRETE, CONCRETE, CONCRETE],
  officeGlass: [
    [0.32, 0.4, 0.46],
    [0.32, 0.4, 0.46],
    [0.32, 0.4, 0.46],
    [0.32, 0.4, 0.46],
  ],
  officeTrim: [
    [0.74, 0.75, 0.76],
    [0.74, 0.75, 0.76],
    [0.74, 0.75, 0.76],
    [0.74, 0.75, 0.76],
  ],
  officeRoof: [
    [0.33, 0.35, 0.38],
    [0.33, 0.35, 0.38],
    [0.33, 0.35, 0.38],
    [0.33, 0.35, 0.38],
  ],
};

const ERA_KEYS = ['original', 'destroyed', 'office', 'restored'];

function flattenColor(eraIndex) {
  const colors = new Float32Array(POINT_SLOTS.length * 3);
  POINT_SLOTS.forEach((slot, i) => {
    const palette = MAT[slot.mat] || MAT.plaster;
    const c = palette[eraIndex];
    colors[i * 3] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  });
  return colors;
}

/** Per-point RGB colour buffer per era — index order matches TIMELINE_ERAS. */
export const ERA_COLOR_BUFFERS = ERA_KEYS.map((_, i) => flattenColor(i));

export const ERA_POSITIONS = [
  flattenEra('original'),
  flattenEra('destroyed'),
  flattenEra('office'),
  flattenEra('restored'),
];

export const POINT_COUNT = POINT_SLOTS.length;

/** Visible monument bounds (ignores hidden-era sentinel points). */
export function getMonumentBounds() {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  ERA_POSITIONS.forEach((positions) => {
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      if (y < -4) continue;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }
  });

  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    size: [maxX - minX, maxY - minY, maxZ - minZ],
  };
}

export const MONUMENT_BOUNDS = getMonumentBounds();

/** Linear interpolation between two era position buffers. */
export function lerpEraPositions(fromIndex, toIndex, t, target) {
  const from = ERA_POSITIONS[fromIndex];
  const to = ERA_POSITIONS[toIndex];
  const eased = easeInOutCubic(t);

  for (let i = 0; i < target.length; i += 1) {
    target[i] = from[i] + (to[i] - from[i]) * eased;
  }
}

/** Linear interpolation between two per-point colour buffers. */
export function lerpColorBuffers(fromIndex, toIndex, t, target) {
  const from = ERA_COLOR_BUFFERS[fromIndex];
  const to = ERA_COLOR_BUFFERS[toIndex];
  const eased = easeInOutCubic(t);

  for (let i = 0; i < target.length; i += 1) {
    target[i] = from[i] + (to[i] - from[i]) * eased;
  }
}
