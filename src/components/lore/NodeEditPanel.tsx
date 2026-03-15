import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { CharacterNodeData } from '@/types/lore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface Props {
  node: Node<CharacterNodeData>;
  onUpdate: (id: string, data: Partial<CharacterNodeData>) => void;
  onClose: () => void;
}

export default function NodeEditPanel({ node, onUpdate, onClose }: Props) {
  const [name, setName] = useState(node.data.name);
  const [photo, setPhoto] = useState(node.data.photo);
  const [faction, setFaction] = useState(node.data.faction || '');
  const [factionColor, setFactionColor] = useState(node.data.factionColor || '#6366f1');
  const [ringColor, setRingColor] = useState(node.data.ringColor || '#c8a44e');

  useEffect(() => {
    setName(node.data.name);
    setPhoto(node.data.photo);
    setFaction(node.data.faction || '');
    setFactionColor(node.data.factionColor || '#6366f1');
    setRingColor(node.data.ringColor || '#c8a44e');
  }, [node]);

  const handleSave = () => {
    onUpdate(node.id, { name, photo, faction: faction || undefined, factionColor, ringColor });
    onClose();
  };

  return (
    <div className="absolute right-4 top-16 z-50 w-72 max-h-[calc(100vh-6rem)] flex flex-col bg-card border border-border rounded-xl shadow-2xl animate-in slide-in-from-right-4 duration-200 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0 p-4 pb-2">
        <h3 className="text-sm font-semibold text-foreground">Edit Character</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-16rem)] px-4 pb-4 space-y-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} className="h-8 text-sm bg-secondary border-border" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Photo URL</Label>
          <Input value={photo} onChange={e => setPhoto(e.target.value)} className="h-8 text-sm bg-secondary border-border" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Faction / Group</Label>
          <Input value={faction} onChange={e => setFaction(e.target.value)} placeholder="e.g. Stark, Sith" className="h-8 text-sm bg-secondary border-border" />
        </div>

        <div className="flex gap-3">
          <div className="space-y-1 flex-1">
            <Label className="text-xs text-muted-foreground">Ring Color</Label>
            <input type="color" value={ringColor} onChange={e => setRingColor(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-xs text-muted-foreground">Faction Color</Label>
            <input type="color" value={factionColor} onChange={e => setFactionColor(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 pt-3 border-t border-border bg-card">
        <Button onClick={handleSave} size="sm" className="w-full">Save</Button>
      </div>
    </div>
  );
}
