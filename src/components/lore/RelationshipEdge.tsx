import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import { RelationshipEdgeData } from '@/types/lore';

type RelationshipEdgeType = Edge<RelationshipEdgeData, 'relationship'>;

const RelationshipEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<RelationshipEdgeType>) => {
  const color = data?.color || '#888';
  const edgeStyle = data?.style || 'solid';
  const direction = data?.direction || 'undirected';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const strokeDasharray = edgeStyle === 'dashed' ? '8 4' : edgeStyle === 'dotted' ? '2 4' : undefined;

  const markerEnd = direction === 'one-way' || direction === 'two-way'
    ? `url(#arrow-${id})` : undefined;
  const markerStart = direction === 'two-way'
    ? `url(#arrow-start-${id})` : undefined;

  return (
    <>
      <defs>
        {(direction === 'one-way' || direction === 'two-way') && (
          <marker
            id={`arrow-${id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        )}
        {direction === 'two-way' && (
          <marker
            id={`arrow-start-${id}`}
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 10 0 L 0 5 L 10 10 z" fill={color} />
          </marker>
        )}
        {/* Glow filter for selected edges */}
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Invisible wider path for easier click targeting */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />
      {/* Glow layer when selected */}
      {selected && (
        <BaseEdge
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: 6,
            strokeDasharray,
            opacity: 0.25,
            filter: `url(#glow-${id})`,
          }}
        />
      )}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray,
          strokeLinecap: 'round',
        }}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`text-[10px] px-2.5 py-0.5 rounded-full backdrop-blur-md border whitespace-nowrap font-medium tracking-wide ${
              selected
                ? 'bg-primary/15 border-primary/40 text-primary shadow-lg'
                : 'bg-card/80 border-border/60 text-foreground/80'
            }`}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

RelationshipEdge.displayName = 'RelationshipEdge';

export default RelationshipEdge;
