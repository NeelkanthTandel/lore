import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { LoreMap } from '@/types/lore';

const STORAGE_KEY = 'lore-maps';
const API_KEY_KEY = 'lore-tmdb-api-key';
const SUPABASE_URL_KEY = 'lore-supabase-url';
const SUPABASE_ANON_KEY = 'lore-supabase-anon-key';

const LORE_MAPS_TABLE = 'lore_maps';

// --- Supabase config ---

export function getSupabaseUrl(): string {
  return localStorage.getItem(SUPABASE_URL_KEY) || '';
}

export function getSupabaseAnonKey(): string {
  return localStorage.getItem(SUPABASE_ANON_KEY) || '';
}

export function setSupabaseConfig(url: string, anonKey: string): void {
  if (url.trim()) localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  else localStorage.removeItem(SUPABASE_URL_KEY);
  if (anonKey.trim()) localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
  else localStorage.removeItem(SUPABASE_ANON_KEY);
}

/** Extract project ref from Supabase URL (e.g. "abcdefgh" from "https://abcdefgh.supabase.co"). */
export function getSupabaseProjectRef(url?: string): string | null {
  const u = url ?? getSupabaseUrl();
  if (!u.trim()) return null;
  try {
    const host = new URL(u).hostname;
    if (host.endsWith('.supabase.co')) return host.slice(0, -'.supabase.co'.length) || null;
    return null;
  } catch {
    return null;
  }
}

/** Build share URL for the current Supabase project (call with origin e.g. window.location.origin). */
export function getShareUrl(origin: string): string | null {
  const ref = getSupabaseProjectRef();
  return ref ? `${origin}/access/${ref}` : null;
}

function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key);
}

// --- Local storage (fallback) ---

function getAllMapsLocal(): LoreMap[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function getMapLocal(id: string): LoreMap | undefined {
  return getAllMapsLocal().find(m => m.id === id);
}

function saveMapLocal(map: LoreMap): void {
  const maps = getAllMapsLocal();
  const idx = maps.findIndex(m => m.id === map.id);
  if (idx >= 0) maps[idx] = map;
  else maps.push(map);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
}

function deleteMapLocal(id: string): void {
  const maps = getAllMapsLocal().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
}

// --- Supabase row type ---

interface LoreMapRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  nodes: LoreMap['nodes'];
  edges: LoreMap['edges'];
  tmdb_media: LoreMap['tmdbMedia'] | null;
  tmdb_season: string | null;
  thumbnail_url: string | null;
}

function rowToMap(r: LoreMapRow): LoreMap {
  return {
    id: r.id,
    title: r.title,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    nodes: r.nodes ?? [],
    edges: r.edges ?? [],
    ...(r.tmdb_media && { tmdbMedia: r.tmdb_media }),
    ...(r.tmdb_season != null && r.tmdb_season !== '' && { tmdbSeason: r.tmdb_season }),
    ...(r.thumbnail_url && r.thumbnail_url.trim() !== '' && { thumbnailUrl: r.thumbnail_url.trim() }),
  };
}

/** Build row for Supabase. Omit thumbnail_url when empty so older tables without the column still work. */
function mapToRow(m: LoreMap): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: m.id,
    title: m.title,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    nodes: m.nodes,
    edges: m.edges,
    tmdb_media: m.tmdbMedia ?? null,
    tmdb_season: m.tmdbSeason ?? null,
  };
  const thumb = m.thumbnailUrl?.trim();
  if (thumb) row.thumbnail_url = thumb;
  return row;
}

// --- Async API (Supabase when configured, else local) ---

export async function getAllMaps(): Promise<LoreMap[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from(LORE_MAPS_TABLE).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToMap);
  }
  return getAllMapsLocal();
}

export async function getMap(id: string): Promise<LoreMap | undefined> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from(LORE_MAPS_TABLE).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return undefined; // not found
      throw error;
    }
    return data ? rowToMap(data as LoreMapRow) : undefined;
  }
  return getMapLocal(id);
}

export async function saveMap(map: LoreMap): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const row = mapToRow(map) as Record<string, unknown>;
    const { error } = await supabase.from(LORE_MAPS_TABLE).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return;
  }
  saveMapLocal(map);
}

export async function deleteMap(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from(LORE_MAPS_TABLE).delete().eq('id', id);
    if (error) throw error;
    return;
  }
  deleteMapLocal(id);
}

export async function createMap(title: string): Promise<LoreMap> {
  const map: LoreMap = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
  };
  await saveMap(map);
  return map;
}

/** Test Supabase connection and that table exists. Returns error message or null if OK. */
export async function testSupabaseConnection(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return 'Supabase URL and anon key are required.';
  const { error } = await supabase.from(LORE_MAPS_TABLE).select('id').limit(1);
  if (error) {
    const msg = (error.message || '').toLowerCase();
    const isTableMissing =
      error.code === '42P01' ||
      msg.includes('does not exist') ||
      msg.includes('schema cache') ||
      msg.includes('could not find the table');
    if (isTableMissing) return 'TABLE_MISSING';
    return error.message || 'Connection failed.';
  }
  return null;
}

/** Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query) to create the table. */
export const SUPABASE_SETUP_SQL = `-- Lore: create maps table (run once per project)
create table if not exists lore_maps (
  id uuid primary key,
  title text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  nodes jsonb default '[]',
  edges jsonb default '[]',
  tmdb_media jsonb,
  tmdb_season text,
  thumbnail_url text
);

-- If table already exists, add thumbnail_url (run if you had lore_maps before)
-- alter table lore_maps add column if not exists thumbnail_url text;

-- Row-level security: allow anon full access (you control who has the anon key)
alter table lore_maps enable row level security;

-- Remove any existing policies so we start clean
drop policy if exists "Allow all for anon" on lore_maps;
drop policy if exists "lore_maps_select" on lore_maps;
drop policy if exists "lore_maps_insert" on lore_maps;
drop policy if exists "lore_maps_update" on lore_maps;
drop policy if exists "lore_maps_delete" on lore_maps;

-- Explicit policies per command (avoids RLS 42501 on insert)
create policy "lore_maps_select" on lore_maps for select using (true);
create policy "lore_maps_insert" on lore_maps for insert with check (true);
create policy "lore_maps_update" on lore_maps for update using (true) with check (true);
create policy "lore_maps_delete" on lore_maps for delete using (true);
`;

// --- TMDB ---

export function getTmdbApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) || '';
}

export function setTmdbApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}
