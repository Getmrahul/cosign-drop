import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Node } from '@/types/network';
import Avatar from '@/components/Avatar';
export default function NetworkSearch({
  search,
  query,
  setQuery,
  found,
  onSelect,
}: {
  search: RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (value: string) => void;
  found: Node[];
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (expanded) search.current?.focus();
  }, [expanded, search]);
  useEffect(() => {
    const openWithShortcut = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        !(event.target instanceof HTMLInputElement) &&
        window.matchMedia('(max-width: 600px)').matches
      ) {
        setExpanded(true);
      }
    };
    window.addEventListener('keydown', openWithShortcut);
    return () => window.removeEventListener('keydown', openWithShortcut);
  }, []);
  function closeSearch() {
    setExpanded(false);
    setQuery('');
    trigger.current?.focus();
  }
  function choose(id: string) {
    onSelect(id);
    setExpanded(false);
    search.current?.blur();
  }
  return (
    <div
      className={'toolbar' + (expanded ? ' search-expanded' : '')}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          event.stopPropagation();
          closeSearch();
        }
      }}>
      <button
        className="mobile-search-toggle"
        ref={trigger}
        aria-label="Search the network"
        aria-expanded={expanded}
        aria-controls="network-search-panel"
        onClick={() => setExpanded(!expanded)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      </button>
      <div className="search-panel" id="network-search-panel">
        <div className="search-panel-row">
          <label className="search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              ref={search}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && found[0]) choose(found[0].id);
              }}
              placeholder="Find a person or company"
              aria-label="Find a person or company"
              autoComplete="off"
            />
            <kbd>/</kbd>
          </label>
          <button
            className="mobile-search-close"
            aria-label="Close search"
            onClick={closeSearch}>
            ×
          </button>
        </div>
        {expanded && !query.trim() && (
          <p className="mobile-search-hint">
            Find people and companies in the network.
          </p>
        )}
        {query.trim() && (
          <div className="results">
            {found.length ? (
              found.map((n) => (
                <button
                  className="search-result"
                  key={n.id}
                  onClick={() => choose(n.id)}>
                  <Avatar node={n} />
                  <span>
                    <strong>{n.name}</strong>
                    <small>
                      {n.type === 'organization' ? 'Company' : `@${n.handle}`}
                    </small>
                  </span>
                </button>
              ))
            ) : (
              <p className="no-results">No matches. Try another name.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
