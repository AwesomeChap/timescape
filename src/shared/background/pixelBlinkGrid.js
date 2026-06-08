import {
  isDesktopViewport,
  isMobileViewport,
  isMobileWidth,
} from '@/shared/utils/responsive';

export const PIXEL_BLINK_TARGET_CELL_PX = 14;
export const PIXEL_BLINK_TARGET_CELL_PX_MOBILE = 24;
export const PIXEL_BLINK_MAX_CELLS = 1200;
export const PIXEL_BLINK_MIN_CELL_PX = 12;
export const PIXEL_BLINK_MIN_CELL_PX_MOBILE = 20;

export const PIXEL_BLINK_TICK_MS_TABLET = 380;
export const PIXEL_BLINK_TICK_MS_DESKTOP = 500;
export const PIXEL_BLINK_TICK_MS_MOBILE = 300;
export const PIXEL_BLINKS_PER_TICK_TABLET = 2;
export const PIXEL_BLINKS_PER_TICK_DESKTOP = 2;
export const PIXEL_BLINKS_PER_TICK_MOBILE = 2;

export const PIXEL_BLINK_GAP_PX = 3;
export const PIXEL_TONE_COUNT = 5;

export function isMobileBlinkViewport() {
  return isMobileViewport();
}

export function getPixelBlinkTickMs() {
  if (isMobileBlinkViewport()) return PIXEL_BLINK_TICK_MS_MOBILE;
  if (isDesktopViewport()) return PIXEL_BLINK_TICK_MS_DESKTOP;
  return PIXEL_BLINK_TICK_MS_TABLET;
}

export function getPixelBlinksPerTick() {
  if (isMobileBlinkViewport()) return PIXEL_BLINKS_PER_TICK_MOBILE;
  if (isDesktopViewport()) return PIXEL_BLINKS_PER_TICK_DESKTOP;
  return PIXEL_BLINKS_PER_TICK_TABLET;
}

export function computePixelBlinkGrid(viewportW, viewportH) {
  const gap = PIXEL_BLINK_GAP_PX;
  const w = Math.max(viewportW, 1);
  const h = Math.max(viewportH, 1);
  const mobile = isMobileWidth(w);
  let cellPx = mobile ? PIXEL_BLINK_TARGET_CELL_PX_MOBILE : PIXEL_BLINK_TARGET_CELL_PX;
  const minCellPx = mobile ? PIXEL_BLINK_MIN_CELL_PX_MOBILE : PIXEL_BLINK_MIN_CELL_PX;

  let cols = Math.ceil(w / (cellPx + gap));
  let rows = Math.ceil(h / (cellPx + gap));

  while (cols * rows > PIXEL_BLINK_MAX_CELLS && cellPx < 48) {
    cellPx += 2;
    cols = Math.ceil(w / (cellPx + gap));
    rows = Math.ceil(h / (cellPx + gap));
  }

  if (cellPx < minCellPx) {
    cellPx = minCellPx;
    cols = Math.ceil(w / (cellPx + gap));
    rows = Math.ceil(h / (cellPx + gap));
  }

  return { cols, rows, cellPx, gap };
}

export function cellToneIndex(row, col) {
  const hash = (row * 374761393) ^ (col * 668265263);
  return (hash >>> 0) % PIXEL_TONE_COUNT;
}

export function pickBlinkBatch(cells, count) {
  if (!cells.length || count <= 0) return [];

  const picked = [];
  const maxAttempts = count * 5;
  let attempts = 0;

  while (picked.length < count && attempts < maxAttempts) {
    attempts += 1;
    const cell = cells[Math.floor(Math.random() * cells.length)];
    if (!cell || cell.classList.contains('is-blinking') || picked.includes(cell)) continue;
    picked.push(cell);
  }

  return picked;
}
