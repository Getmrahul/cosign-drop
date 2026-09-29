export type Kind =
  | 'vouch'
  | 'praise'
  | 'worked_with'
  | 'affiliation'
  | 'career_support'
  | 'acknowledgment';
export type Node = {
  id: string;
  type: 'person' | 'organization';
  name: string;
  handle: string | null;
  image_url: string | null;
  bio?: string | null;
  bio_verification_status?: string;
  profile_url?: string | null;
  website?: string | null;
  notes?: string;
};
export type Edge = {
  id: string;
  source: string;
  target: string;
  type: Kind;
  category?: string;
  directed: boolean;
  source_ids: string[];
  role?: string | null;
  temporal_status?: string;
  verification_status: string;
  context?: string;
};
export type Source = {
  id: string;
  url: string;
  date?: string;
  excerpt?: string;
};
export type GraphData = { nodes: Node[]; edges: Edge[]; sources: Source[] };
export type Point = { x: number; y: number };
export type View = { x: number; y: number; k: number };

export type Camera = View;

export type ViewportArea = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type EvidenceFocus = { edgeId: string; requestId: number };
