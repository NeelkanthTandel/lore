import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { CharacterNodeData } from '@/types/lore';

type CharacterNodeType = Node<CharacterNodeData, 'character'>;

const CharacterNode = memo(({ data, selected }: NodeProps<CharacterNodeType>) => {
  const ringColor = data.ringColor || '#c8a44e';

  const handleClass = '!bg-muted-foreground !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity';

  return (
    <div className="flex flex-col items-center gap-1.5 group relative">
      {/* Top: target (incoming), Bottom: source (outgoing), Left: target, Right: source — so couples can connect side by side */}
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />

      <div
        className="relative w-20 h-20 rounded-full overflow-hidden transition-all duration-200"
        style={{
          boxShadow: selected
            ? `0 0 0 3px ${ringColor}, 0 8px 24px rgba(0,0,0,0.6)`
            : `0 0 0 2px ${ringColor}, 0 4px 12px rgba(0,0,0,0.4)`,
        }}
      >
        {data.photo ? (
          <img
            src={data.photo}
            alt={data.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground">
            {data.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-foreground max-w-24 text-center leading-tight truncate">
        {data.name}
      </span>

      {data.faction && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: (data.factionColor || '#555') + '33',
            color: data.factionColor || '#aaa',
            border: `1px solid ${(data.factionColor || '#555') + '55'}`,
          }}
        >
          {data.faction}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  );
});

CharacterNode.displayName = 'CharacterNode';

export default CharacterNode;
