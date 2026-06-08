import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  cellToneIndex,
  computePixelBlinkGrid,
  getPixelBlinkTickMs,
  getPixelBlinksPerTick,
  pickBlinkBatch,
} from './pixelBlinkGrid';
import './styles/PixelBlinkBackground.scss';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function buildGridElement(gridEl, spec) {
  gridEl.replaceChildren();
  gridEl.style.setProperty('--pixel-cols', String(spec.cols));
  gridEl.style.setProperty('--pixel-rows', String(spec.rows));
  gridEl.style.setProperty('--pixel-gap', `${spec.gap}px`);

  const cells = [];
  for (let row = 0; row < spec.rows; row += 1) {
    for (let col = 0; col < spec.cols; col += 1) {
      const cell = document.createElement('span');
      const tone = cellToneIndex(row, col);
      cell.className = `pixel-blink-cell pixel-blink-cell--tone-${tone}`;
      gridEl.appendChild(cell);
      cells.push(cell);
    }
  }
  return cells;
}

export default function PixelBlinkBackground({ className = '', enabled = true }) {
  const gridRef = useRef(null);
  const cellsRef = useRef([]);
  const tickRef = useRef(null);
  const resizeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [gridSpec, setGridSpec] = useState(() =>
    typeof window !== 'undefined'
      ? computePixelBlinkGrid(window.innerWidth, window.innerHeight)
      : { cols: 48, rows: 36, cellPx: 14, gap: 3 },
  );

  const rebuildGrid = useCallback(() => {
    setGridSpec(computePixelBlinkGrid(window.innerWidth, window.innerHeight));
  }, []);

  useEffect(() => {
    const onResize = () => {
      window.clearTimeout(resizeRef.current);
      resizeRef.current = window.setTimeout(rebuildGrid, 160);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeRef.current);
    };
  }, [rebuildGrid]);

  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return undefined;

    cellsRef.current = buildGridElement(gridEl, gridSpec);

    if (!enabled || reducedMotion) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
      return undefined;
    }

    const tick = () => {
      if (document.hidden) return;

      const count = getPixelBlinksPerTick();
      const batch = pickBlinkBatch(cellsRef.current, count);

      batch.forEach((cell) => {
        cell.classList.remove('is-blinking');
        void cell.offsetWidth;
        cell.classList.add('is-blinking');
        cell.addEventListener(
          'animationend',
          () => cell.classList.remove('is-blinking'),
          { once: true },
        );
      });
    };

    const intervalMs = getPixelBlinkTickMs();

    tick();
    tickRef.current = window.setInterval(tick, intervalMs);

    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, reducedMotion, gridSpec]);

  const rootClass = ['pixel-blink-bg', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass} aria-hidden="true">
      <div ref={gridRef} className="pixel-blink-grid" />
      <div className="pixel-blink-grain" aria-hidden="true" />
    </div>
  );
}
