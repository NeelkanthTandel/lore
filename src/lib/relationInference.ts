import type { Edge } from '@xyflow/react';
import type { RelationshipEdgeData } from '@/types/lore';
import { getPresetById } from '@/lib/relationPresets';

/** Convention: for parent/child relations, SOURCE = parent, TARGET = child. E.g. A --father_of--> C means A is father of C. */

/** Rule: when edge1 and edge2 share a node, infer a new relation. Optional commonPos1/commonPos2 restrict when the rule fires (common node must be at that end of the edge). */
interface InferenceRule {
  rel1: string;
  rel2: string;
  sourceOther: 1 | 2;
  targetOther: 1 | 2;
  inferredRel: string;
  /** Common node must be at this position in edge1 (e.g. 'source' = common is source of e1). */
  commonPos1?: 'source' | 'target';
  /** Common node must be at this position in edge2. */
  commonPos2?: 'source' | 'target';
}

const INFERENCE_RULES: InferenceRule[] = [
  // Spouse + parent -> other parent (common = the parent who is spouse)
  { rel1: 'spouse', rel2: 'father_of', sourceOther: 1, targetOther: 2, inferredRel: 'mother_of', commonPos2: 'source' },
  { rel1: 'spouse', rel2: 'mother_of', sourceOther: 1, targetOther: 2, inferredRel: 'father_of', commonPos2: 'source' },
  { rel1: 'father_of', rel2: 'spouse', sourceOther: 2, targetOther: 1, inferredRel: 'mother_of', commonPos1: 'source' },
  { rel1: 'mother_of', rel2: 'spouse', sourceOther: 2, targetOther: 1, inferredRel: 'father_of', commonPos1: 'source' },
  // Siblings: same parent (common = source of both) with two children => Sibling
  { rel1: 'father_of', rel2: 'father_of', sourceOther: 1, targetOther: 2, inferredRel: 'sibling_of', commonPos1: 'source', commonPos2: 'source' },
  { rel1: 'mother_of', rel2: 'mother_of', sourceOther: 1, targetOther: 2, inferredRel: 'sibling_of', commonPos1: 'source', commonPos2: 'source' },
  { rel1: 'father_of', rel2: 'mother_of', sourceOther: 1, targetOther: 2, inferredRel: 'sibling_of', commonPos1: 'source', commonPos2: 'source' },
  { rel1: 'mother_of', rel2: 'father_of', sourceOther: 1, targetOther: 2, inferredRel: 'sibling_of', commonPos1: 'source', commonPos2: 'source' },
  // Same person: edge and preset kept; auto-generation disabled (no rules here).
];

function getRelationType(edge: Edge<RelationshipEdgeData>): string | undefined {
  const t = edge.data?.relationType;
  if (t && t !== 'custom') return t;
  return undefined;
}

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Find a rule matching (r1,r2) or (r2,r1) whose commonPos1/commonPos2 match the actual positions. */
function findMatchingRule(
  r1: string,
  r2: string,
  pos1: 'source' | 'target',
  pos2: 'source' | 'target'
): { rule: InferenceRule; swapped: boolean } | null {
  for (const rule of INFERENCE_RULES) {
    if (rule.rel1 === r1 && rule.rel2 === r2) {
      if ((rule.commonPos1 == null || rule.commonPos1 === pos1) && (rule.commonPos2 == null || rule.commonPos2 === pos2)) {
        return { rule, swapped: false };
      }
    }
    if (rule.rel1 === r2 && rule.rel2 === r1) {
      if ((rule.commonPos1 == null || rule.commonPos1 === pos2) && (rule.commonPos2 == null || rule.commonPos2 === pos1)) {
        return { rule, swapped: true };
      }
    }
  }
  return null;
}

/** One step: from current edges, compute all new inferred edges (without deduplicating against existing). */
function inferOneStep(edges: Edge<RelationshipEdgeData>[]): Edge<RelationshipEdgeData>[] {
  const out: Edge<RelationshipEdgeData>[] = [];
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i];
      const e2 = edges[j];
      const r1 = getRelationType(e1);
      const r2 = getRelationType(e2);
      if (!r1 || !r2) continue;

      const nodes1 = [e1.source, e1.target];
      const nodes2 = [e2.source, e2.target];
      let common: string | null = null;
      let other1: string, other2: string;
      let pos1: 'source' | 'target', pos2: 'source' | 'target';
      for (const n1 of nodes1) {
        if (nodes2.includes(n1)) {
          common = n1;
          other1 = nodes1[0] === n1 ? nodes1[1]! : nodes1[0]!;
          other2 = nodes2[0] === n1 ? nodes2[1]! : nodes2[0]!;
          pos1 = e1.source === common ? 'source' : 'target';
          pos2 = e2.source === common ? 'source' : 'target';
          break;
        }
      }
      if (common == null) continue;

      const match = findMatchingRule(r1, r2, pos1, pos2);
      if (!match) continue;
      const { rule, swapped } = match;
      const so = swapped ? (rule.sourceOther === 1 ? 2 : 1) : rule.sourceOther;
      const to = swapped ? (rule.targetOther === 1 ? 2 : 1) : rule.targetOther;

      const inferredSource = (so === 1 ? other1 : other2)!;
      const inferredTarget = (to === 1 ? other1 : other2)!;
      const preset = getPresetById(rule.inferredRel);
      const label = preset?.label ?? rule.inferredRel;
      const direction = preset?.direction ?? 'one-way';
      const id = `inferred-${inferredSource}-${inferredTarget}-${rule.inferredRel}`;
      const useSideHandles = rule.inferredRel === 'sibling_of';
      out.push({
        id,
        source: inferredSource,
        target: inferredTarget,
        type: 'relationship',
        sourceHandle: useSideHandles ? 'right' : undefined,
        targetHandle: useSideHandles ? 'left' : undefined,
        data: {
          label,
          direction,
          color: '#888888',
          style: 'solid',
          relationType: rule.inferredRel,
          inferred: true,
        } as RelationshipEdgeData,
      });
    }
  }
  return out;
}

/**
 * From base edges (no inferred), compute all inferred edges by fixed-point.
 * Returns only the new inferred edges (with inferred: true).
 */
export function runInference(baseEdges: Edge<RelationshipEdgeData>[]): Edge<RelationshipEdgeData>[] {
  const byKey = new Map<string, Edge<RelationshipEdgeData>>();
  let current = baseEdges;
  const maxIterations = 20;
  let iter = 0;
  while (iter < maxIterations) {
    const newOnes = inferOneStep(current);
    let added = 0;
    for (const e of newOnes) {
      const k = edgeKey(e.source, e.target);
      if (byKey.has(k)) continue;
      if (current.some(c => c.source === e.source && c.target === e.target)) continue;
      if (current.some(c => c.source === e.target && c.target === e.source)) continue;
      byKey.set(k, e);
      current = [...current, e];
      added++;
    }
    if (added === 0) break;
    iter++;
  }
  return Array.from(byKey.values());
}

/**
 * Merge base edges with newly computed inferred edges.
 * Base = edges that are not inferred. Inferred edges are replaced by the new inference result.
 */
export function mergeInferredEdges(
  edges: Edge<RelationshipEdgeData>[],
  defaultSourceHandle = 'bottom',
  defaultTargetHandle = 'top'
): Edge<RelationshipEdgeData>[] {
  const base = edges.filter(e => !e.data?.inferred);
  const inferred = runInference(base);
  const withHandles = inferred.map(e => ({
    ...e,
    sourceHandle: e.sourceHandle ?? defaultSourceHandle,
    targetHandle: e.targetHandle ?? defaultTargetHandle,
  }));
  return [...base, ...withHandles];
}
