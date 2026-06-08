/**
 * Procedural point-cloud Mozart's Wohnhaus — five correlated eras for morphing.
 * Facade faces +Z (Makartplatz). Shared footprint FULL_W across all eras.
 * Left 1/3 survivor wing (1952 + 1944). Right 2/3: office (1952) / rubble (1944).
 * 1617 twin houses span the same total width as the merged 1685+ residence.
 */

import { easeInOutCubic } from './timescapeMeta';

export { easeInOutCubic } from './timescapeMeta';

const ERA_KEYS = ['era1994', 'era1952', 'era1944', 'era1685', 'era1617'];
/** Surface-only sampling — no interior fill. */
const POINT_DENSITY = 2.1;
const HIDDEN = [0, -8, 0];

const FULL_W = 6.4;
/** Shared vertical split — left 1/3 survivor | right 2/3 office/rubble. */
const SURVIVOR_W = FULL_W / 3;
const MAIN_W = FULL_W * (2 / 3);
const SPLIT_X = -FULL_W / 2 + SURVIVOR_W;
const SURVIVOR_CX = -FULL_W / 2 + SURVIVOR_W / 2;
const MAIN_CX = SPLIT_X + MAIN_W / 2;
const FULL_CX = 0;
const DEPTH = 2.8;

/** Twin gap between the two 1617 houses — combined span still equals FULL_W. */
const TWIN_GAP = 0.36;
const TWIN_W = (FULL_W - TWIN_GAP) / 2;
const TWIN_A_CX = -FULL_W / 2 + TWIN_W / 2;
const TWIN_B_CX = FULL_W / 2 - TWIN_W / 2;

const GY = -1.1;
const EAVE = 0.48;
const ROOF_RISE = 0.82;
const FRONT = DEPTH / 2 + 0.04;
const OFFICE_TOP = GY + 2.85;
const FLOOR_H = 0.52;

const PALETTE = {
  historic: [[0.96, 0.84, 0.78], [0.52, 0.48, 0.42], [0.50, 0.46, 0.42], [0.78, 0.72, 0.64], [0.74, 0.68, 0.62]],
  historicB: [[0.96, 0.84, 0.78], [0.52, 0.48, 0.42], [0.50, 0.46, 0.42], [0.78, 0.72, 0.64], [0.68, 0.62, 0.56]],
  office: [[0.94, 0.92, 0.90], [0.90, 0.86, 0.74], [0.40, 0.36, 0.32], [0.78, 0.72, 0.64], [0.74, 0.68, 0.62]],
  officeGlass: [[0.70, 0.78, 0.86], [0.65, 0.74, 0.84], [0.40, 0.36, 0.32], [0.78, 0.72, 0.64], [0.74, 0.68, 0.62]],
  rubble: [[0.45, 0.40, 0.36], [0.45, 0.40, 0.36], [0.36, 0.30, 0.26], [0.45, 0.40, 0.36], [0.45, 0.40, 0.36]],
  timber: [[0.30, 0.24, 0.18], [0.30, 0.24, 0.18], [0.28, 0.22, 0.16], [0.30, 0.24, 0.18], [0.30, 0.24, 0.18]],
  roof: [[0.26, 0.24, 0.22], [0.78, 0.76, 0.72], [0.24, 0.22, 0.20], [0.22, 0.20, 0.18], [0.24, 0.22, 0.20]],
  roofSurvivor: [[0.26, 0.24, 0.22], [0.30, 0.28, 0.26], [0.24, 0.22, 0.20], [0.22, 0.20, 0.18], [0.24, 0.22, 0.20]],
  frame: [[0.96, 0.96, 0.94], [0.92, 0.90, 0.86], [0.80, 0.76, 0.72], [0.92, 0.88, 0.84], [0.90, 0.86, 0.82]],
  glass: [[0.22, 0.30, 0.40], [0.20, 0.28, 0.38], [0.15, 0.18, 0.22], [0.20, 0.28, 0.38], [0.20, 0.28, 0.38]],
  stone: [[0.82, 0.80, 0.76], [0.82, 0.80, 0.76], [0.65, 0.62, 0.58], [0.80, 0.78, 0.74], [0.80, 0.78, 0.74]],
  ground: [[0.50, 0.48, 0.46], [0.52, 0.50, 0.46], [0.44, 0.40, 0.36], [0.52, 0.50, 0.46], [0.52, 0.50, 0.46]],
  cobble: [[0.58, 0.56, 0.52], [0.58, 0.56, 0.52], [0.50, 0.46, 0.42], [0.58, 0.56, 0.52], [0.58, 0.56, 0.52]],
  hedge: [[0.28, 0.46, 0.24], [0.28, 0.46, 0.24], [0.28, 0.46, 0.24], [0.28, 0.46, 0.24], [0.28, 0.46, 0.24]],
  detail: [[0.90, 0.88, 0.86], [0.68, 0.64, 0.60], [0.42, 0.38, 0.34], [0.58, 0.54, 0.50], [0.56, 0.52, 0.48]],
  plant: [[0.26, 0.50, 0.22], [0.26, 0.50, 0.22], [0.26, 0.50, 0.22], [0.26, 0.50, 0.22], [0.26, 0.50, 0.22]],
  shutter: [[0.72, 0.76, 0.80], [0.68, 0.72, 0.76], [0.55, 0.58, 0.62], [0.70, 0.74, 0.78], [0.68, 0.72, 0.76]],
  moulding: [[0.48, 0.44, 0.40], [0.48, 0.44, 0.40], [0.38, 0.34, 0.30], [0.48, 0.44, 0.40], [0.48, 0.44, 0.40]],
  door: [[0.32, 0.22, 0.16], [0.32, 0.22, 0.16], [0.22, 0.18, 0.15], [0.34, 0.24, 0.18], [0.34, 0.24, 0.18]],
};

function scaleSteps(steps) {
  return Math.max(1, Math.round(steps * POINT_DENSITY));
}

function hash(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function isHidden(p) {
  return p === HIDDEN || (Array.isArray(p) && p[1] < -4);
}

function zoneColor(zone, eraIndex) {
  return PALETTE[zone][eraIndex];
}

function pushSlot(slots, zones, positions) {
  const zoneList = Array.isArray(zones) ? zones : [zones, zones, zones, zones, zones];
  const slot = {};
  ERA_KEYS.forEach((key, i) => {
    const p = positions[i];
    if (isHidden(p)) {
      slot[key] = { p: HIDDEN, c: [0, 0, 0] };
    } else {
      slot[key] = { p: [...p], c: [...zoneColor(zoneList[i], i)] };
    }
  });
  slots.push(slot);
}

function applyFacadeCurve(p) {
  const t = p[0] / (FULL_W * 0.5);
  return [p[0], p[1], p[2] + t * 0.06];
}

function shiftX(point, dx) {
  return [point[0] + dx, point[1], point[2]];
}

function scaleYToHeight(point, fromTop, toTop, baseY) {
  const rel = (point[1] - baseY) / (fromTop - baseY);
  return [point[0], baseY + rel * (toTop - baseY), point[2]];
}

function inTwinGap(x) {
  return Math.abs(x) < TWIN_GAP / 2;
}

function sampleLine(out, x0, y0, z0, x1, y1, z1, steps) {
  const n = scaleSteps(steps);
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0 + (z1 - z0) * t]);
  }
}

/** 1944 rubble field — timber nest + masonry + dust (reference: 1944 Makartplatz photo). */
function buildRuinPile(rubble, timber, masonry, debris) {
  const xMin = SPLIT_X + 0.08;
  const xMax = FULL_W / 2 - 0.15;
  const pileCx = (xMin + xMax) / 2;
  const pileW = xMax - xMin;

  for (let i = 0; i < 140; i += 1) {
    const s = i * 13.7;
    debris.push([
      pileCx + (hash(s) - 0.5) * pileW * 0.96,
      GY + 0.01 + hash(s + 1) * 0.1,
      (hash(s + 2) - 0.5) * DEPTH * 0.9,
    ]);
  }

  for (let chunk = 0; chunk < 22; chunk += 1) {
    const s = chunk * 29.3;
    const cx = pileCx + (hash(s) - 0.5) * pileW * 0.82;
    const cy = GY + 0.12 + hash(s + 3) * 1.35;
    const cz = (hash(s + 4) - 0.5) * DEPTH * 0.65;
    const w = 0.18 + hash(s + 5) * 0.38;
    fillBoxSurface(masonry, cx, cy, cz, w, 0.1 + hash(s + 6) * 0.22, w * 0.75, 'top', 3, 2);
    fillBoxSurface(masonry, cx, cy, cz, w, 0.14, w * 0.65, 'front', 3, 2);
  }

  for (let beam = 0; beam < 62; beam += 1) {
    const s = beam * 19.11 + 44;
    const cx = pileCx + (hash(s) - 0.5) * pileW * 0.9;
    const cy = GY + 0.2 + hash(s + 1) * 1.55;
    const cz = (hash(s + 2) - 0.5) * DEPTH * 0.78;
    const length = 0.5 + hash(s + 3) * 1.75;
    const yaw = hash(s + 4) * Math.PI * 2;
    const pitch = (hash(s + 5) - 0.5) * 1.1;
    const dx = Math.cos(yaw) * length * 0.5;
    const dy = Math.sin(pitch) * length * 0.38;
    const dz = Math.sin(yaw) * length * 0.5;
    sampleLine(
      timber,
      cx - dx,
      cy - dy * 0.25,
      cz - dz,
      cx + dx,
      cy + dy,
      cz + dz,
      4 + Math.floor(hash(s + 7) * 5)
    );
  }

  for (let j = 0; j < 16; j += 1) {
    const s = j * 37.2;
    const bx = SPLIT_X + 0.12 + hash(s) * 0.75;
    const by = GY + 0.25 + hash(s + 1) * 0.95;
    const bz = (hash(s + 2) - 0.5) * 0.55;
    const len = 0.85 + hash(s + 3) * 1.25;
    sampleLine(timber, bx, by, bz, bx - 0.35 - hash(s) * 0.5, by + len, bz + 0.25, 7);
    sampleLine(timber, bx, by, bz, bx + 0.15 + hash(s + 4) * 0.35, by + len * 0.9, bz - 0.2, 6);
    sampleLine(timber, bx, by, bz, bx - 0.1, by + len * 0.7, bz + 0.45, 5);
  }

  for (let layer = 0; layer <= 11; layer += 1) {
    const t = layer / 11;
    const y = GY + 0.06 + t * 1.82;
    const rw = pileW * (0.52 + (1 - t) * 0.44);
    fillBoxSurface(rubble, pileCx, y, 0.14 + t * 0.12, rw, 0.1, DEPTH * 0.68 * (1 - t * 0.32), 'front', 13, 1);
    if (layer % 2 === 0) {
      fillBoxSurface(rubble, pileCx, y, 0.04, rw * 0.92, 0.08, DEPTH * 0.55 * (1 - t * 0.25), 'top', 11, 6);
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

function hipRoof(out, cx, cz, hw, hd, eaveY, rise) {
  const rings = scaleSteps(8);
  const perim = scaleSteps(22);
  const cols = scaleSteps(14);

  for (let s = 0; s <= rings; s += 1) {
    const t = s / rings;
    const y = eaveY + t * rise;
    const w = hw * (1 - t * 0.82);
    const d = hd * (1 - t * 0.82);

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

    for (let c = 0; c <= cols; c += 1) {
      const fx = cx - w + (c / cols) * w * 2;
      out.push([fx, y, cz + d]);
      out.push([fx, y, cz - d]);
    }
  }

  const ridgeSteps = scaleSteps(12);
  const ridgeHalf = hw * 0.16;
  for (let i = 0; i <= ridgeSteps; i += 1) {
    const t = i / ridgeSteps;
    out.push([cx - ridgeHalf + t * ridgeHalf * 2, eaveY + rise, cz]);
  }
}

function fillVerticalEdges(out, cx, cy, cz, w, h, d, steps) {
  const hw = w * 0.5;
  const hh = h * 0.5;
  const hd = d * 0.5;
  const stepMax = scaleSteps(steps);
  const sampleY = (t) => cy - hh + t * h;
  const corners = [
    [cx - hw, cz + hd],
    [cx + hw, cz + hd],
    [cx - hw, cz - hd],
    [cx + hw, cz - hd],
  ];
  corners.forEach(([ex, ez]) => {
    for (let i = 0; i <= stepMax; i += 1) {
      out.push([ex, sampleY(i / stepMax), ez]);
    }
  });
}

function fillHorizontalRings(out, cx, cy, cz, w, d, y, steps) {
  const hw = w * 0.5;
  const hd = d * 0.5;
  const stepMax = scaleSteps(steps);
  for (let i = 0; i <= stepMax; i += 1) {
    const t = i / stepMax;
    const x = cx - hw + t * w;
    out.push([x, y, cz + hd]);
    out.push([x, y, cz - hd]);
  }
}

/** Exterior shell only — no interior volume, no top cap (roof is separate). */
function wallShell(out, cx, cy, cz, w, h, d, opts = {}) {
  const { floorYs = [], eaveLip = false } = opts;
  const su = Math.max(6, Math.round(w * 5));
  const sv = Math.max(6, Math.round(h * 5.5));
  const sd = Math.max(6, Math.round(d * 5));
  const hh = h * 0.5;
  const hd = d * 0.5;

  fillBoxSurface(out, cx, cy, cz, w, h, d, 'front', su, sv);
  fillBoxSurface(out, cx, cy, cz, w, h, d, 'back', su, sv);
  fillBoxSurface(out, cx, cy, cz, w, h, d, 'left', sd, sv);
  fillBoxSurface(out, cx, cy, cz, w, h, d, 'right', sd, sv);
  fillVerticalEdges(out, cx, cy, cz, w, h, d, 5);

  fillHorizontalRings(out, cx, cy, cz, w, d, cy - hh, 10);
  fillHorizontalRings(out, cx, cy, cz, w, d, cy + hh, 10);
  floorYs.forEach((fy) => fillHorizontalRings(out, cx, cy, cz, w, d, fy, 8));

  if (eaveLip) {
    fillBoxSurface(out, cx, cy + hh, cz + hd + 0.04, w, 0.05, 0.1, 'front', su, 1);
  }
}

function wallBox(out, cx, cy, cz, w, h, d) {
  wallShell(out, cx, cy, cz, w, h, d);
}

function addWindow(glass, frame, shutter, x, y, z, w, h) {
  const recessZ = z - 0.04;
  fillBoxSurface(glass, x, y, recessZ, w * 0.72, h * 0.8, 0.01, 'front', 5, 6);
  fillBoxSurface(glass, x, y, recessZ - 0.02, w * 0.72, h * 0.8, 0.01, 'back', 4, 5);
  fillBoxSurface(frame, x, y + h * 0.5, z, w + 0.06, 0.06, 0.05, 'front', 6, 1);
  fillBoxSurface(frame, x, y - h * 0.5, z, w + 0.06, 0.06, 0.05, 'front', 6, 1);
  fillBoxSurface(frame, x - w * 0.5, y, z, 0.06, h, 0.05, 'front', 1, 6);
  fillBoxSurface(frame, x + w * 0.5, y, z, 0.06, h, 0.05, 'front', 1, 6);
  fillBoxSurface(frame, x, y, z, w * 0.88, 0.025, 0.04, 'front', 5, 1);
  fillBoxSurface(frame, x, y, z, 0.025, h * 0.88, 0.04, 'front', 1, 5);
  fillBoxSurface(frame, x - w * 0.5, y, recessZ, 0.03, h * 0.82, 0.04, 'left', 1, 5);
  fillBoxSurface(frame, x + w * 0.5, y, recessZ, 0.03, h * 0.82, 0.04, 'right', 1, 5);
  if (shutter) {
    fillBoxSurface(shutter, x - w * 0.62, y, z + 0.02, w * 0.34, h * 0.96, 0.025, 'front', 3, 6);
    fillBoxSurface(shutter, x + w * 0.62, y, z + 0.02, w * 0.34, h * 0.96, 0.025, 'front', 3, 6);
  }
}

function addDoor(door, frame, x, y, z, w, h) {
  fillBoxSurface(door, x, y + h * 0.5, z - 0.02, w * 0.8, h, 0.03, 'front', 4, 7);
  fillBoxSurface(door, x, y + h * 0.5, z - 0.05, w * 0.8, h, 0.01, 'back', 3, 6);
  fillBoxSurface(frame, x - w * 0.5, y + h * 0.5, z, 0.06, h, 0.06, 'front', 1, 7);
  fillBoxSurface(frame, x + w * 0.5, y + h * 0.5, z, 0.06, h, 0.06, 'front', 1, 7);
  fillBoxSurface(frame, x, y + h, z, w + 0.08, 0.07, 0.06, 'front', 5, 1);
  fillBoxSurface(frame, x, y + h * 0.5, z - 0.04, 0.04, h, 0.05, 'left', 1, 6);
  fillBoxSurface(frame, x, y + h * 0.5, z - 0.04, 0.04, h, 0.05, 'right', 1, 6);
}

function dormer(out, x, y, z) {
  fillBoxSurface(out, x, y, z, 0.22, 0.26, 0.18, 'front', 4, 5);
  fillBoxSurface(out, x, y, z, 0.22, 0.26, 0.18, 'left', 3, 5);
  fillBoxSurface(out, x, y, z, 0.22, 0.26, 0.18, 'right', 3, 5);
  fillBoxSurface(out, x, y + 0.13, z, 0.2, 0.02, 0.16, 'top', 4, 3);
  for (let s = 0; s <= scaleSteps(3); s += 1) {
    const t = s / scaleSteps(3);
    out.push([x, y + 0.14 + t * 0.12, z + 0.1 * (1 - t)]);
  }
}

function buildPointSlots() {
  const slots = [];

  function isSurvivorZone(x) {
    return x < SPLIT_X;
  }

  function zonesForPoint(p, baseZone) {
    const survivor = isSurvivorZone(p[0]);
    const isRoof = p[1] > EAVE - 0.05;
    const z = isRoof ? 'roof' : baseZone;
    return [z, survivor ? z : 'office', survivor ? z : 'rubble', z, survivor ? 'historicB' : 'historic'];
  }

  function collapsedRubbleFromOffice(p) {
    const nx = (p[0] - MAIN_CX) / (MAIN_W * 0.5);
    const heightT = Math.max(0, Math.min(1, (p[1] - GY) / (OFFICE_TOP - GY)));
    const seed = p[0] * 17.3 + p[1] * 23.1 + p[2] * 11.7;
    const pileY = GY + 0.08 + (1 - heightT * 0.5) * 1.5 + heightT * 0.15 + (hash(seed) - 0.5) * 0.18;
    const pileX = MAIN_CX + nx * MAIN_W * 0.44 + (hash(seed + 1) - 0.5) * 0.22;
    const pileZ = p[2] * 0.48 + 0.12 + (hash(seed + 2) - 0.5) * 0.2;
    return [pileX, pileY, pileZ];
  }

  function mapMergedHistoric(p) {
    const curved = applyFacadeCurve(p);
    const survivor = isSurvivorZone(curved[0]);
    const twin1617 = inTwinGap(curved[0]) && curved[1] < EAVE + ROOF_RISE ? HIDDEN : curved;
    const splitEra = survivor ? curved : HIDDEN;
    // 1994 + 1617: full width. 1952/1944: left survivor third only (main-house styling).
    // 1685: left third here; right two-thirds come from office slots at historic height.
    return [curved, splitEra, splitEra, survivor ? curved : HIDDEN, twin1617];
  }

  function mapOfficePoint(p) {
    const houseV = applyFacadeCurve(scaleYToHeight(p, OFFICE_TOP, EAVE, GY));
    const rubbleV = collapsedRubbleFromOffice(p);
    const twinV = shiftX(houseV, TWIN_B_CX - MAIN_CX);
    const twin1617 = inTwinGap(twinV[0]) ? HIDDEN : twinV;
    return [HIDDEN, p, rubbleV, houseV, twin1617];
  }

  function mapTwinLocal(p, twinCx) {
    const merged = shiftX(p, FULL_CX - twinCx);
    return [merged, HIDDEN, HIDDEN, merged, p];
  }

  function pushAllEras(points, zone) {
    points.forEach((p) => {
      pushSlot(slots, zonesForPoint(p, zone), mapMergedHistoric(p, zone));
    });
  }

  function officeHistoricZone(zone) {
    if (zone === 'office') return 'historic';
    if (zone === 'officeGlass') return 'glass';
    return zone;
  }

  function pushOfficeEras(points, zone) {
    points.forEach((p) => {
      const isRoof = p[1] > OFFICE_TOP - 0.15;
      const z = isRoof ? 'roof' : zone;
      // 1685: right two-thirds at historic height with main-house colours.
      pushSlot(slots, [z, z, 'rubble', officeHistoricZone(z), z], mapOfficePoint(p));
    });
  }

  function pushEraOnly(points, eraIndex, zone, posFn) {
    points.forEach((p, i) => {
      const positions = [HIDDEN, HIDDEN, HIDDEN, HIDDEN, HIDDEN];
      positions[eraIndex] = posFn ? posFn(p, i) : [...p];
      pushSlot(slots, zone, positions);
    });
  }

  function pushTwinEras(points, twinCx, zone) {
    points.forEach((p) => {
      const z = p[1] > EAVE - 0.05 ? 'roof' : zone;
      pushSlot(slots, [z, z, z, z, z], mapTwinLocal(p, twinCx));
    });
  }

  // ── Ground & plaza ───────────────────────────────────────────────────────
  const base = [];
  fillBoxSurface(base, 0, GY - 0.04, 0.1, FULL_W + 1.0, 0.14, DEPTH + 1.4, 'top', 12, 8);
  const paveStep = 0.38;
  for (let px = -3.2; px <= 3.2; px += paveStep) {
    for (let pz = FRONT + 0.15; pz <= FRONT + 1.35; pz += paveStep * 0.9) {
      base.push([px, GY + 0.02, pz]);
    }
  }
  pushAllEras(base, 'ground');

  const cobble = [];
  fillBoxSurface(cobble, 0, GY + 0.04, FRONT + 0.55, FULL_W + 0.4, 0.03, 1.8, 'top', 14, 5);
  pushAllEras(cobble, 'cobble');

  // ── Merged full historic house (1994 / 1685 base) ────────────────────────
  const walls = [];
  wallShell(walls, FULL_CX, (GY + EAVE) / 2, 0, FULL_W, EAVE - GY, DEPTH, {
    floorYs: [GY + 0.62, GY + 0.12],
    eaveLip: true,
  });
  const stoneBase = [];
  fillBoxSurface(stoneBase, FULL_CX, GY - 0.06, FRONT + 0.03, FULL_W * 0.98, 0.16, 0.1, 'front', 18, 2);
  fillBoxSurface(stoneBase, FULL_CX, GY - 0.06, 0, FULL_W * 0.98, 0.16, DEPTH, 'left', 6, 2);
  fillBoxSurface(stoneBase, FULL_CX, GY - 0.06, 0, FULL_W * 0.98, 0.16, DEPTH, 'right', 6, 2);
  pushAllEras(stoneBase, 'stone');
  pushAllEras(walls, 'historic');

  // Upper windows — 10 bays (1994 reference)
  const winGlass = [];
  const winFrame = [];
  const winShutter = [];
  for (let col = 0; col < 10; col += 1) {
    const x = FULL_CX + (col / 9 - 0.5) * FULL_W * 0.9;
    addWindow(winGlass, winFrame, winShutter, x, GY + 0.92, FRONT, 0.36, 0.4);
  }
  // Middle floor — 8 bays
  for (let col = 0; col < 8; col += 1) {
    const x = FULL_CX + (col / 7 - 0.5) * FULL_W * 0.86;
    addWindow(winGlass, winFrame, winShutter, x, GY + 0.42, FRONT, 0.34, 0.36);
  }
  pushAllEras(winGlass, 'glass');
  pushAllEras(winFrame, 'frame');
  pushAllEras(winShutter, 'shutter');

  // Basement slits — 12 narrow windows
  const basement = [];
  for (let col = 0; col < 12; col += 1) {
    const x = FULL_CX + (col / 11 - 0.5) * FULL_W * 0.94;
    fillBoxSurface(basement, x, GY + 0.08, FRONT + 0.02, 0.22, 0.1, 0.01, 'front', 3, 2);
  }
  pushAllEras(basement, 'glass');

  // Stone portal + cafe arches (left)
  const stone = [];
  fillBoxSurface(stone, -0.6, GY + 0.32, FRONT + 0.03, 0.55, 0.82, 0.08, 'front', 3, 7);
  [-2.45, -1.6].forEach((ax) => fillArch(stone, ax, GY + 0.18, FRONT + 0.02, 0.42, 0.52, 0.1, 7, 6));
  pushAllEras(stone, 'stone');

  const doors = [];
  addDoor(doors, winFrame, -0.6, GY, FRONT, 0.44, 0.68);
  pushAllEras(doors, 'door');

  // Cornice bands
  const bands = [];
  fillBoxSurface(bands, FULL_CX, GY + 0.62, FRONT + 0.04, FULL_W, 0.05, 0.06, 'front', 16, 1);
  fillBoxSurface(bands, FULL_CX, EAVE, FRONT + 0.05, FULL_W, 0.07, 0.08, 'front', 16, 1);
  pushAllEras(bands, 'stone');

  // Hipped roof + dormers
  const roofPts = [];
  hipRoof(roofPts, FULL_CX, 0, FULL_W / 2, DEPTH / 2, EAVE, ROOF_RISE);
  [-2.35, -0.75, 0.75, 2.35].forEach((dx) => {
    dormer(roofPts, FULL_CX + dx, EAVE + 0.22, 1.05);
    fillBoxSurface(roofPts, FULL_CX + dx, EAVE + 0.22, 1.1, 0.12, 0.14, 0.01, 'front', 2, 2);
  });
  const chimneys = [];
  wallBox(chimneys, 2.35, EAVE + 0.62, -0.1, 0.22, 0.62, 0.22);
  [-1.55, 0.25, 1.95].forEach((cx) => wallBox(chimneys, cx, EAVE + 0.55, 0.15, 0.14, 0.38, 0.14));
  pushAllEras(roofPts, 'roof');
  pushAllEras(chimneys, 'detail');

  // 1685-only shop awning + moulding
  const awning = [];
  fillBoxSurface(awning, -1.6, GY + 0.28, FRONT + 0.42, 1.1, 0.04, 0.22, 'front', 6, 1);
  const moulding = [];
  fillBoxSurface(moulding, FULL_CX, GY + 0.58, FRONT + 0.05, FULL_W * 0.92, 0.04, 0.05, 'front', 14, 1);
  pushEraOnly(awning, 3, 'detail', (p) => applyFacadeCurve(p));
  pushEraOnly(moulding, 3, 'moulding', (p) => applyFacadeCurve(p));
  pushEraOnly(awning, 0, 'detail', (p) => applyFacadeCurve(p));

  // ── 1952 office block (right 2/3) ────────────────────────────────────────
  const officeWall = [];
  const officeGlass = [];
  const officeFrame = [];
  const officeTrim = [];
  const officeRoof = [];
  const officeCY = (GY + OFFICE_TOP) / 2;
  const officeH = OFFICE_TOP - GY;
  wallShell(officeWall, MAIN_CX, officeCY, 0, MAIN_W, officeH, DEPTH + 0.12, {
    floorYs: [GY + FLOOR_H, GY + FLOOR_H * 2, GY + FLOOR_H * 3, GY + FLOOR_H * 4],
    eaveLip: true,
  });
  fillBoxSurface(officeTrim, MAIN_CX, OFFICE_TOP - 0.04, FRONT + 0.05, MAIN_W, 0.08, 0.06, 'front', 10, 1);
  hipRoof(officeRoof, MAIN_CX, 0, MAIN_W / 2, DEPTH / 2 + 0.06, OFFICE_TOP, 0.28);

  for (let floor = 0; floor < 5; floor += 1) {
    const fy = GY + FLOOR_H * 0.55 + floor * FLOOR_H;
    const zone = floor === 0 ? 'officeGlass' : 'glass';
    for (let col = 0; col < 4; col += 1) {
      const bx = MAIN_CX + (col / 3 - 0.5) * MAIN_W * 0.82;
      addWindow(officeGlass, officeFrame, null, bx, fy, FRONT + 0.06, MAIN_W * 0.17, FLOOR_H * 0.52);
    }
    if (floor > 0) {
      fillBoxSurface(officeTrim, MAIN_CX, GY + floor * FLOOR_H, FRONT + 0.07, MAIN_W, 0.04, 0.05, 'front', 10, 1);
    }
  }
  pushOfficeEras(officeWall, 'office');
  pushOfficeEras(officeGlass, 'officeGlass');
  pushOfficeEras(officeFrame, 'frame');
  pushOfficeEras(officeTrim, 'office');
  pushOfficeEras(officeRoof, 'roof');

  // 1952 hedge + stone wall along survivor (left wing)
  const hedge = [];
  fillBoxSurface(hedge, SURVIVOR_CX, GY + 0.08, FRONT + 0.55, SURVIVOR_W + 0.35, 0.3, 0.45, 'front', 5, 3);
  const survWall = [];
  fillBoxSurface(survWall, SURVIVOR_CX, GY - 0.02, FRONT + 0.48, SURVIVOR_W + 0.5, 0.12, 0.35, 'front', 6, 1);
  pushEraOnly(hedge, 1, 'hedge', (p) => p);
  pushEraOnly(survWall, 1, 'stone', (p) => p);

  // ── 1944 ruin — right 2/3 timber nest + masonry (office morphs into this volume) ──
  const rubble = [];
  const timber = [];
  const masonry = [];
  const ruinDebris = [];
  buildRuinPile(rubble, timber, masonry, ruinDebris);

  const partyWall = [];
  fillBoxSurface(partyWall, SPLIT_X + 0.04, (GY + EAVE) / 2, FRONT + 0.03, 0.1, EAVE - GY, 0.12, 'front', 1, 9);
  fillVerticalEdges(partyWall, SPLIT_X + 0.04, (GY + EAVE) / 2, 0, 0.1, EAVE - GY, DEPTH, 5);
  for (let k = 0; k < 6; k += 1) {
    const s = k * 11.5;
    const by = GY + 0.35 + hash(s) * 1.1;
    sampleLine(
      timber,
      SPLIT_X + 0.08,
      by,
      0.15 + hash(s + 1) * 0.3,
      SPLIT_X + 0.55 + hash(s + 2) * 0.4,
      by + 0.25 + hash(s + 3) * 0.5,
      -0.1 + hash(s + 4) * 0.35,
      5
    );
  }

  pushEraOnly(rubble, 2, 'rubble', (p) => p);
  pushEraOnly(masonry, 2, 'rubble', (p) => p);
  pushEraOnly(ruinDebris, 2, 'rubble', (p) => p);
  pushEraOnly(partyWall, 2, 'stone', (p) => p);
  pushEraOnly(timber, 2, 'timber', (p) => p);

  // ── 1617 twin houses — combined width equals FULL_W ──────────────────────
  [
    { cx: TWIN_A_CX, w: TWIN_W },
    { cx: TWIN_B_CX, w: TWIN_W },
  ].forEach(({ cx, w }) => {
    const twinWalls = [];
    wallShell(twinWalls, cx, (GY + EAVE) / 2, 0, w, EAVE - GY, DEPTH, {
      floorYs: [GY + 0.62],
      eaveLip: true,
    });
    pushTwinEras(twinWalls, cx, 'historic');

    const twinRoof = [];
    hipRoof(twinRoof, cx, 0, w / 2, DEPTH / 2, EAVE, ROOF_RISE * 0.92);
    dormer(twinRoof, cx - w * 0.12, EAVE + 0.2, 1.02);
    dormer(twinRoof, cx + w * 0.18, EAVE + 0.2, 1.02);
    wallBox(twinRoof, cx + w * 0.28, EAVE + 0.58, -0.08, 0.16, 0.48, 0.16);
    pushTwinEras(twinRoof, cx, 'roof');

    const twinWin = [];
    const twinFr = [];
    const twinSh = [];
    for (let col = 0; col < 5; col += 1) {
      const x = cx + (col / 4 - 0.5) * w * 0.82;
      addWindow(twinWin, twinFr, twinSh, x, GY + 0.92, FRONT, 0.32, 0.38);
      addWindow(twinWin, twinFr, twinSh, x, GY + 0.42, FRONT, 0.3, 0.34);
    }
    fillArch(twinFr, cx, GY + 0.18, FRONT + 0.02, 0.4, 0.5, 0.1, 7, 6);
    pushTwinEras(twinWin, cx, 'glass');
    pushTwinEras(twinFr, cx, 'frame');
    pushTwinEras(twinSh, cx, 'shutter');
  });

  // Cobble in the twin gap (1617 only)
  const gapCobble = [];
  fillBoxSurface(gapCobble, 0, GY + 0.22, FRONT + 0.12, TWIN_GAP + 0.08, 0.04, 0.5, 'top', 2, 2);
  pushEraOnly(gapCobble, 4, 'cobble', (p) => p);

  // ── 1994 present-only details ────────────────────────────────────────────
  const planters = [];
  [-2.9, -2.5, -2.1].forEach((px) => wallBox(planters, px, GY + 0.18, FRONT + 0.35, 0.28, 0.36, 0.28));
  pushEraOnly(planters, 0, 'plant', (p) => p);

  const bollards = [];
  for (let i = 0; i <= 4; i += 1) {
    fillBoxSurface(bollards, 2.55 + i * 0.17, GY + 0.12, FRONT + 0.75, 0.08, 0.38, 0.08, 'front', 1, 3);
  }
  pushEraOnly(bollards, 0, 'detail', (p) => p);

  return slots;
}

const POINT_SLOTS = buildPointSlots();

function flattenEraPositions(key) {
  const positions = new Float32Array(POINT_SLOTS.length * 3);
  POINT_SLOTS.forEach((slot, i) => {
    const { p } = slot[key];
    positions[i * 3] = p[0];
    positions[i * 3 + 1] = p[1];
    positions[i * 3 + 2] = p[2];
  });
  return positions;
}

function flattenEraColors(key) {
  const colors = new Float32Array(POINT_SLOTS.length * 3);
  POINT_SLOTS.forEach((slot, i) => {
    const { c } = slot[key];
    colors[i * 3] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  });
  return colors;
}

export const ERA_COLORS = [
  [0.96, 0.84, 0.78],
  [0.78, 0.74, 0.66],
  [0.48, 0.42, 0.38],
  [0.78, 0.72, 0.64],
  [0.74, 0.68, 0.62],
];

export const ERA_POSITIONS = ERA_KEYS.map((key) => flattenEraPositions(key));
export const ERA_VERTEX_COLORS = ERA_KEYS.map((key) => flattenEraColors(key));
export const ERA_POINT_COLORS = ERA_VERTEX_COLORS;
export const ERA_COLOR_BUFFERS = ERA_VERTEX_COLORS;
export const POINT_COUNT = POINT_SLOTS.length;
export const VERTEX_COUNT = POINT_COUNT;

function computeBounds(positions, filterFn) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    const y = positions[i + 1];
    if (y < -4) continue;
    if (filterFn && !filterFn(i / 3)) continue;
    minX = Math.min(minX, positions[i]);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, positions[i + 2]);
    maxX = Math.max(maxX, positions[i]);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, positions[i + 2]);
  }

  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    size: [maxX - minX, maxY - minY, maxZ - minZ],
  };
}

export function getMonumentBounds() {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  ERA_POSITIONS.forEach((positions) => {
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      if (y < -4) continue;
      minX = Math.min(minX, positions[i]);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, positions[i + 2]);
      maxX = Math.max(maxX, positions[i]);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, positions[i + 2]);
    }
  });

  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    size: [maxX - minX, maxY - minY, maxZ - minZ],
  };
}

export function getBuildingBounds() {
  return computeBounds(ERA_POSITIONS[0], (vi) => ERA_POSITIONS[0][vi * 3 + 1] > -1.5);
}

/** Camera framing — building mass only, excludes street/plaza in front. */
export function getFramingBounds() {
  const yMin = GY + 0.02;
  const yMax = OFFICE_TOP + 0.38;
  const zMax = FRONT + 0.35;
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
      if (y < -4 || y < yMin || y > yMax || z > zMax) continue;
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
export const BUILDING_BOUNDS = getBuildingBounds();
export const FRAMING_BOUNDS = getFramingBounds();

export function lerpEraPositions(fromIndex, toIndex, t, target) {
  const from = ERA_POSITIONS[fromIndex];
  const to = ERA_POSITIONS[toIndex];
  const eased = easeInOutCubic(t);
  for (let i = 0; i < target.length; i += 1) {
    target[i] = from[i] + (to[i] - from[i]) * eased;
  }
}

export function lerpEraVertexColors(fromIndex, toIndex, t, target) {
  const from = ERA_VERTEX_COLORS[fromIndex];
  const to = ERA_VERTEX_COLORS[toIndex];
  const eased = easeInOutCubic(t);
  for (let i = 0; i < target.length; i += 1) {
    target[i] = from[i] + (to[i] - from[i]) * eased;
  }
}

export const lerpEraPointColors = lerpEraVertexColors;
export const lerpColorBuffers = lerpEraVertexColors;

export function lerpEraColors(fromIndex, toIndex, t, target) {
  const from = ERA_COLORS[fromIndex];
  const to = ERA_COLORS[toIndex];
  const eased = easeInOutCubic(t);
  target[0] = from[0] + (to[0] - from[0]) * eased;
  target[1] = from[1] + (to[1] - from[1]) * eased;
  target[2] = from[2] + (to[2] - from[2]) * eased;
}
