import type { Camera } from '../types/network';
export const MIN_ZOOM = 0.15,
  MAX_ZOOM = 3;
export function zoomCamera(
  view: Camera,
  factor: number,
  anchor: { x: number; y: number },
): Camera {
  const k = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.k * factor));
  return {
    k,
    x: anchor.x - ((anchor.x - view.x) * k) / view.k,
    y: anchor.y - ((anchor.y - view.y) * k) / view.k,
  };
}
export function wheelCamera(
  view: Camera,
  input: {
    deltaX: number;
    deltaY: number;
    deltaMode: number;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    x: number;
    y: number;
  },
  height: number,
): Camera {
  const unit = input.deltaMode === 1 ? 16 : input.deltaMode === 2 ? height : 1;
  const dx = input.deltaX * unit,
    dy = input.deltaY * unit;
  // Chromium trackpad pinch is a Ctrl-wheel event. Plain scrolling always pans.
  if (input.ctrlKey || input.metaKey)
    return zoomCamera(
      view,
      Math.exp(-Math.max(-100, Math.min(100, dy)) * 0.01),
      input,
    );
  return {
    ...view,
    x: view.x - (input.shiftKey && dx === 0 ? dy : dx),
    y: view.y - (input.shiftKey && dx === 0 ? 0 : dy),
  };
}

/** Fit every connected node and its labels inside the unobscured canvas. */
export function fitConnections(
  points: import('../types/network').Point[],
  area: import('../types/network').ViewportArea,
  maxZoom = 1.1,
): Camera {
  const minX = Math.min(...points.map((p) => p.x)) - 140;
  const maxX = Math.max(...points.map((p) => p.x)) + 140;
  const minY = Math.min(...points.map((p) => p.y)) - 36;
  const maxY = Math.max(...points.map((p) => p.y)) + 76;
  const k = Math.min(
    maxZoom,
    Math.max(1, area.right - area.left) / (maxX - minX),
    Math.max(1, area.bottom - area.top) / (maxY - minY),
  );
  return {
    k,
    x: (area.left + area.right) / 2 - ((minX + maxX) / 2) * k,
    y: (area.top + area.bottom) / 2 - ((minY + maxY) / 2) * k,
  };
}
