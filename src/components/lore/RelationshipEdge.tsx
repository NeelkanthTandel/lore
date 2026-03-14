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
      </defs>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray,
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
            className="text-[10px] px-2 py-0.5 rounded bg-card/90 backdrop-blur-sm border border-border text-foreground whitespace-nowrap"
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
