export const BREAKPOINT_TABLET = 640;
export const BREAKPOINT_DESKTOP = 1024;

export function getViewportWidth() {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth;
}

export function isMobileWidth(width) {
  return width < BREAKPOINT_TABLET;
}

export function isTabletWidth(width) {
  return width >= BREAKPOINT_TABLET && width < BREAKPOINT_DESKTOP;
}

export function isDesktopWidth(width) {
  return width >= BREAKPOINT_DESKTOP;
}

export function getViewportTier(width = getViewportWidth()) {
  if (isDesktopWidth(width)) return 'desktop';
  if (isTabletWidth(width)) return 'tablet';
  return 'mobile';
}

export function isMobileViewport() {
  return isMobileWidth(getViewportWidth());
}

export function isTabletViewport() {
  return isTabletWidth(getViewportWidth());
}

export function isTabletUpViewport() {
  return getViewportWidth() >= BREAKPOINT_TABLET;
}

export function isDesktopViewport() {
  return isDesktopWidth(getViewportWidth());
}
