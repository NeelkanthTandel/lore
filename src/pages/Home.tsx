import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMaps, createMap, deleteMap } from '@/store/mapStore';
import { LoreMap } from '@/types/lore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Map, Users } from 'lucide-react';

export default function Home() {
  const [maps, setMaps] = useState<LoreMap[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMaps(getAllMaps());
  }, []);

  const handleCreate = () => {
    const title = newTitle.trim() || 'Untitled Map';
    const map = createMap(title);
    navigate(`/map/${map.id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMap(id);
    setMaps(getAllMaps());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
          Lore
        </h1>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Map
        </Button>
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
        {maps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <Map className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No maps yet</h2>
            <p className="text-muted-foreground mb-6">Create your first character relationship map</p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Map
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {maps.map(m => (
              <button
                key={m.id}
                onClick={() => navigate(`/map/${m.id}`)}
                className="group bg-card border border-border rounded-lg p-4 text-left hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-full h-28 rounded bg-canvas mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground/30" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
