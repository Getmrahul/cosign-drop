import { useState, type CSSProperties } from 'react';
import type { GraphData, Point, Edge } from '@/types/network';
import type useNetworkGraph from '@/hooks/useNetworkGraph';
import { TYPES, FILTERS, relationLabel } from '@/utils/relationships';
import { initials, shortName } from '@/utils/format';
export default function NetworkGraph({
  data,
  graph,
  introComplete,
}: {
  data: GraphData;
  introComplete: boolean;
  graph: ReturnType<typeof useNetworkGraph>;
}) {
  const {
    inspectConnection,
    nodeMap,
    points,
    view,
    size,
    ready,
    selected,
    hoveredEdge,
    setHoveredEdge,
    tip,
    setTip,
    failedImages,
    setFailedImages,
    svg,
    targetView,
    viewRef,
    pointers,
    drag,
    visibleEdges,
    neighborIds,
    fit,
    choose,
    closeCard,
    zoomAt,
    animateView,
    down,
    move,
    up,
  } = graph;
  // Capture the initial spatial order so dragging never changes the stagger.
  const [arrival] = useState(() => {
    const ordered = [...data.nodes].sort((a, b) => {
      const pa = points[a.id],
        pb = points[b.id];
      return Math.hypot(pa.x, pa.y) - Math.hypot(pb.x, pb.y);
    });
    return new Map(
      ordered.map((node, index) => [
        node.id,
        80 + (index / Math.max(1, ordered.length - 1)) * 1100,
      ]),
    );
  });
  const parallel = new Map<string, Edge[]>();
  visibleEdges.forEach((e) => {
    const key = [e.source, e.target].sort().join('|');
    parallel.set(key, [...(parallel.get(key) ?? []), e]);
  });
  function curve(e: Edge) {
    const a = points[e.source],
      b = points[e.target],
      dx = b.x - a.x,
      dy = b.y - a.y,
      d = Math.max(1, Math.hypot(dx, dy)),
      group = parallel.get([e.source, e.target].sort().join('|'))!,
      offset =
        (group.indexOf(e) - (group.length - 1) / 2) *
        22 *
        (e.source < e.target ? 1 : -1);
    return `M ${a.x + (dx / d) * 27} ${a.y + (dy / d) * 27} Q ${(a.x + b.x) / 2 - (dy / d) * offset} ${(a.y + b.y) / 2 + (dx / d) * offset} ${b.x - (dx / d) * (e.directed ? 32 : 27)} ${b.y - (dy / d) * (e.directed ? 32 : 27)}`;
  }

  return (
    <>
      {' '}
      <svg
        ref={svg}
        id="graph"
        tabIndex={0}
        role="group"
        aria-label="Network graph. Scroll or drag to pan, pinch or use Command/Ctrl-scroll to zoom. Tab to a node and press Enter for details."
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => {
          pointers.current.clear();
          drag.current = null;
          targetView.current = viewRef.current;
        }}
        onKeyDown={(e) => {
          if (e.target !== svg.current) return;
          if (e.key === '+' || e.key === '=') zoomAt(1.12);
          if (e.key === '-') zoomAt(1 / 1.12);
          if (e.key === '0') {
            closeCard();
            fit();
          }
          const delta: Record<string, Point> = {
            ArrowLeft: { x: 40, y: 0 },
            ArrowRight: { x: -40, y: 0 },
            ArrowUp: { x: 0, y: 40 },
            ArrowDown: { x: 0, y: -40 },
          };
          if (delta[e.key]) {
            e.preventDefault();
            const d = delta[e.key];
            animateView(
              {
                ...targetView.current,
                x: targetView.current.x + d.x,
                y: targetView.current.y + d.y,
              },
              160,
            );
          }
        }}>
        <defs>
          {FILTERS.map((t) => (
            <marker
              key={t}
              id={'arrow-' + t}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="5"
              markerHeight="5"
              orient="auto">
              <path
                d="M1 1 L7 4 L1 7"
                fill="none"
                stroke={TYPES[t].color}
                strokeWidth="1.5"
              />
            </marker>
          ))}
          {data.nodes.map((n, i) => (
            <clipPath id={'clip-' + i} key={n.id}>
              <circle r="23" />
            </clipPath>
          ))}
        </defs>
        {ready && (
          <g
            transform={`translate(${view.x} ${view.y}) scale(${view.k})`}
            style={{ opacity: ready ? 1 : 0 }}>
            <g>
              {visibleEdges.map((e) => {
                const connected =
                  !selected || e.source === selected || e.target === selected;
                return (
                  <g
                    key={e.id}
                    data-edge-id={e.id}
                    style={
                      {
                        '--arrival': `${Math.max(arrival.get(e.source) ?? 0, arrival.get(e.target) ?? 0) + 220}ms`,
                      } as CSSProperties
                    }
                    role={connected ? 'button' : undefined}
                    tabIndex={connected ? 0 : -1}
                    aria-label={
                      connected
                        ? `Show evidence: ${nodeMap.get(e.source)?.name} — ${relationLabel(e)} — ${nodeMap.get(e.target)?.name}`
                        : undefined
                    }
                    onKeyDown={(event) => {
                      if (
                        connected &&
                        (event.key === 'Enter' || event.key === ' ')
                      ) {
                        event.preventDefault();
                        event.stopPropagation();
                        inspectConnection(e.id);
                      }
                    }}
                    className={
                      'edge-group' + (hoveredEdge === e.id ? ' is-hovered' : '')
                    }
                    onPointerEnter={(ev) => {
                      if (drag.current || !connected) return;
                      setHoveredEdge(e.id);
                      const r = svg.current!.getBoundingClientRect();
                      setTip({
                        text: `${nodeMap.get(e.source)?.name} ${e.directed ? '→' : '↔'} ${nodeMap.get(e.target)?.name} · ${relationLabel(e)}`,
                        x: Math.min(ev.clientX - r.left + 12, size.w - 290),
                        y: Math.max(8, ev.clientY - r.top - 65),
                      });
                    }}
                    onPointerLeave={() => {
                      setHoveredEdge(null);
                      setTip(null);
                    }}>
                    {!introComplete && (
                      <defs>
                        <mask
                          id={`reveal-${e.id}`}
                          maskUnits="userSpaceOnUse"
                          x={
                            Math.min(points[e.source].x, points[e.target].x) -
                            100
                          }
                          y={
                            Math.min(points[e.source].y, points[e.target].y) -
                            100
                          }
                          width={
                            Math.abs(points[e.source].x - points[e.target].x) +
                            200
                          }
                          height={
                            Math.abs(points[e.source].y - points[e.target].y) +
                            200
                          }>
                          <path
                            className="edge-reveal"
                            d={curve(e)}
                            pathLength="1"
                            fill="none"
                            stroke="white"
                            strokeWidth="24"
                          />
                        </mask>
                      </defs>
                    )}
                    <path
                      mask={introComplete ? undefined : `url(#reveal-${e.id})`}
                      className={
                        'edge' +
                        (selected ? (connected ? ' highlight' : ' dimmed') : '')
                      }
                      d={curve(e)}
                      stroke={TYPES[e.type].color}
                      strokeDasharray={
                        e.type === 'worked_with' ? '4 3' : undefined
                      }
                      markerEnd={
                        e.directed ? `url(#arrow-${e.type})` : undefined
                      }
                    />
                    {connected && (
                      <path
                        className="edge-hit"
                        d={curve(e)}
                        vectorEffect="non-scaling-stroke">
                        <title>
                          {nodeMap.get(e.source)?.name} — {relationLabel(e)} —{' '}
                          {nodeMap.get(e.target)?.name}
                        </title>
                      </path>
                    )}
                  </g>
                );
              })}
            </g>
            <g>
              {data.nodes.map((n, i) => (
                <g
                  key={n.id}
                  data-node-id={n.id}
                  data-kind={n.type}
                  role="button"
                  tabIndex={selected && !neighborIds.has(n.id) ? -1 : 0}
                  aria-label={`Explore ${n.name}`}
                  aria-pressed={selected === n.id}
                  transform={`translate(${points[n.id].x} ${points[n.id].y})`}
                  className={
                    'node' +
                    (selected === n.id ? ' selected' : '') +
                    (selected && !neighborIds.has(n.id) ? ' dimmed' : '')
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      choose(n.id);
                    }
                  }}>
                  <g
                    className="node-arrival"
                    style={
                      { '--arrival': `${arrival.get(n.id)}ms` } as CSSProperties
                    }>
                    <circle className="selection-ring" r="31" />
                    <circle className="node-shadow" r="27" cy="2" />
                    <circle className="node-ring" r="26" />
                    <circle
                      r="23"
                      fill={n.type === 'person' ? '#ede8f4' : '#f4f2f7'}
                    />
                    <text className="node-initials">{initials(n.name)}</text>
                    {n.image_url && !failedImages.has(n.id) && (
                      <image
                        href={n.image_url}
                        x="-23"
                        y="-23"
                        width="46"
                        height="46"
                        clipPath={`url(#clip-${i})`}
                        preserveAspectRatio="xMidYMid slice"
                        onError={() =>
                          setFailedImages((s) => new Set(s).add(n.id))
                        }
                      />
                    )}
                    <text className="node-label" y="46">
                      {shortName(n.name)}
                    </text>
                    {selected && n.id !== selected && neighborIds.has(n.id) && (
                      <text className="connection-label" y="62">
                        {[
                          ...new Set(
                            visibleEdges
                              .filter(
                                (e) =>
                                  (e.source === selected &&
                                    e.target === n.id) ||
                                  (e.target === selected && e.source === n.id),
                              )
                              .map((e) =>
                                e.type === 'affiliation'
                                  ? 'Company'
                                  : e.type === 'career_support'
                                    ? 'Career support'
                                    : e.type === 'worked_with'
                                      ? 'Worked together'
                                      : e.type === 'vouch'
                                        ? 'Vouch'
                                        : 'Praise',
                              ),
                          ),
                        ].join(' · ')}
                      </text>
                    )}
                  </g>
                </g>
              ))}
            </g>
          </g>
        )}
      </svg>
      {tip && (
        <div
          className="tooltip"
          style={{ left: Math.max(8, tip.x), top: tip.y }}>
          {tip.text}
        </div>
      )}
    </>
  );
}
