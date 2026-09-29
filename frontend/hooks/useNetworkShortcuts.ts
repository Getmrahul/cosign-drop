import { useEffect, type RefObject } from 'react';
export default function useNetworkShortcuts(
  dialog: RefObject<HTMLDialogElement | null>,
  search: RefObject<HTMLInputElement | null>,
  closeCard: () => void,
  setQuery: (value: string) => void,
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dialog.current?.open) {
          dialog.current.close();
          return;
        }
        closeCard();
        setQuery('');
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeCard, dialog, search, setQuery]);
}
