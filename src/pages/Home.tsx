import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMaps, createMap, deleteMap, getSupabaseUrl, getShareUrl } from '@/store/mapStore';
import { LoreMap } from '@/types/lore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SettingsDialog from '@/components/lore/SettingsDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, Map, Users, Settings, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const [maps, setMaps] = useState<LoreMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const hasSupabase = !!getSupabaseUrl();
  const shareUrl = getShareUrl(typeof window !== 'undefined' ? window.location.origin : '');

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy');
    }
  };

  const refetchMaps = useCallback(() => {
    setLoading(true);
    getAllMaps()
      .then(setMaps)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAllMaps()
      .then(list => { if (!cancelled) setMaps(list); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async () => {
    const title = newTitle.trim() || 'Untitled Map';
    const map = await createMap(title);
    navigate(`/map/${map.id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteMap(id);
    const list = await getAllMaps();
    setMaps(list);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-5 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          <img src="/lore_logo.png" alt="" className="h-9 w-auto" />
          Lore
        </h1>
        <div className="flex items-center gap-2">
          {hasSupabase && (
            <Button variant="ghost" size="icon" onClick={() => setShareOpen(true)} title="Share this Lore account">
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} title="Settings (TMDB, Supabase)">
            <Settings className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Map
          </Button>
        </div>
      </header>

      {/* Create modal inline */}
      {showCreate && (
        <div className="border-b border-border px-6 py-4 bg-card animate-in slide-in-from-top duration-200">
          <div className="flex gap-3 max-w-md">
            <Input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Map title (e.g. Game of Thrones)"
              className="bg-secondary border-border"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Maps Grid */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">Loading maps…</div>
        ) : maps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <Map className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No maps yet</h2>
            <p className="text-muted-foreground mb-6">Create your first map or open Settings to add Supabase and load maps from the cloud.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={() => setSettingsOpen(true)} variant="outline" className="gap-2">
                <Settings className="w-4 h-4" /> Settings
              </Button>
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Create Map
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {maps.map(m => {
              const thumbUrl = m.thumbnailUrl || (m.tmdbMedia?.poster_path ? `https://image.tmdb.org/t/p/w342${m.tmdbMedia.poster_path}` : null);
              return (
              <button
                key={m.id}
                onClick={() => navigate(`/map/${m.id}`)}
                className="group bg-card border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-full h-28 rounded bg-canvas mb-3 flex items-center justify-center overflow-hidden">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground truncate">{m.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {m.nodes.length} characters · {new Date(m.updatedAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={e => handleDelete(m.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
            );})}
          </div>
        )}
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onAfterSave={refetchMaps}
      />

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-y-auto">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2 pr-12">
            <DialogTitle>Share Lore account</DialogTitle>
            <DialogDescription>
              Share this link with others. Send the Supabase anon key separately (e.g. as a password) so they can access your maps.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-shrink-0 px-6 pb-8 pt-1">
            {shareUrl && (
              <div className="flex gap-2">
                <Input readOnly value={shareUrl} className="font-mono text-sm bg-muted" />
                <Button variant="outline" size="icon" onClick={copyShareUrl} title="Copy link">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
