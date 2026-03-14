import { useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { Search } from 'lucide-react';
import { CharacterNodeData } from '@/types/lore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { getNodes, setCenter } = useReactFlow();

  const nodes = getNodes() as Node<CharacterNodeData>[];
  const filtered = query.trim()
    ? nodes.filter(n => n.data.name?.toLowerCase().includes(query.toLowerCase()))
    : [];

  const focusNode = (node: Node<CharacterNodeData>) => {
    setCenter(node.position.x + 40, node.position.y + 40, { zoom: 1.5, duration: 600 });
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search characters..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-44"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {filtered.slice(0, 8).map(n => (
            <button
              key={n.id}
              onClick={() => focusNode(n)}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors truncate"
            >
              {n.data.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
