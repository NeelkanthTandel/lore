import { LoreMap } from '@/types/lore';

const STORAGE_KEY = 'lore-maps';
const API_KEY_KEY = 'lore-tmdb-api-key';

export function getAllMaps(): LoreMap[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getMap(id: string): LoreMap | undefined {
  return getAllMaps().find(m => m.id === id);
}

export function saveMap(map: LoreMap): void {
  const maps = getAllMaps();
  const idx = maps.findIndex(m => m.id === map.id);
  if (idx >= 0) maps[idx] = map;
  else maps.push(map);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
}

export function deleteMap(id: string): void {
  const maps = getAllMaps().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
}

export function createMap(title: string): LoreMap {
  const map: LoreMap = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
  };
  saveMap(map);
  return map;
}

export function getTmdbApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) || '';
}

export function setTmdbApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}
