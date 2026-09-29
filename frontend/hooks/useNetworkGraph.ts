import useCamera from './useCamera';
import useTrackpadGestures from './useTrackpadGestures';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type {
  GraphData,
  Point,
  View,
  Kind,
  EvidenceFocus,
} from '@/types/network';
import { createLayout } from '@/utils/layout';
import { INITIAL } from '@/utils/relationships';
import { zoomCamera, fitConnections } from '@/utils/viewport';
export default function useNetworkGraph(data: GraphData) {
  const nodeMap = useMemo(
    () => new Map(data.nodes.map((n) => [n.id, n])),
    [data],
  );
  const sources = useMemo(
    () => new Map(data.sources.map((s) => [s.id, s])),
    [data],
  );
  const edges = useMemo(
    () => data.edges.filter((e) => e.verification_status === 'source_reviewed'),
    [data],
  );
  const [points, setPoints] = useState<Record<string, Point>>(() =>
    createLayout(data),
  );
  const { view, viewRef, targetView, applyView, stopMotion, animateView } =
    useCamera();
  const [size, setSize] = useState({ w: 1200, h: 650 });
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filters, setFilters] = useState<Kind[]>(INITIAL);
  const [query, setQuery] = useState('');
  const [evidenceFocus, setEvidenceFocus] = useState<EvidenceFocus | null>(
    null,
  );
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(
    null,
  );
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const svg = useRef<SVGSVGElement>(null),
    search = useRef<HTMLInputElement>(null);
  const returnView = useRef<{
    view: View;
    width: number;
    height: number;
  } | null>(null);
  const selectedRef = useRef<string | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const pointers = useRef(new Map<number, Point>());
  const drag = useRef<{
    id: string | null;
    edgeId?: string | null;
    start: Point;
    origin: Point;
    moved: boolean;
    pinch?: { distance: number; view: View; center: Point };
  } | null>(null);
  const visibleEdges = edges.filter((e) => filters.includes(e.type));
  const neighborIds = new Set(
    selected
      ? [
          selected,
          ...visibleEdges
            .filter((e) => e.source === selected || e.target === selected)
            .flatMap((e) => [e.source, e.target]),
        ]
      : [],
  );
  const found = query.trim()
    ? data.nodes
        .filter((n) =>
          (n.name + ' ' + n.handle)
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
        )
        .slice(0, 8)
    : [];
  const selectedNode = selected ? nodeMap.get(selected) : null;

  const fit = useCallback(() => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const ps = Object.values(pointsRef.current),
      minX = Math.min(...ps.map((p) => p.x)) - 65,
      maxX = Math.max(...ps.map((p) => p.x)) + 65,
      minY = Math.min(...ps.map((p) => p.y)) - 45,
      maxY = Math.max(...ps.map((p) => p.y)) + 55;
    const padX = box.width < 600 ? 25 : 75,
      padTop = 85,
      padBottom = 100;
    const k = Math.min(
      (box.width - padX * 2) / (maxX - minX),
      (box.height - padTop - padBottom) / (maxY - minY),
      1.25,
    );
    animateView({
      k: Math.max(0.15, k),
      x: box.width / 2 - ((minX + maxX) / 2) * k,
      y:
        padTop +
        (box.height - padTop - padBottom) / 2 -
        ((minY + maxY) / 2) * k,
    });
  }, [animateView]);
  const frameSelection = useCallback(
    (id: string) => {
      const canvas = svg.current;
      if (!canvas) return;
      const bounds = canvas.getBoundingClientRect();
      const container = canvas.parentElement!;
      // Match the viewport breakpoint used by the card's CSS, not canvas width.
      const mobile = window.matchMedia('(max-width: 600px)').matches;
      const card = container.querySelector<HTMLElement>('.detail-card');
      const controls = container.querySelector<HTMLElement>('.bottom-bar');
      const toolbar = container.querySelector<HTMLElement>('.toolbar');
      const back = container.querySelector<HTMLElement>('.back-network');
      const top =
        Math.max(
          toolbar ? toolbar.offsetTop + toolbar.offsetHeight : 0,
          back ? back.offsetTop + back.offsetHeight : 0,
        ) + 16;
      const area = {
        left: 16,
        right: mobile
          ? bounds.width - 16
          : (card?.offsetLeft ?? bounds.width - 356) - 16,
        top,
        bottom:
          Math.min(
            controls?.offsetTop ?? bounds.height - 100,
            mobile ? (card?.offsetTop ?? bounds.height * 0.5) : bounds.height,
          ) - 16,
      };
      const ids = new Set([
        id,
        ...edges
          .filter(
            (e) =>
              filtersRef.current.includes(e.type) &&
              (e.source === id || e.target === id),
          )
          .flatMap((e) => [e.source, e.target]),
      ]);
      animateView(
        fitConnections(
          [...ids].map((key) => pointsRef.current[key]),
          area,
        ),
        420,
      );
    },
    [edges, animateView],
  );
  const choose = useCallback(
    (id: string) => {
      if (!nodeMap.has(id)) return;
      if (!selectedRef.current) {
        const bounds = svg.current?.getBoundingClientRect();
        if (bounds)
          returnView.current = {
            view: viewRef.current,
            width: bounds.width,
            height: bounds.height,
          };
      }
      if (selectedRef.current === id) frameSelection(id);
      selectedRef.current = id;
      setSelected(id);
      setEvidenceFocus(null);
      setQuery('');
      setTip(null);
      setHoveredEdge(null);
    },
    [nodeMap, viewRef, frameSelection],
  );
  // Measure after the card and controls have their selected-state layout.
  useLayoutEffect(() => {
    if (selected) frameSelection(selected);
  }, [selected, filters, frameSelection]);
  const inspectConnection = useCallback(
    (edgeId: string) => {
      const edge = edges.find((edge) => edge.id === edgeId);
      if (!edge) return;
      const current = selectedRef.current;
      if (!current || (edge.source !== current && edge.target !== current))
        choose(edge.source);
      setTip(null);
      setEvidenceFocus((previous) => ({
        edgeId,
        requestId: (previous?.requestId ?? 0) + 1,
      }));
    },
    [edges, choose],
  );
  const closeCard = useCallback(() => {
    selectedRef.current = null;
    setSelected(null);
    setEvidenceFocus(null);
    setTip(null);
    setHoveredEdge(null);
    if (returnView.current) {
      const saved = returnView.current;
      const bounds = svg.current?.getBoundingClientRect();
      if (
        bounds &&
        (Math.abs(bounds.width - saved.width) > 1 ||
          Math.abs(bounds.height - saved.height) > 1)
      )
        fit();
      else animateView(saved.view);
      returnView.current = null;
    }
  }, [animateView, fit]);
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
      if (selectedRef.current) frameSelection(selectedRef.current);
      else fit();
      setReady(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit, frameSelection]);
  const zoomAt = useCallback(
    (factor: number, center?: Point) => {
      const box = svg.current?.getBoundingClientRect();
      if (!box) return;
      const p = center ?? {
        x:
          selectedRef.current &&
          !window.matchMedia('(max-width: 600px)').matches
            ? (box.width - 380) / 2
            : box.width / 2,
        y: box.height / 2,
      };
      animateView(zoomCamera(targetView.current, factor, p), 220);
    },
    [animateView, targetView],
  );
  const clearHover = useCallback(() => {
    setTip(null);
    setHoveredEdge(null);
  }, []);
  useTrackpadGestures({
    svg,
    pointers,
    viewRef,
    targetView,
    applyView,
    stopMotion,
    clearHover,
  });
  function local(e: { clientX: number; clientY: number }): Point {
    const r = svg.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function down(e: ReactPointerEvent<SVGSVGElement>) {
    stopMotion();
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    svg.current?.setPointerCapture(e.pointerId);
    setTip(null);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      drag.current = {
        id: null,
        start: p,
        origin: p,
        moved: true,
        pinch: {
          distance: Math.hypot(a.x - b.x, a.y - b.y),
          view: viewRef.current,
          center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        },
      };
      return;
    }
    const target =
      (e.target as Element)
        .closest('[data-node-id]')
        ?.getAttribute('data-node-id') ?? null;
    drag.current = {
      id: target,
      edgeId: (e.target as Element)
        .closest('[data-edge-id]')
        ?.getAttribute('data-edge-id'),
      start: p,
      origin: target
        ? pointsRef.current[target]
        : { x: viewRef.current.x, y: viewRef.current.y },
      moved: false,
    };
  }
  function move(e: ReactPointerEvent<SVGSVGElement>) {
    if (!pointers.current.has(e.pointerId) || !drag.current) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    const d = drag.current;
    if (d.pinch && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()],
        center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        v = d.pinch.view,
        k = Math.max(
          0.2,
          Math.min(
            3,
            (v.k * Math.hypot(a.x - b.x, a.y - b.y)) /
              Math.max(1, d.pinch.distance),
          ),
        );
      applyView({
        k,
        x: center.x - ((d.pinch.center.x - v.x) * k) / v.k,
        y: center.y - ((d.pinch.center.y - v.y) * k) / v.k,
      });
      return;
    }
    const dx = p.x - d.start.x,
      dy = p.y - d.start.y;
    if (Math.hypot(dx, dy) > 4) d.moved = true;
    if (d.id)
      setPoints((ps) => ({
        ...ps,
        [d.id!]: {
          x: d.origin.x + dx / viewRef.current.k,
          y: d.origin.y + dy / viewRef.current.k,
        },
      }));
    else {
      const next = {
        ...viewRef.current,
        x: d.origin.x + dx,
        y: d.origin.y + dy,
      };
      targetView.current = next;
      applyView(next);
    }
  }
  function up(e: ReactPointerEvent<SVGSVGElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    const d = drag.current;
    pointers.current.delete(e.pointerId);
    if (svg.current?.hasPointerCapture(e.pointerId))
      svg.current.releasePointerCapture(e.pointerId);
    if (d && !d.moved && d.id) choose(d.id);
    else if (d && !d.moved && d.edgeId) inspectConnection(d.edgeId);
    else if (d && !d.moved && !d.id) closeCard();
    if (!pointers.current.size) drag.current = null;
    else {
      const p = [...pointers.current.values()][0];
      drag.current = {
        id: null,
        start: p,
        origin: { x: viewRef.current.x, y: viewRef.current.y },
        moved: true,
      };
      targetView.current = viewRef.current;
    }
  }

  return {
    evidenceFocus,
    inspectConnection,
    nodeMap,
    sources,
    edges,
    points,
    view,
    size,
    ready,
    selected,
    filters,
    setFilters,
    query,
    setQuery,
    hoveredEdge,
    setHoveredEdge,
    tip,
    setTip,
    failedImages,
    setFailedImages,
    svg,
    search,
    targetView,
    viewRef,
    pointers,
    drag,
    visibleEdges,
    neighborIds,
    found,
    selectedNode,
    fit,
    choose,
    closeCard,
    zoomAt,
    animateView,
    down,
    move,
    up,
  };
}
