import { useEffect, type RefObject } from 'react';
import type { EvidenceFocus } from '@/types/network';

/** Reveal evidence within the card without scrolling the page or graph. */
export default function useEvidenceFocus(
  scrollRef: RefObject<HTMLDivElement | null>,
  focus: EvidenceFocus | null,
) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !focus) return;
    const receipt = Array.from(
      container.querySelectorAll<HTMLElement>('[data-edge-ids]'),
    ).find((element) =>
      element.dataset.edgeIds?.split(' ').includes(focus.edgeId),
    );
    if (!receipt) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const top =
      container.scrollTop +
      receipt.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      64;
    container.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
    receipt.focus({ preventScroll: true });
    const animation = receipt.animate(
      [
        { backgroundColor: '#eee4f8' },
        { backgroundColor: '#eee4f8', offset: 0.6 },
        { backgroundColor: 'transparent' },
      ],
      { duration: reducedMotion ? 0 : 1800 },
    );
    return () => animation.cancel();
  }, [scrollRef, focus]);
}
