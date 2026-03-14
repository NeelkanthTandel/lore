export interface CharacterNodeData {
  [key: string]: unknown;
  name: string;
  photo: string;
  faction?: string;
  factionColor?: string;
  ringColor?: string;
}

export interface RelationshipEdgeData {
  [key: string]: unknown;
  label: string;
  direction: 'one-way' | 'two-way' | 'undirected';
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface LoreMap {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}

export interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: CharacterNodeData;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: RelationshipEdgeData;
}

export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
