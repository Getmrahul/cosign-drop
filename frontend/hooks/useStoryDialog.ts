import { useCallback, useEffect, useRef, useState } from 'react';
export default function useStoryDialog(selected: string | null) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const returnToStory = useRef<{
    mode: 'modal' | 'bubble';
    scrollTop: number;
  } | null>(null);
  const [storyMode, setStoryMode] = useState<'modal' | 'bubble'>('modal');
  const [storyOpen, setStoryOpen] = useState(false);
  const openStory = useCallback((mode: 'modal' | 'bubble') => {
    returnToStory.current = null;
    if (dialog.current?.open) dialog.current.close();
    setStoryMode(mode);
    if (mode === 'modal') dialog.current?.showModal();
    else dialog.current?.show();
    setStoryOpen(true);
  }, []);
  function pauseStory() {
    returnToStory.current = {
      mode: storyMode,
      scrollTop: scroll.current?.scrollTop ?? 0,
    };
    dialog.current?.close();
  }
  useEffect(() => {
    if (selected || !returnToStory.current) return;
    const frame = window.requestAnimationFrame(() => {
      const saved = returnToStory.current;
      if (!saved) return;
      openStory(saved.mode);
      // show()/showModal() focuses the close button; restore reading position
      // afterwards so that focus does not scroll the note back to the top.
      if (scroll.current) scroll.current.scrollTop = saved.scrollTop;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selected, openStory]);
  function toggleStory() {
    if (dialog.current?.open && storyMode === 'bubble') dialog.current.close();
    else openStory('bubble');
  }
  function onStoryClose() {
    setStoryOpen(Boolean(dialog.current?.open));
  }
  return {
    dialog,
    scroll,
    storyMode,
    storyOpen,
    openStory,
    pauseStory,
    toggleStory,
    onStoryClose,
  };
}
