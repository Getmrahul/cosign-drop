import type { Kind } from '@/types/network';
export const TYPES: Record<
  Kind,
  { label: string; color: string; directed: boolean }
> = {
  vouch: { label: 'Vouched for', color: '#9270c5', directed: true },
  praise: { label: 'Praised work', color: '#53a598', directed: true },
  worked_with: { label: 'Worked with', color: '#6b99c5', directed: false },
  affiliation: { label: 'Company', color: '#b0acb9', directed: false },
  career_support: { label: 'Career support', color: '#c4a06b', directed: true },
  acknowledgment: { label: 'Acknowledged', color: '#a8a29e', directed: true },
};
export const FILTERS: Kind[] = [
  'vouch',
  'praise',
  'worked_with',
  'affiliation',
  'career_support',
];
export const INITIAL: Kind[] = [
  'vouch',
  'praise',
  'worked_with',
  'affiliation',
  'career_support',
];

export function relationLabel(e: { type: Kind }) {
  return e.type === 'career_support'
    ? 'Credits with career support'
    : TYPES[e.type].label;
}

export function getNodeRelationships(
  edges: import('../types/network').Edge[],
  selected: string,
) {
  const affiliations = selected
    ? edges.filter(
        (e) =>
          e.type === 'affiliation' &&
          (e.source === selected || e.target === selected),
      )
    : [];
  const received = selected
    ? edges.filter(
        (e) => e.target === selected && ['vouch', 'praise'].includes(e.type),
      )
    : [];
  const given = selected
    ? edges.filter(
        (e) => e.source === selected && ['vouch', 'praise'].includes(e.type),
      )
    : [];
  const support = selected
    ? edges.filter((e) => e.source === selected && e.type === 'career_support')
    : [];
  const creditedBy = selected
    ? edges.filter((e) => e.target === selected && e.type === 'career_support')
    : [];
  const worked = selected
    ? edges.filter(
        (e) =>
          e.type === 'worked_with' &&
          (e.source === selected || e.target === selected),
      )
    : [];

  return { affiliations, received, given, support, creditedBy, worked };
}

export function groupReceipts(list: import('../types/network').Edge[]) {
  const groups = new Map<string, import('../types/network').Edge[]>();
  for (const edge of list) {
    const key = [edge.source, edge.type, edge.source_ids[0]].join('|');
    groups.set(key, [...(groups.get(key) ?? []), edge]);
  }
  return [...groups.values()];
}
