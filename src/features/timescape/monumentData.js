/**
 * Procedural point-cloud Salzburger Dom for Timescape demo.
 * Inspired by Salzburg Cathedral — consecrated 1628, dome collapsed 16 Oct 1944,
 * reconsecrated May 1959. Each era shares point count/order for coherent morphs.
 */

import { easeInOutCubic } from './timescapeMeta';

export { easeInOutCubic } from './timescapeMeta';

/** Grid multiplier for procedural sampling — higher = denser point cloud. */
const POINT_DENSITY = 3;

function scaleSteps(steps) {
  return Math.max(1, Math.round(steps * POINT_DENSITY));
}

const HIDDEN = [0, -8, 0];

function pushSlot(slots, preWar, postWar, present) {
  slots.push({ preWar, postWar, present });
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

function pushPresentOnly(slots, points) {
  points.forEach((p) => {
    pushSlot(slots, HIDDEN, HIDDEN, [...p]);
  });
}

function pushSharedIntact(slots, point, postPoint) {
  pushSlot(slots, [...point], postPoint, [...point]);
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

function mirrorEra(slots, points, transform) {
  points.forEach((p, i) => {
    const intact = [...p];
    const post = transform ? transform(p, i) : intact;
    pushSlot(slots, intact, post, intact);
  });
}

function buildPointSlots() {
  const slots = [];
  let seed = 0;

  // Domplatz + terrace levels (Salzburg forecourt)
  const plinth = [];
  fillBox(plinth, 0, -1.28, 0, 4.8, 0.22, 3.8, 20, 1, 15);
  fillBox(plinth, 0, -1.08, 0.35, 4.4, 0.16, 3.2, 18, 1, 13);
  fillBox(plinth, 0, -1.22, 1.72, 5.4, 0.12, 2.5, 22, 1, 11);
  fillStairs(plinth, 0, -1.38, 2.05, 2.4, 0.85, 6, 0.04);
  mirrorEra(slots, plinth);

  // Main nave — higher density volume + facades
  const nave = [];
  fillBox(nave, 0, 0.12, 0, 2.85, 1.58, 2.15, 14, 9, 10);
  fillBoxSurface(nave, 0, 0.12, 1.02, 2.85, 1.58, 2.15, 'front', 16, 12);
  fillBoxSurface(nave, 0, 0.12, -1.02, 2.85, 1.58, 2.15, 'back', 16, 12);
  fillBoxSurface(nave, -1.42, 0.12, 0, 2.15, 1.58, 2.85, 'left', 10, 12);
  fillBoxSurface(nave, 1.42, 0.12, 0, 2.15, 1.58, 2.85, 'right', 10, 12);
  fillRoofRidge(nave, -1.25, 0.94, 0, 1.25, 0, 16);
  mirrorEra(slots, nave, (p) => [p[0], p[1] - 0.1, p[2]]);

  // West facade baroque pilasters (Domplatz elevation)
  const facadeColumns = [];
  [-0.82, -0.42, 0.42, 0.82].forEach((cx) => {
    fillCylinder(facadeColumns, cx, 0.28, 1.12, 0.09, 1.35, 10, 9);
  });
  fillBox(facadeColumns, 0, 0.98, 1.14, 2.55, 0.18, 0.16, 12, 2, 1);
  fillBox(facadeColumns, 0, -0.18, 1.1, 2.65, 0.14, 0.14, 12, 1, 1);
  facadeColumns.forEach((p, i) => {
    pushSharedIntact(
      slots,
      p,
      i % 3 === 0 ? scatterDownward(p, 0.48, seed++) : [p[0], p[1] - 0.12, p[2]]
    );
  });

  // Choir apse (east end)
  const apse = [];
  fillBox(apse, 0, 0.05, -1.12, 1.5, 1.28, 0.95, 9, 7, 4);
  fillBoxSurface(apse, 0, 0.05, -1.58, 1.5, 1.28, 0.95, 'back', 12, 9);
  fillDome(apse, 0, 0.58, -1.12, 0.58, 6, 14);
  fillWindowGrid(apse, 0, 0.12, -1.52, 0.55, 0.65, 4, 6);
  apse.forEach((p, i) => {
    pushSharedIntact(slots, p, scatterDownward(p, 0.35 + (i % 4) * 0.06, seed++));
  });

  // East transept arm
  const transept = [];
  fillBox(transept, 1.65, 0.18, 0, 1.25, 1.35, 1.55, 7, 6, 5);
  fillBoxSurface(transept, 1.65, 0.18, -0.76, 1.25, 1.35, 1.55, 'back', 8, 7);
  fillBoxSurface(transept, 1.65, 0.18, 0.76, 1.25, 1.35, 1.55, 'front', 8, 7);
  fillRoofRidge(transept, 1.05, 0.95, 0, 2.25, 0, 8);
  transept.forEach((p, i) => {
    pushSharedIntact(slots, p, scatterDownward(p, 0.75 + (i % 6) * 0.07, seed++));
  });

  // West transept (smaller)
  const westTransept = [];
  fillBox(westTransept, -1.65, 0.15, 0, 1.05, 1.2, 1.35, 8, 6, 5);
  fillBoxSurface(westTransept, -1.65, 0.15, 0.68, 1.05, 1.2, 1.35, 'front', 8, 7);
  fillRoofRidge(westTransept, -2.05, 0.88, 0, -2.05, 0, 8);
  westTransept.forEach((p, i) => {
    pushSharedIntact(
      slots,
      p,
      i % 3 === 0 ? scatterDownward(p, 0.4, seed++) : [...p]
    );
  });

  // Main crossing dome + drum (Salzburg copper dome)
  const drum = [];
  fillCylinder(drum, 0, 0.74, 0, 0.88, 0.42, 22, 6);
  fillBoxSurface(drum, 0, 0.74, 0.86, 1.76, 0.42, 1.76, 'front', 14, 4);
  mirrorEra(slots, drum, (p) => scatterDownward(p, 0.25, seed++));

  const dome = [];
  fillDome(dome, 0, 0.98, 0, 1.05, 14, 28);
  dome.forEach((p, i) => {
    const dist = Math.hypot(p[0], p[2] - 0.05);
    pushSharedIntact(
      slots,
      p,
      scatterDownward(p, 0.55 + (i % 7) * 0.06 + dist * 0.08, seed++)
    );
  });

  const lantern = [];
  fillCylinder(lantern, 0, 1.88, 0, 0.24, 0.38, 12, 5);
  fillSpire(lantern, 0, 2.05, 0, 0.07, 0.52, 10, 6);
  lantern.forEach((p, i) => {
    pushSharedIntact(slots, p, scatterDownward(p, 0.65, seed++));
  });

  // Crossing collapse rubble (1945 only)
  const domeRubble = [];
  fillBox(domeRubble, 0, -0.25, 0, 2.1, 0.42, 1.9, 16, 6, 12);
  fillBox(domeRubble, 0, -0.55, -0.15, 1.4, 0.28, 1.2, 10, 4, 9);
  fillBox(domeRubble, 0.55, -0.42, 0.35, 1.1, 0.22, 1.0, 8, 3, 7);
  domeRubble.forEach((p, i) => {
    pushSlot(slots, HIDDEN, scatterDownward(p, 0.18 + (i % 5) * 0.04, seed++), HIDDEN);
  });

  // Rubble fields (hidden pre-war / present)
  const rubble = [];
  fillBox(rubble, 0.35, -0.82, 0.2, 2.2, 0.22, 1.8, 12, 3, 8);
  fillBox(rubble, 1.35, -0.78, -0.15, 1.4, 0.18, 1.2, 9, 3, 6);
  fillBox(rubble, -0.5, -0.8, 0.55, 1.0, 0.16, 0.9, 7, 3, 5);
  fillBox(rubble, -0.85, -0.76, -0.35, 1.2, 0.18, 1.1, 7, 3, 5);
  rubble.forEach((p) => {
    pushSlot(slots, HIDDEN, [...p], HIDDEN);
  });

  // Salzburg west bell towers (iconic Domplatz silhouette)
  const westTowers = [
    [-1.08, 0.42, 1.06],
    [1.08, 0.42, 1.06],
  ];
  westTowers.forEach(([sx, sy, sz], towerIndex) => {
    const base = [];
    fillBox(base, sx, sy + 0.42, sz, 0.42, 0.95, 0.42, 5, 6, 5);
    fillBoxSurface(base, sx, sy + 0.42, sz + 0.2, 0.42, 0.95, 0.42, 'front', 6, 8);
    fillBox(base, sx, sy + 1.05, sz, 0.34, 0.55, 0.34, 4, 4, 4);
    base.forEach((p) => {
      const collapse = towerIndex === 0;
      pushSharedIntact(slots, p, collapse ? scatterDownward(p, 0.45, seed++) : [...p]);
    });

    const spire = [];
    fillSpire(spire, sx, sy + 1.05, sz, 0.15, 1.75, 12, 14);
    fillSpire(spire, sx, sy + 2.55, sz, 0.05, 0.35, 8, 4);
    fillWindowGrid(spire, sx, sy + 0.95, sz + 0.21, 0.18, 0.28, 3, 4);
    fillWindowGrid(spire, sx, sy + 1.45, sz + 0.21, 0.16, 0.22, 3, 3);
    spire.forEach((p, i) => {
      const collapse = towerIndex === 0;
      pushSharedIntact(
        slots,
        p,
        collapse ? scatterDownward(p, 0.5 + (i % 4) * 0.05, seed++) : [...p]
      );
    });
  });

  // West triple portal (1628 bronze doors on present day)
  const portal = [];
  fillArch(portal, -0.4, -0.04, 1.06, 0.44, 0.82, 0.1, 9, 6);
  fillArch(portal, 0, -0.01, 1.08, 0.56, 0.95, 0.12, 11, 7);
  fillArch(portal, 0.4, -0.04, 1.06, 0.44, 0.82, 0.1, 9, 6);
  fillBox(portal, 0, 0.28, 1.06, 1.35, 1.55, 0.16, 4, 9, 1);
  fillWindowGrid(portal, -0.3, 0.48, 1.12, 0.24, 0.58, 4, 6);
  fillWindowGrid(portal, 0.3, 0.48, 1.12, 0.24, 0.58, 4, 6);
  portal.forEach((p, i) => {
    pushSharedIntact(
      slots,
      p,
      i % 2 === 0 ? scatterDownward(p, 0.55, seed++) : [p[0], p[1] - 0.15, p[2]]
    );
  });

  // Side aisle roofs
  const aisles = [];
  fillBox(aisles, -1.95, 0.02, 0, 0.55, 0.95, 2.2, 3, 5, 8);
  fillBox(aisles, 1.95, 0.02, 0, 0.55, 0.95, 2.2, 3, 5, 8);
  fillRoofRidge(aisles, -2.2, 0.52, -0.9, -2.2, 0.9, 6);
  fillRoofRidge(aisles, 2.2, 0.52, -0.9, 2.2, 0.9, 6);
  mirrorEra(slots, aisles, (p, i) => (i % 5 === 0 ? scatterDownward(p, 0.2, seed++) : [p[0], p[1] - 0.06, p[2]]));

  // Flying buttresses
  const buttresses = [];
  [-1.55, 1.55].forEach((bx) => {
    fillButtress(buttresses, bx, 0.05, 0.35, 0.95, 0.45);
    fillButtress(buttresses, bx, 0.05, -0.35, 0.95, 0.45);
  });
  buttresses.forEach((p, i) => {
    pushSharedIntact(
      slots,
      p,
      i % 4 === 0 ? scatterDownward(p, 0.35, seed++) : [...p]
    );
  });

  // Colonnade — six columns + entablature
  const colonnade = [];
  for (let c = 0; c < 6; c += 1) {
    const cx = -2.35 + c * 0.42;
    fillCylinder(colonnade, cx, 0.02, 1.35, 0.1, 1.15, 8, 7);
  }
  fillBox(colonnade, -2.14, 0.62, 1.35, 2.1, 0.12, 0.35, 10, 1, 2);
  colonnade.forEach((p, i) => {
    pushSharedIntact(slots, p, scatterDownward(p, 0.4 + (i % 3) * 0.08, seed++));
  });

  // Clerestory windows
  const clerestory = [];
  for (let w = -1; w <= 1; w += 1) {
    fillWindowGrid(clerestory, w * 0.75, 0.55, 0, 0.35, 0.45, 4, 5);
  }
  mirrorEra(slots, clerestory);

  // Shared facade + drum articulation (all intact eras)
  const surfaceDetail = [];
  for (let w = -1; w <= 1; w += 1) {
    fillWindowGrid(surfaceDetail, w * 0.82, 0.64, 1.0, 0.3, 0.42, 6, 6);
    fillWindowGrid(surfaceDetail, w * 0.82, 0.64, -1.0, 0.3, 0.42, 6, 6);
  }
  for (let side = -1; side <= 1; side += 2) {
    fillBoxSurface(
      surfaceDetail,
      side * 1.44,
      0.12,
      0,
      2.15,
      1.58,
      2.85,
      side > 0 ? 'right' : 'left',
      10,
      12
    );
  }
  for (let r = 0; r < 24; r += 1) {
    const angle = (r / 24) * Math.PI * 2;
    fillBox(
      surfaceDetail,
      Math.cos(angle) * 0.84,
      0.74,
      Math.sin(angle) * 0.84,
      0.05,
      0.4,
      0.05,
      1,
      6,
      1
    );
  }
  fillRoofRidge(surfaceDetail, -1.28, 0.96, -0.35, 1.28, -0.35, 12);
  fillRoofRidge(surfaceDetail, -1.28, 0.96, 0.35, 1.28, 0.35, 12);
  mirrorEra(slots, surfaceDetail);

  // Present-only — free-standing Domplatz infrastructure (hidden in 1938 / 1945)
  const presentInfra = [];
  // Visitor pavilion (southeast forecourt)
  fillBox(presentInfra, 1.75, 0.05, 2.15, 0.85, 0.48, 0.65, 10, 6, 7);
  fillBoxSurface(presentInfra, 1.75, 0.05, 2.48, 0.85, 0.48, 0.65, 'front', 10, 6);
  fillBoxSurface(presentInfra, 1.75, 0.32, 2.15, 0.85, 0.06, 0.65, 'top', 10, 7);
  // Glazed connector to south aisle
  fillBox(presentInfra, 0.95, 0.12, 1.62, 0.14, 0.06, 1.05, 2, 2, 10);
  fillBox(presentInfra, 0.95, 0.26, 1.62, 0.16, 0.04, 1.08, 2, 1, 10);
  // Crypt museum entrance canopy (southwest approach)
  fillBox(presentInfra, -1.2, 0.22, 1.72, 0.75, 0.06, 0.55, 8, 1, 5);
  fillBox(presentInfra, -1.2, 0.38, 1.72, 0.7, 0.05, 0.5, 7, 1, 4);
  // Plaza information kiosk
  fillBox(presentInfra, 0.35, 0.02, 2.05, 0.38, 0.28, 0.32, 5, 4, 4);
  fillBoxSurface(presentInfra, 0.35, 0.18, 2.05, 0.38, 0.06, 0.32, 'top', 5, 4);
  // Forecourt railing + bollards along Domplatz edge
  for (let i = 0; i <= 12; i += 1) {
    const x = -2.3 + (i / 12) * 4.6;
    fillBox(presentInfra, x, -0.65, 2.45, 0.07, 0.42, 0.07, 2, 5, 2);
  }
  pushPresentOnly(slots, presentInfra);

  // Residenzplatz fountain (shared intact eras)
  const fountain = [];
  fillCylinder(fountain, 0, -0.98, 2.42, 0.62, 0.1, 18, 1);
  fillCylinder(fountain, 0, -0.72, 2.42, 0.14, 0.42, 10, 5);
  mirrorEra(slots, fountain, (p, i) =>
    scatterDownward(p, 0.12 + (i % 4) * 0.03, seed++)
  );

  // Courtyard paving — Domplatz grid
  const paving = [];
  const pavingStep = 0.32 / POINT_DENSITY;
  for (let px = -2.6; px <= 2.6; px += pavingStep) {
    for (let pz = 0.85; pz <= 2.55; pz += pavingStep * 0.86) {
      paving.push([px, -1.18, pz]);
    }
  }
  mirrorEra(slots, paving);

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

/** Per-era RGB tint (0–1) — index order matches TIMELINE_ERAS. */
export const ERA_COLORS = [
  [0.82, 0.86, 0.92], // present
  [0.5, 0.48, 0.46], // post-war — bomb dust and ash
  [0.82, 0.86, 0.92], // pre-war — same cathedral fabric
];

export const ERA_POSITIONS = [
  flattenEra('present'),
  flattenEra('postWar'),
  flattenEra('preWar'),
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

/** Interpolate era colors. */
export function lerpEraColors(fromIndex, toIndex, t, target) {
  const from = ERA_COLORS[fromIndex];
  const to = ERA_COLORS[toIndex];
  const eased = easeInOutCubic(t);

  target[0] = from[0] + (to[0] - from[0]) * eased;
  target[1] = from[1] + (to[1] - from[1]) * eased;
  target[2] = from[2] + (to[2] - from[2]) * eased;
}
