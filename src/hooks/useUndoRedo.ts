import { useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

export function useUndoRedo() {
  const past = useRef<HistoryEntry[]>([]);
  const future = useRef<HistoryEntry[]>([]);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    past.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    future.current = [];
    if (past.current.length > 50) past.current.shift();
  }, []);

  const undo = useCallback((nodes: Node[], edges: Edge[]): HistoryEntry | null => {
    const prev = past.current.pop();
    if (!prev) return null;
    future.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    return prev;
  }, []);

  const redo = useCallback((nodes: Node[], edges: Edge[]): HistoryEntry | null => {
    const next = future.current.pop();
    if (!next) return null;
    past.current.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
    return next;
  }, []);

  return { takeSnapshot, undo, redo };
}
