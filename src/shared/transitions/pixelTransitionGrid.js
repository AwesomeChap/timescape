import { computePixelBlinkGrid } from '@/shared/background/pixelBlinkGrid';
import { isMobileViewport } from '@/shared/utils/responsive';

/** Match portfolio pixel-nav timing (jatinkumar.tech). */
export const PIXEL_COVER_DURATION_S = 0.15;
export const PIXEL_REVEAL_DURATION_S = 0.14;
export const PIXEL_STAGGER_COVER_S = 0.32;
export const PIXEL_STAGGER_REVEAL_S = 0.3;
export const PIXEL_STAGGER_COVER_MOBILE_S = 0.24;
export const PIXEL_STAGGER_REVEAL_MOBILE_S = 0.22;

const FIREFOX_STAGGER_SCALE = 0.85;

function isFirefox() {
  return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
}

export function shouldUsePixelTransition() {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getPixelTransitionStagger(cover) {
  const mobile = isMobileViewport();
  const base = cover
    ? mobile
      ? PIXEL_STAGGER_COVER_MOBILE_S
      : PIXEL_STAGGER_COVER_S
    : mobile
      ? PIXEL_STAGGER_REVEAL_MOBILE_S
      : PIXEL_STAGGER_REVEAL_S;
  return isFirefox() ? base * FIREFOX_STAGGER_SCALE : base;
}

/** Viewport pixel blocks — same grid math as the portfolio mesh background. */
export function computePixelTransitionRects(viewportW, viewportH) {
  const w = Math.max(viewportW, 1);
  const h = Math.max(viewportH, 1);
  const { cols, rows } = computePixelBlinkGrid(w, h);
  const cellW = w / cols;
  const cellH = h / rows;
  const rects = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      rects.push({
        x,
        y,
        w: col === cols - 1 ? w - x + 0.5 : cellW + 0.5,
        h: row === rows - 1 ? h - y + 0.5 : cellH + 0.5,
      });
    }
  }

  return rects;
}

export function getPixelFillRgb() {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'light') return '244, 244, 244';
  return '14, 14, 14';
}
