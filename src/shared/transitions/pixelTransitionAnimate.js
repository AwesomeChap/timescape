function easePower2InOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function shuffleIndices(length) {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Staggered tween for cell opacities — random delay spread like portfolio GSAP stagger.
 */
export function animateCellOpacities(cells, target, options) {
  const {
    duration,
    stagger,
    ease = easePower2InOut,
    onUpdate,
    onComplete,
  } = options;

  if (!cells.length) {
    onComplete?.();
    return () => {};
  }

  const from = cells.map((cell) => cell.v);
  const order = shuffleIndices(cells.length);
  const delays = new Array(cells.length);
  order.forEach((cellIndex, rank) => {
    delays[cellIndex] = (rank / Math.max(cells.length - 1, 1)) * stagger;
  });

  const start = performance.now();
  let raf = 0;

  const tick = (now) => {
    const elapsed = (now - start) / 1000;
    let done = true;

    cells.forEach((cell, i) => {
      const local = Math.max(0, Math.min(1, (elapsed - delays[i]) / duration));
      if (local < 1) done = false;
      cell.v = from[i] + (target - from[i]) * ease(local);
    });

    onUpdate();

    if (done) {
      onComplete?.();
      return;
    }

    raf = window.requestAnimationFrame(tick);
  };

  raf = window.requestAnimationFrame(tick);

  return () => {
    if (raf) window.cancelAnimationFrame(raf);
  };
}
