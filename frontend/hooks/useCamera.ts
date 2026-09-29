import { useCallback, useEffect, useRef, useState } from 'react';
import type { View } from '@/types/network';
export default function useCamera() {
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view),
    targetView = useRef(view),
    frame = useRef<number | null>(null);
  const applyView = useCallback((v: View) => {
    viewRef.current = v;
    setView(v);
  }, []);
  const stopMotion = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    targetView.current = viewRef.current;
  }, []);
  const animateView = useCallback(
    (to: View, duration = 340) => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      targetView.current = to;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        applyView(to);
        frame.current = null;
        return;
      }
      const from = viewRef.current,
        start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration),
          ease = 1 - Math.pow(1 - t, 3);
        applyView({
          x: from.x + (to.x - from.x) * ease,
          y: from.y + (to.y - from.y) * ease,
          k: from.k + (to.k - from.k) * ease,
        });
        if (t < 1) frame.current = requestAnimationFrame(tick);
        else frame.current = null;
      };
      frame.current = requestAnimationFrame(tick);
    },
    [applyView],
  );
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  return { view, viewRef, targetView, applyView, stopMotion, animateView };
}
