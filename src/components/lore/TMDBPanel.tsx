import { useState, useRef } from 'react';
import { getTmdbApiKey } from '@/store/mapStore';
import { TMDBSearchResult, TMDBCastMember } from '@/types/lore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Search, Film, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddCharacters: (characters: { name: string; photo: string }[]) => void;
}

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Simple sessionStorage cache with TTL
function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(`tmdb:${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(`tmdb:${key}`);
      return null;
    }
    return data as T;
  } catch { return null; }
}

function setCache(key: string, data: unknown) {
  try {
    sessionStorage.setItem(`tmdb:${key}`, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded, ignore */ }
}

export default function TMDBPanel({ open, onClose, onAddCharacters }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [step, setStep] = useState<'search' | 'cast'>('search');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastQuery = useRef('');

  const apiKey = getTmdbApiKey();

  const searchTMDB = async (page = 1, append = false) => {
    if (!query.trim() || !apiKey) return;
    const isNew = page === 1;
    isNew ? setLoading(true) : setLoadingMore(true);

    const cacheKey = `search:${query.trim().toLowerCase()}:${page}`;
    const cached = getCached<{ results: TMDBSearchResult[]; total_pages: number }>(cacheKey);

    try {
      let data: { results: TMDBSearchResult[]; total_pages: number };
      if (cached) {
        data = cached;
      } else {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
        );
        data = await res.json();
        setCache(cacheKey, data);
      }

      const filtered = (data.results || []).filter(
        (r: TMDBSearchResult) => r.media_type === 'movie' || r.media_type === 'tv'
      );
      setResults(append ? prev => [...prev, ...filtered] : filtered);
      setTotalPages(data.total_pages || 1);
      setSearchPage(page);
      lastQuery.current = query;
    } catch {
      if (!append) setResults([]);
    }
    isNew ? setLoading(false) : setLoadingMore(false);
  };

  const loadMoreResults = () => {
    if (searchPage < totalPages) {
      searchTMDB(searchPage + 1, true);
    }
  };

  const fetchCast = async (item: TMDBSearchResult) => {
    setLoading(true);
    setSelectedTitle(item.title || item.name || '');
    const isTV = item.media_type === 'tv';
    const type = isTV ? 'tv' : 'movie';
    const creditsEndpoint = isTV ? 'aggregate_credits' : 'credits';
    const cacheKey = `cast:${type}:${item.id}`;
    const cached = getCached<TMDBCastMember[]>(cacheKey);

    try {
      let normalized: TMDBCastMember[];
      if (cached) {
        normalized = cached;
      } else {
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${item.id}/${creditsEndpoint}?api_key=${apiKey}`
        );
        const data = await res.json();
        const rawCast = data.cast || [];
        normalized = rawCast.map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character || c.roles?.[0]?.character || c.name,
          profile_path: c.profile_path,
        }));
        setCache(cacheKey, normalized);
      }
      setCast(normalized);
      setStep('cast');
      setSelected(new Set());
    } catch { setCast([]); }
    setLoading(false);
  };

  const handleAdd = () => {
    const chars = cast.filter(c => selected.has(c.id)).map(c => ({
      name: c.character || c.name,
      photo: c.profile_path ? `${TMDB_IMG}${c.profile_path}` : '',
    }));
    onAddCharacters(chars);
    onClose();
    setStep('search');
    setCast([]);
    setResults([]);
    setQuery('');
  };

  if (!open) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 z-50 w-80 bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Add from Movie/Show</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>

      {!apiKey && (
        <div className="p-4 text-sm text-muted-foreground">
          No TMDB API key configured. Open Settings (gear icon) to add one.
        </div>
      )}

      {apiKey && step === 'search' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3 flex gap-2">
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search movie or show..." className="h-8 text-sm bg-secondary border-border" onKeyDown={e => e.key === 'Enter' && searchTMDB()} />
            <Button size="sm" variant="secondary" onClick={() => searchTMDB()} disabled={loading} className="h-8 px-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {results.map(r => (
              <button
                key={r.id}
                onClick={() => fetchCast(r)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left"
              >
                {r.poster_path ? (
                  <img src={`${TMDB_IMG}${r.poster_path}`} className="w-10 h-14 rounded object-cover" alt="" />
                ) : (
                  <div className="w-10 h-14 rounded bg-secondary flex items-center justify-center"><Film className="w-4 h-4 text-muted-foreground" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.title || r.name}</p>
                  <p className="text-xs text-muted-foreground">{(r.release_date || r.first_air_date || '').slice(0, 4)} · {r.media_type}</p>
                </div>
              </button>
            ))}
            {results.length > 0 && searchPage < totalPages && (
              <Button
                size="sm"
                variant="ghost"
                onClick={loadMoreResults}
                disabled={loadingMore}
                className="w-full mt-2 text-xs text-muted-foreground"
              >
                {loadingMore ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Load more results
              </Button>
            )}
          </div>
        </div>
      )}

      {apiKey && step === 'cast' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3 border-b border-border">
            <button onClick={() => setStep('search')} className="text-xs text-primary hover:underline">← Back to search</button>
            <p className="text-sm font-medium mt-1">{selectedTitle}</p>
            <p className="text-xs text-muted-foreground">{cast.length} cast members</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {cast.map(c => (
              <label key={c.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                <Checkbox
                  checked={selected.has(c.id)}
                  onCheckedChange={checked => {
                    const next = new Set(selected);
                    checked ? next.add(c.id) : next.delete(c.id);
                    setSelected(next);
                  }}
                />
                {c.profile_path ? (
                  <img src={`${TMDB_IMG}${c.profile_path}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">{c.name[0]}</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{c.character}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.name}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="p-3 border-t border-border">
            <Button size="sm" onClick={handleAdd} disabled={selected.size === 0} className="w-full">
              Add {selected.size} Character{selected.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
