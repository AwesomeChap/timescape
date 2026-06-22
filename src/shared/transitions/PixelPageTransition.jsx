import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { animateCellOpacities } from './pixelTransitionAnimate';
import {
  PIXEL_COVER_DURATION_S,
  PIXEL_REVEAL_DURATION_S,
  computePixelTransitionRects,
  getPixelFillRgb,
  getPixelTransitionStagger,
  shouldUsePixelTransition,
} from './pixelTransitionGrid';
import { isMobileViewport } from '@/shared/utils/responsive';
import './styles/PixelPageTransition.scss';

function scheduleFrame(callback) {
  let scheduled = false;
  let frame = 0;

  return {
    schedule() {
      if (scheduled) return;
      scheduled = true;
      frame = window.requestAnimationFrame(() => {
        scheduled = false;
        frame = 0;
        callback();
      });
    },
    cancel() {
      if (frame) window.cancelAnimationFrame(frame);
      scheduled = false;
      frame = 0;
    },
  };
}

const PixelPageTransition = forwardRef(function PixelPageTransition(_props, ref) {
  const canvasRef = useRef(null);
  const rectsRef = useRef([]);
  const cellsRef = useRef([]);
  const dprRef = useRef(1);
  const cancelAnimRef = useRef(null);
  const frameSchedulerRef = useRef(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      isMobileViewport() ? 1.25 : /firefox/i.test(navigator.userAgent) ? 1.5 : 2,
    );
    dprRef.current = dpr;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, []);

  const rebuildGrid = useCallback(() => {
    resizeCanvas();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const rects = computePixelTransitionRects(width, height);
    rectsRef.current = rects;
    cellsRef.current = rects.map(() => ({ v: 0 }));
  }, [resizeCanvas]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const rects = rectsRef.current;
    const cells = cellsRef.current;
    if (!canvas || !rects.length || !cells.length) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = dprRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rgb = getPixelFillRgb();
    let maxOpacity = 0;

    for (let i = 0; i < rects.length; i += 1) {
      const opacity = cells[i].v;
      if (opacity > maxOpacity) maxOpacity = opacity;
      if (opacity < 0.004) continue;

      const clamped = Math.min(1, Math.max(0, opacity));
      ctx.fillStyle = `rgba(${rgb}, ${0.97 * clamped})`;
      const { x, y, w, h } = rects[i];
      ctx.fillRect(x, y, w, h);
    }

    canvas.style.pointerEvents = maxOpacity > 0.04 ? 'auto' : 'none';
  }, []);

  const scheduleDraw = useCallback(() => {
    frameSchedulerRef.current?.schedule();
  }, []);

  const stopAnimation = useCallback(() => {
    cancelAnimRef.current?.();
    cancelAnimRef.current = null;
    frameSchedulerRef.current?.cancel();
  }, []);

  const runAnimation = useCallback(
    (target) =>
      new Promise((resolve) => {
        const cells = cellsRef.current;
        if (!cells.length || (target === 0 && !cells.some((cell) => cell.v > 0.02))) {
          resolve();
          return;
        }

        stopAnimation();

        const cover = target === 1;
        cancelAnimRef.current = animateCellOpacities(cells, target, {
          duration: cover ? PIXEL_COVER_DURATION_S : PIXEL_REVEAL_DURATION_S,
          stagger: getPixelTransitionStagger(cover),
          onUpdate: scheduleDraw,
          onComplete: () => {
            draw();
            cancelAnimRef.current = null;
            resolve();
          },
        });
      }),
    [draw, scheduleDraw, stopAnimation],
  );

  const cover = useCallback(() => runAnimation(1), [runAnimation]);
  const reveal = useCallback(
  () =>
    runAnimation(0).then(() => {
      document.body.classList.remove('page-transitioning', 'page-transition--pixel');
    }),
  [runAnimation],
  );

  useImperativeHandle(
    ref,
    () => ({
      async navigate(onSwap) {
        if (!shouldUsePixelTransition()) {
          onSwap();
          return;
        }

        document.body.classList.add('page-transitioning', 'page-transition--pixel');
        rebuildGrid();
        await cover();
        onSwap();
        await reveal();
      },
    }),
    [cover, rebuildGrid, reveal],
  );

  useEffect(() => {
    frameSchedulerRef.current = scheduleFrame(draw);
    rebuildGrid();

    const onResize = () => {
      if (!cellsRef.current.some((cell) => cell.v > 0.02)) {
        rebuildGrid();
        draw();
        return;
      }

      stopAnimation();
      rebuildGrid();
      cellsRef.current.forEach((cell) => {
        cell.v = 1;
      });
      document.body.classList.remove('page-transitioning', 'page-transition--pixel');
      draw();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      stopAnimation();
      frameSchedulerRef.current?.cancel();
      document.body.classList.remove('page-transitioning', 'page-transition--pixel');
    };
  }, [draw, rebuildGrid, stopAnimation]);

  return <canvas ref={canvasRef} className="pixel-transition-canvas" aria-hidden="true" />;
});

export default PixelPageTransition;
