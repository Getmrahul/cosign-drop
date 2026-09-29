import type { GraphData, Point } from '../types/network';
// A deterministic, settled layout. Nodes stay where the visitor drags them.
export function createLayout(data: GraphData): Record<string, Point> {
  const nodes = data.nodes.map((n, i) => ({
    ...n,
    x: Math.cos(i * 2.39996) * Math.sqrt(i + 1) * 55,
    y: Math.sin(i * 2.39996) * Math.sqrt(i + 1) * 40,
    vx: 0,
    vy: 0,
  }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const links = data.edges.filter(
    (e) =>
      e.verification_status === 'source_reviewed' &&
      e.type !== 'worked_with' &&
      e.type !== 'acknowledgment',
  );
  let seed = 41;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const anchors: Record<string, Point> = {
    'org:producthunt': { x: -210, y: 0 },
    'org:a16z': { x: 270, y: 0 },
    'org:herostuff': { x: -440, y: 110 },
    'org:sword': { x: 430, y: 230 },
    'org:hostedai': { x: 410, y: -250 },
    'person:ed_moraaaa': { x: -430, y: -245 },
    'person:adilmania': { x: -320, y: -245 },
  };
  const group = (id: string): Point =>
    anchors[id] ??
    (links.some((e) => e.source === id && e.target === 'org:producthunt')
      ? { x: -220, y: 0 }
      : links.some((e) => e.source === id && e.target === 'org:a16z')
        ? { x: 240, y: 0 }
        : { x: 0, y: 0 });
  for (const n of nodes) {
    const g = group(n.id);
    n.x += g.x * 0.6;
    n.y += g.y * 0.6;
  }
  for (let step = 0; step < 500; step++) {
    const cooling = 1 - step / 600;
    for (const n of nodes) {
      const g = group(n.id);
      const strength = anchors[n.id] ? 0.018 : 0.0025;
      n.vx += (g.x - n.x) * strength;
      n.vy += (g.y - n.y) * strength;
    }
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i],
          b = nodes[j];
        let dx = b.x - a.x,
          dy = b.y - a.y;
        if (Math.abs(dx) + Math.abs(dy) < 0.01) {
          dx = rand() - 0.5;
          dy = rand() - 0.5;
        }
        const d2 = Math.max(100, dx * dx + dy * dy),
          dist = Math.sqrt(d2),
          f = 1100 / d2;
        a.vx -= (dx / dist) * f;
        b.vx += (dx / dist) * f;
        a.vy -= (dy / dist) * f;
        b.vy += (dy / dist) * f;
        const ellipse = Math.sqrt((dx / 154) ** 2 + (dy / 118) ** 2);
        if (ellipse < 1) {
          const push = (1 - ellipse) * 0.8;
          a.vx -= dx * push;
          b.vx += dx * push;
          a.vy -= dy * push;
          b.vy += dy * push;
        }
      }
    for (const e of links) {
      const a = byId.get(e.source)!,
        b = byId.get(e.target)!;
      const dx = b.x - a.x,
        dy = b.y - a.y,
        d = Math.max(1, Math.hypot(dx, dy));
      const f = (d - (e.type === 'affiliation' ? 175 : 205)) * 0.012;
      a.vx += (dx / d) * f;
      b.vx -= (dx / d) * f;
      a.vy += (dy / d) * f;
      b.vy -= (dy / d) * f;
    }
    for (const n of nodes) {
      n.vx *= 0.66;
      n.vy *= 0.66;
      n.x += Math.max(-10, Math.min(10, n.vx)) * cooling;
      n.y += Math.max(-10, Math.min(10, n.vy)) * cooling;
    }
  }
  return Object.fromEntries(
    nodes.map((n) => [
      n.id,
      { x: Math.round(n.x * 1350) / 1000, y: Math.round(n.y * 1000) / 1000 },
    ]),
  );
}
