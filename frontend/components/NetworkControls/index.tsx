import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import type { Kind, View } from '@/types/network';
import { FILTERS, INITIAL, TYPES } from '@/utils/relationships';
export default function NetworkControls({
  filters,
  setFilters,
  view,
  zoomAt,
  closeCard,
  fit,
}: {
  filters: Kind[];
  setFilters: Dispatch<SetStateAction<Kind[]>>;
  view: View;
  zoomAt: (factor: number) => void;
  closeCard: () => void;
  fit: () => void;
}) {
  return (
    <>
      {' '}
      <div className="bottom-bar">
        <div className="legend" aria-label="Filter relationships">
          <span className="legend-label">CONNECTIONS</span>
          <div id="filters">
            {FILTERS.map((t) => (
              <button
                key={t}
                className="filter"
                data-directed={TYPES[t].directed}
                aria-pressed={filters.includes(t)}
                onClick={() =>
                  setFilters((f) =>
                    f.includes(t) ? f.filter((x) => x !== t) : [...f, t],
                  )
                }
                style={{ '--color': TYPES[t].color } as CSSProperties}>
                <span className="line-swatch" />
                {TYPES[t].label}
              </button>
            ))}
          </div>
        </div>
        <div className="zoom">
          <button aria-label="Zoom out" onClick={() => zoomAt(1 / 1.12)}>
            −
          </button>
          <output aria-label="Zoom level">{Math.round(view.k * 100)}%</output>
          <button aria-label="Zoom in" onClick={() => zoomAt(1.12)}>
            +
          </button>
          <span />
          <button
            aria-label="Fit entire network"
            title="Fit entire network"
            onClick={() => {
              closeCard();
              fit();
            }}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 7V3h4m6 0h4v4M3 13v4h4m6 0h4v-4" />
            </svg>
          </button>
        </div>
      </div>
      {!filters.length && (
        <div className="empty">
          <strong>No connections in this view</strong>
          <p>Turn on a relationship type to keep exploring.</p>
          <button onClick={() => setFilters(INITIAL)}>Show connections</button>
        </div>
      )}
    </>
  );
}
