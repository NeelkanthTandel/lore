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
  /** Preset relation id (e.g. father_of, spouse) used for inference. */
  relationType?: string;
  /** True if this edge was auto-created by inference; recomputed on load/change. */
  inferred?: boolean;
}

export interface TmdbMediaRef {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  /** Poster path for map thumbnail (e.g. "/abc123.jpg"). */
  poster_path?: string | null;
}

export interface LoreMap {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  /** Optional linked movie/show; when set, TMDB panel opens straight to character list. */
  tmdbMedia?: TmdbMediaRef;
  /** For TV: which season's cast to show (default "1"). Persisted per map. */
  tmdbSeason?: string;
  /** Optional thumbnail URL for the map card (custom or from TMDB poster). */
  thumbnailUrl?: string;
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
  sourceHandle?: string | null;
  targetHandle?: string | null;
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
