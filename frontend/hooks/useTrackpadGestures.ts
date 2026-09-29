import { useEffect, type RefObject } from 'react';
import type { Point, View } from '@/types/network';
import { wheelCamera, zoomCamera } from '@/utils/viewport';
interface GestureOptions {
  svg: RefObject<SVGSVGElement | null>;
  pointers: RefObject<Map<number, Point>>;
  viewRef: RefObject<View>;
  targetView: RefObject<View>;
  applyView: (view: View) => void;
  stopMotion: () => void;
  clearHover: () => void;
}
export default function useTrackpadGestures({
  svg,
  pointers,
  viewRef,
  targetView,
  applyView,
  stopMotion,
  clearHover,
}: GestureOptions) {
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    let renderFrame: number | null = null;
    let nativePinch: { view: View; anchor: Point; scale: number } | null = null;
    const commit = (next: View) => {
      viewRef.current = next;
      targetView.current = next;
      if (renderFrame === null)
        renderFrame = requestAnimationFrame(() => {
          renderFrame = null;
          applyView(viewRef.current);
        });
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (nativePinch) return;
      stopMotion();
      clearHover();
      const b = el.getBoundingClientRect();
      commit(
        wheelCamera(
          viewRef.current,
          {
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaMode: e.deltaMode,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            shiftKey: e.shiftKey,
            x: e.clientX - b.left,
            y: e.clientY - b.top,
          },
          b.height,
        ),
      );
    };
    type NativeGesture = Event & {
      scale: number;
      clientX: number;
      clientY: number;
    };
    const start = (event: Event) => {
      event.preventDefault();
      if (pointers.current.size >= 2) return;
      stopMotion();
      clearHover();
      const e = event as NativeGesture,
        b = el.getBoundingClientRect();
      const anchor =
        Number.isFinite(e.clientX) &&
        Number.isFinite(e.clientY) &&
        (e.clientX !== 0 || e.clientY !== 0)
          ? { x: e.clientX - b.left, y: e.clientY - b.top }
          : { x: b.width / 2, y: b.height / 2 };
      nativePinch = { view: viewRef.current, anchor, scale: e.scale || 1 };
    };
    const change = (event: Event) => {
      event.preventDefault();
      if (!nativePinch) return;
      const scale = (event as NativeGesture).scale;
      if (Number.isFinite(scale) && scale > 0)
        commit(
          zoomCamera(
            nativePinch.view,
            scale / nativePinch.scale,
            nativePinch.anchor,
          ),
        );
    };
    const end = (event: Event) => {
      if (nativePinch) {
        change(event);
        nativePinch = null;
      }
    };
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('gesturestart', start, { passive: false });
    el.addEventListener('gesturechange', change, { passive: false });
    el.addEventListener('gestureend', end, { passive: false });
    return () => {
      if (renderFrame !== null) cancelAnimationFrame(renderFrame);
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('gesturestart', start);
      el.removeEventListener('gesturechange', change);
      el.removeEventListener('gestureend', end);
    };
  }, [svg, pointers, viewRef, targetView, applyView, stopMotion, clearHover]);
}
