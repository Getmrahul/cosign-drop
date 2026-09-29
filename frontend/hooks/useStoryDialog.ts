import { useRef, useState } from 'react';
export default function useStoryDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [storyMode, setStoryMode] = useState<'modal' | 'bubble'>('modal');
  const [storyOpen, setStoryOpen] = useState(false);
  function openStory(mode: 'modal' | 'bubble') {
    if (dialog.current?.open) dialog.current.close();
    setStoryMode(mode);
    if (mode === 'modal') dialog.current?.showModal();
    else dialog.current?.show();
    setStoryOpen(true);
  }
  function toggleStory() {
    if (dialog.current?.open && storyMode === 'bubble') dialog.current.close();
    else openStory('bubble');
  }
  function onStoryClose() {
    setStoryOpen(Boolean(dialog.current?.open));
  }
  return { dialog, storyMode, storyOpen, openStory, toggleStory, onStoryClose };
}
