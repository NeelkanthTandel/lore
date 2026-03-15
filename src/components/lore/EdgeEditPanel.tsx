import { useState, useEffect } from 'react';
import { Edge } from '@xyflow/react';
import { RelationshipEdgeData } from '@/types/lore';
import { RELATION_PRESETS } from '@/lib/relationPresets';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface Props {
  edge: Edge<RelationshipEdgeData>;
  onUpdate: (id: string, data: Partial<RelationshipEdgeData>) => void;
  onClose: () => void;
}

const PRESETS_FOR_UI = RELATION_PRESETS.filter(p => p.id !== 'custom');

export default function EdgeEditPanel({ edge, onUpdate, onClose }: Props) {
  const [label, setLabel] = useState(edge.data?.label || '');
  const [direction, setDirection] = useState<'one-way' | 'two-way' | 'undirected'>(edge.data?.direction || 'undirected');
  const [relationType, setRelationType] = useState(edge.data?.relationType || '');
  const [color, setColor] = useState(edge.data?.color || '#888888');
  const [style, setStyle] = useState<'solid' | 'dashed' | 'dotted'>(edge.data?.style || 'solid');

  useEffect(() => {
    setLabel(edge.data?.label || '');
    setDirection(edge.data?.direction || 'undirected');
    setRelationType(edge.data?.relationType || '');
    setColor(edge.data?.color || '#888888');
    setStyle(edge.data?.style || 'solid');
  }, [edge]);

  const applyPreset = (preset: (typeof RELATION_PRESETS)[0]) => {
    setLabel(preset.label);
    setDirection(preset.direction);
    setRelationType(preset.id);
  };

  const handleSave = () => {
    onUpdate(edge.id, { label, direction, relationType: relationType || undefined, color, style });
    onClose();
  };

  return (
    <div className="absolute right-4 top-16 z-50 w-72 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-4 space-y-4 animate-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Edit Connection</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick presets (used for inference) */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Relation type</Label>
        <div className="flex flex-wrap gap-1">
          {PRESETS_FOR_UI.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
                relationType === p.id
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Custom label</Label>
        <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. allies with" className="h-8 text-sm bg-secondary border-border" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Direction</Label>
        <Select value={direction} onValueChange={v => setDirection(v as typeof direction)}>
          <SelectTrigger className="h-8 text-sm bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="undirected">Undirected</SelectItem>
            <SelectItem value="one-way">One-way →</SelectItem>
            <SelectItem value="two-way">Two-way ↔</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Line Style</Label>
        <Select value={style} onValueChange={v => setStyle(v as typeof style)}>
          <SelectTrigger className="h-8 text-sm bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Color</Label>
        <div className="flex gap-2 items-center">
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
          <div className="flex gap-1">
            {['#ef4444', '#c8a44e', '#3b82f6', '#22c55e', '#a855f7', '#888888'].map(c => (
              <button key={c} onClick={() => setColor(c)} className="w-5 h-5 rounded-full border border-border transition-transform hover:scale-110" style={{ backgroundColor: c, outline: color === c ? '2px solid white' : 'none', outlineOffset: '1px' }} />
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleSave} size="sm" className="w-full">Save</Button>
    </div>
  );
}
