export const era1996 = {
  id: '1996',
  year: 1996,
  label: 'Reconstruction',
  description:
    'Reconstructed true to original plans using authentic materials. Reopened January 26, 1996 as the Mozart Residence Museum.',
  photo: null,
  pointKey: 'era1996',
  color: [0.78, 0.67, 0.5],
};

const FACADE_WINDOW_CENTERS = [-3.35, -2.2, -1.05, 0.1, 1.25, 2.4, 3.45];

function isWindowColumn(x) {
  return FACADE_WINDOW_CENTERS.some((center) => Math.abs(x - center) < 0.36);
}

function nextNoise(hash, seedRef, spread = 1) {
  const value = hash(seedRef.current);
  seedRef.current += 1;
  return (value - 0.5) * spread;
}

export function addEra1996PointDetails({
  dimensions,
  hash,
  hiddenToPresent,
  push4,
  seedRef,
  steps,
}) {
  const { D, FULL_MIN_X, H, ROOF_H, W } = dimensions;

  {
    const floors = [
      { y: 1.45, w: 0.48, h: 0.72 },
      { y: 3.05, w: 0.5, h: 0.68 },
    ];

    FACADE_WINDOW_CENTERS.forEach((cx) => {
      floors.forEach(({ y, w, h }) => {
        const nu = steps(4), nv = steps(5);
        for (let iu = 0; iu <= nu; iu++) {
          for (let iv = 0; iv <= nv; iv++) {
            const u = iu / nu, v = iv / nv;
            const frameX = cx + (u - 0.5) * (w + 0.2);
            const frameY = y + (v - 0.5) * (h + 0.22);
            const isFrame =
              iu === 0 ||
              iu === nu ||
              iv === 0 ||
              iv === nv ||
              iu === Math.floor(nu / 2);
            const z = D / 2 + (isFrame ? 0.105 : 0.13);
            push4(...hiddenToPresent([frameX, frameY, z]));
          }
        }
      });
    });
  }

  {
    const nu = steps(40), nv = steps(21);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const x = FULL_MIN_X + u * W;
        const y = 0.24 + v * (H - 0.42);
        const windowRow =
          (y > 1.02 && y < 2.05) ||
          (y > 2.62 && y < 3.76);

        if (windowRow && isWindowColumn(x)) continue;

        const breathing = nextNoise(hash, seedRef, 0.032);
        push4(...hiddenToPresent([x, y, D / 2 + 0.035 + breathing]));
      }
    }
  }

  {
    const nu = steps(38);
    for (let iu = 0; iu <= nu; iu++) {
      const u = iu / nu;
      const x = FULL_MIN_X + u * W;
      push4(...hiddenToPresent([x, H + ROOF_H + 0.03, 0]));
      push4(...hiddenToPresent([x, H + 0.08, D / 2 + 0.06]));
      push4(...hiddenToPresent([x, H + 0.08, -D / 2 - 0.06]));
    }
  }

  {
    const nu = steps(30), nv = steps(7);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const x = FULL_MIN_X + u * W;
        const y = H + v * ROOF_H;
        const z = (1 - v) * D / 2 + nextNoise(hash, seedRef, 0.03);
        push4(...hiddenToPresent([x, y, z]));
        push4(...hiddenToPresent([x, y, -z]));
      }
    }
  }

  {
    const sideXs = [FULL_MIN_X, FULL_MIN_X + W];
    sideXs.forEach((x) => {
      const nu = steps(12), nv = steps(16);
      for (let iu = 0; iu <= nu; iu++) {
        for (let iv = 0; iv <= nv; iv++) {
          const u = iu / nu, v = iv / nv;
          const z = -D / 2 + u * D;
          const y = 0.28 + v * (H - 0.46);
          const edgeNoise = nextNoise(hash, seedRef, 0.026);
          push4(...hiddenToPresent([x + edgeNoise, y, z]));
        }
      }
    });
  }

  {
    const nu = steps(9), nv = steps(11);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const x = -0.1 + (u - 0.5) * 0.98;
        const y = 0.12 + v * 1.66;
        push4(...hiddenToPresent([x, y, D / 2 + 0.16]));
      }
    }

    for (let i = 0; i <= steps(14); i++) {
      const t = i / steps(14);
      push4(...hiddenToPresent([-0.98 + t * 1.76, 1.9, D / 2 + 0.18]));
      push4(...hiddenToPresent([-0.98 + t * 1.76, 2.08, D / 2 + 0.18]));
    }
  }

  {
    const nu = steps(30), nv = steps(11);
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const u = iu / nu, v = iv / nv;
        const x = -4.8 + u * 9.6;
        const z = 2.55 + v * 1.85;
        const y = -0.045 + nextNoise(hash, seedRef, 0.018);
        push4(...hiddenToPresent([x, y, z]));
      }
    }
  }
}
