/**
 * Mozart Wohnhaus (Tanzmeisterhaus), Makartplatz 8, Salzburg.
 * Point-cloud with four eras sharing point-count and order for coherent morphs:
 *   0 — 1617: two separate buildings on Hannibalplatz
 *   1 — 1773: unified Mozart-era building
 *   2 — 1944: Allied bombing — right third survives, left two thirds rubble
 *   3 — 1996: fully reconstructed Mozart Residence Museum
 */

import { easeInOutCubic } from './timescapeMeta';
import { ERA_COLORS, ERA_POINT_KEYS } from './eras';
import { addEra1996PointDetails } from './eras/era1996';
export { easeInOutCubic } from './timescapeMeta';

const DENSITY = 2.25;
const HIDDEN = [0, -8, 0];

function steps(n) { return Math.max(1, Math.round(n * DENSITY)); }

function hash(s) {
  const v = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function scatter(p, drop, s) {
  return [
    p[0] + (hash(s) - 0.5) * 0.85,
    p[1] - drop - hash(s + 1) * 0.45,
    p[2] + (hash(s + 2) - 0.5) * 0.75,
  ];
}

function hiddenToPresent(p) {
  return [[...HIDDEN], [...HIDDEN], [...HIDDEN], p];
}

// ─── Building dimensions ────────────────────────────────────────────────────
// Unified building (1773 / 1996)
const W = 8, H = 5, D = 6;
const FULL_MIN_X = -W / 2;   // -4
const FULL_MAX_X =  W / 2;   //  4

// Surviving right section (1944) — guide: cx=2.5, width=2.5
const R_CX = 2.5, R_W = 2.5;
const R_MIN = R_CX - R_W / 2;   // 1.25
const R_MAX = R_CX + R_W / 2;   // 3.75

// Left section (destroyed 1944)
const L_MIN = FULL_MIN_X;        // -4
const L_MAX = R_MIN;             //  1.25
const L_W   = L_MAX - L_MIN;    //  5.25
const L_CX  = (L_MIN + L_MAX) / 2;  // -1.375

// Roof heights
const ROOF_H   = 1.4;   // full building / right section
const ROOF_H_L = 1.0;   // 1617 left building
const ROOF_H_R = 0.9;   // 1617 right building

// 1617 left standalone building — guide: cx=-2.5, w=3, h=4, d=6
const LB_CX = -2.5, LB_W = 3, LB_H = 4, LB_D = D;
const LB_MIN = LB_CX - LB_W / 2;   // -4
const LB_MAX = LB_CX + LB_W / 2;   // -1

// 1617 right standalone building — guide: cx=2, w=2.5, h=3.5, d=5
const RB_CX = 2, RB_W = 2.5, RB_H = 3.5, RB_D = 5;
const RB_MIN = RB_CX - RB_W / 2;   // 0.75
const RB_MAX = RB_CX + RB_W / 2;   // 3.25

// ─── Coordinate mappers ─────────────────────────────────────────────────────
// u,v ∈ [0,1] → absolute 3D position in each era

/** Left section parametric → 1617 left building */
function leftTo1617(u, v, w) {
  return [LB_MIN + u * LB_W, v * LB_H, (w - 0.5) * LB_D];
}
/** Left section parametric → 1773 / 1996 unified building left portion */
function leftTo1773(u, v, w) {
  return [L_MIN + u * L_W, v * H, (w - 0.5) * D];
}

/** Right section parametric → 1617 right building */
function rightTo1617(u, v, w) {
  return [RB_MIN + u * RB_W, v * RB_H, (w - 0.5) * RB_D];
}
/** Right section parametric → 1773 / 1944 / 1996 right portion */
function rightTo1773(u, v, w) {
  return [R_MIN + u * R_W, v * H, (w - 0.5) * D];
}

// ─── Slot builder ────────────────────────────────────────────────────────────
function buildSlots() {
  const slots = [];
  let seed = 0;

  function push4(e1617, e1773, e1944, e1996) {
    slots.push({ era1617: e1617, era1773: e1773, era1944: e1944, era1996: e1996 });
  }

  // ── Ground / cobblestone forecourt ─────────────────────────────────────
  {
    const nu = steps(26), nv = steps(18);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const x = -5.2 + (iu / nu) * 10.4;
        const z = -3.8 + (iv / nv) * 7.6;
        const p = [x, -0.05, z];
        push4([...p], [...p], [...p], [...p]);
      }
    }
  }

  // ── RIGHT SECTION — body volume ─────────────────────────────────────────
  {
    const nu = steps(4), nv = steps(8), nw = steps(6);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        for (let iw = 0; iw <= nw; iw++) {
          const u = iu / nu, v = iv / nv, w = iw / nw;
          push4(rightTo1617(u, v, w), rightTo1773(u, v, w),
                rightTo1773(u, v, w), rightTo1773(u, v, w));
        }
      }
    }
  }

  // Right front facade
  {
    const nu = steps(8), nv = steps(10);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1773 = [R_MIN + u * R_W, v * H, D / 2];
        const p1617 = [RB_MIN + u * RB_W, v * RB_H, RB_D / 2];
        push4(p1617, p1773, [...p1773], [...p1773]);
      }
    }
  }

  // Right back facade
  {
    const nu = steps(8), nv = steps(10);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1773 = [R_MIN + u * R_W, v * H, -D / 2];
        const p1617 = [RB_MIN + u * RB_W, v * RB_H, -RB_D / 2];
        push4(p1617, p1773, [...p1773], [...p1773]);
      }
    }
  }

  // Right end wall (far right)
  {
    const nu = steps(7), nv = steps(10);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1773 = [R_MAX, v * H, (u - 0.5) * D];
        const p1617 = [RB_MAX, v * RB_H, (u - 0.5) * RB_D];
        push4(p1617, p1773, [...p1773], [...p1773]);
      }
    }
  }

  // ── RIGHT ROOF ───────────────────────────────────────────────────────────
  {
    const nu = steps(6), nv = steps(5);
    for (let side of [-1, 1]) {
      for (let iu = 0; iu <= nu; iu++) {
        for (let iv = 0; iv <= nv; iv++) {
          const u = iu / nu, v = iv / nv;
          const p1773 = [R_MIN + u * R_W, H + v * ROOF_H, side * (1 - v) * D / 2];
          const p1617 = [RB_MIN + u * RB_W, RB_H + v * ROOF_H_R, side * (1 - v) * RB_D / 2];
          push4(p1617, p1773, [...p1773], [...p1773]);
        }
      }
    }
  }

  // ── LEFT SECTION — body volume ──────────────────────────────────────────
  {
    const nu = steps(9), nv = steps(8), nw = steps(6);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        for (let iw = 0; iw <= nw; iw++) {
          const u = iu / nu, v = iv / nv, w = iw / nw;
          const p1773 = leftTo1773(u, v, w);
          const p1944 = scatter(p1773, 0.7 + hash(seed) * 1.0, seed++);
          push4(leftTo1617(u, v, w), p1773, p1944, [...p1773]);
        }
      }
    }
  }

  // Left front facade
  {
    const nu = steps(14), nv = steps(10);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1773 = [L_MIN + u * L_W, v * H, D / 2];
        const p1617 = [LB_MIN + u * LB_W, v * LB_H, LB_D / 2];
        const p1944 = scatter(p1773, 0.65 + hash(seed) * 0.9, seed++);
        push4(p1617, p1773, p1944, [...p1773]);
      }
    }
  }

  // Left back facade
  {
    const nu = steps(14), nv = steps(10);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1773 = [L_MIN + u * L_W, v * H, -D / 2];
        const p1617 = [LB_MIN + u * LB_W, v * LB_H, -LB_D / 2];
        const p1944 = scatter(p1773, 0.65 + hash(seed) * 0.9, seed++);
        push4(p1617, p1773, p1944, [...p1773]);
      }
    }
  }

  // Left end wall (far left)
  {
    const nu = steps(7), nv = steps(10);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1773 = [L_MIN, v * H, (u - 0.5) * D];
        const p1617 = [LB_MIN, v * LB_H, (u - 0.5) * LB_D];
        const p1944 = scatter(p1773, 0.7 + hash(seed) * 0.8, seed++);
        push4(p1617, p1773, p1944, [...p1773]);
      }
    }
  }

  // ── LEFT ROOF ────────────────────────────────────────────────────────────
  {
    const nu = steps(12), nv = steps(5);
    for (let side of [-1, 1]) {
      for (let iu = 0; iu <= nu; iu++) {
        for (let iv = 0; iv <= nv; iv++) {
          const u = iu / nu, v = iv / nv;
          const p1773 = [L_MIN + u * L_W, H + v * ROOF_H, side * (1 - v) * D / 2];
          const p1617 = [LB_MIN + u * LB_W, LB_H + v * ROOF_H_L, side * (1 - v) * LB_D / 2];
          const p1944 = scatter(p1773, 1.0 + hash(seed) * 0.9, seed++);
          push4(p1617, p1773, p1944, [...p1773]);
        }
      }
    }
  }

  // ── 1617 interior gap walls ──────────────────────────────────────────────
  // Right face of left building (at x=-1) — exterior in 1617, interior in 1773+
  {
    const nu = steps(7), nv = steps(9);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1617 = [LB_MAX, v * LB_H, (u - 0.5) * LB_D];
        const p1773 = [LB_MAX, v * H, (u - 0.5) * D];
        const p1944 = scatter(p1773, 0.5 + hash(seed) * 0.6, seed++);
        push4(p1617, p1773, p1944, [...p1773]);
      }
    }
  }

  // Left face of right building (at x=0.75) — exterior in 1617, interior in 1773+
  {
    const nu = steps(7), nv = steps(9);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const p1617 = [RB_MIN, v * RB_H, (u - 0.5) * RB_D];
        const p1773 = [RB_MIN, v * H, (u - 0.5) * D];
        push4(p1617, p1773, [...p1773], [...p1773]);
      }
    }
  }

  // ── RUBBLE (1944 only) ────────────────────────────────────────────────────
  {
    const rubbleZones = [
      { cx: -2.0, w: 4.5, d: 3.2, count: 38 },
      { cx: -2.8, w: 3.0, d: 2.0, count: 22 },
      { cx: -0.6, w: 2.0, d: 1.6, count: 16 },
    ];
    rubbleZones.forEach(({ cx, w, d, count }) => {
      for (let i = 0; i < count; i++) {
        const p1944 = [
          cx + (hash(seed++) - 0.5) * w,
          0.18 + hash(seed++) * 0.65,
          (hash(seed++) - 0.5) * d,
        ];
        push4([...HIDDEN], [...HIDDEN], p1944, [...HIDDEN]);
      }
    });
  }

  // ── LOWER WINDOWS — front facade ─────────────────────────────────────────
  // 1773/1996: 5 windows at y≈1.2–2.0; 1944: right section only; 1617: per building
  {
    const WIN_XS  = [-2.8, -1.4, 0, 1.4, 2.8];
    const WIN_W = 0.60, WIN_H = 0.75;
    WIN_XS.forEach((wx) => {
      const nu = steps(3), nv = steps(4);
      for (let iu = 0; iu <= nu; iu++) {
        for (let iv = 0; iv <= nv; iv++) {
          const u = iu / nu, v = iv / nv;
          const px = wx + (u - 0.5) * WIN_W;
          const py = 1.25 + v * WIN_H;
          const p1773 = [px, py, D / 2 + 0.06];
          const p1996 = [px, py, D / 2 + 0.06];
          const inRight = px > R_MIN - 0.25;
          const p1944 = inRight ? [...p1773] : scatter(p1773, 0.55, seed++);

          let p1617;
          if (px <= -0.5) {
            const t = Math.max(0, Math.min(1, (px - LB_MIN) / LB_W));
            p1617 = [LB_MIN + t * LB_W, py * (LB_H / H), LB_D / 2 + 0.06];
          } else {
            const t = Math.max(0, Math.min(1, (px - RB_MIN) / RB_W));
            p1617 = [RB_MIN + t * RB_W, py * (RB_H / H), RB_D / 2 + 0.06];
          }
          push4(p1617, p1773, p1944, p1996);
        }
      }
    });
  }

  // ── UPPER WINDOWS — front facade (not in 1617) ────────────────────────────
  {
    const WIN_XS  = [-2.8, -1.4, 0, 1.4, 2.8];
    const WIN_W = 0.60, WIN_H = 0.70;
    WIN_XS.forEach((wx) => {
      const nu = steps(3), nv = steps(4);
      for (let iu = 0; iu <= nu; iu++) {
        for (let iv = 0; iv <= nv; iv++) {
          const u = iu / nu, v = iv / nv;
          const px = wx + (u - 0.5) * WIN_W;
          const py = 2.85 + v * WIN_H;
          const p1773 = [px, py, D / 2 + 0.06];
          const inRight = px > R_MIN - 0.25;
          const p1944 = inRight ? [...p1773] : scatter(p1773, 0.65, seed++);
          push4([...HIDDEN], p1773, p1944, [...p1773]);
        }
      }
    });
  }

  // ── DECORATIVE CORNICE LINE ────────────────────────────────────────────────
  // A band at the roofline visible in 1773/1996, scattered in 1944 (left side)
  {
    const nu = steps(22), nv = steps(2);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const px = FULL_MIN_X + u * W;
        const py = H - 0.1 + v * 0.2;
        const p1773 = [px, py, D / 2 + 0.04];
        const inRight = px > R_MIN - 0.1;
        const p1944 = inRight ? [...p1773] : scatter(p1773, 0.5, seed++);
        push4([...HIDDEN], p1773, p1944, [...p1773]);
      }
    }
  }

  const seedRef = { current: seed };
  addEra1996PointDetails({
    dimensions: { D, FULL_MIN_X, H, ROOF_H, W },
    hash,
    hiddenToPresent,
    push4,
    seedRef,
    steps,
  });
  seed = seedRef.current;

  return slots;
}

// ─── Flatten to typed arrays ─────────────────────────────────────────────────
const POINT_SLOTS = buildSlots();

function flatten(key) {
  const buf = new Float32Array(POINT_SLOTS.length * 3);
  POINT_SLOTS.forEach((slot, i) => {
    const p = slot[key];
    buf[i * 3]     = p[0];
    buf[i * 3 + 1] = p[1];
    buf[i * 3 + 2] = p[2];
  });
  return buf;
}

export { ERA_COLORS };

export const ERA_POSITIONS = ERA_POINT_KEYS.map((key) => flatten(key));

export const POINT_COUNT = POINT_SLOTS.length;

/** Visible monument bounds (ignores hidden-era sentinel points). */
export function getMonumentBounds() {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  ERA_POSITIONS.forEach((pos) => {
    for (let i = 0; i < pos.length; i += 3) {
      if (pos[i + 1] < -4) continue;
      minX = Math.min(minX, pos[i]);
      minY = Math.min(minY, pos[i + 1]);
      minZ = Math.min(minZ, pos[i + 2]);
      maxX = Math.max(maxX, pos[i]);
      maxY = Math.max(maxY, pos[i + 1]);
      maxZ = Math.max(maxZ, pos[i + 2]);
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
  const to   = ERA_POSITIONS[toIndex];
  const eased = easeInOutCubic(t);
  for (let i = 0; i < target.length; i++) {
    target[i] = from[i] + (to[i] - from[i]) * eased;
  }
}

/** Interpolate era colors. */
export function lerpEraColors(fromIndex, toIndex, t, target) {
  const from  = ERA_COLORS[fromIndex];
  const to    = ERA_COLORS[toIndex];
  const eased = easeInOutCubic(t);
  target[0] = from[0] + (to[0] - from[0]) * eased;
  target[1] = from[1] + (to[1] - from[1]) * eased;
  target[2] = from[2] + (to[2] - from[2]) * eased;
}
