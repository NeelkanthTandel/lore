import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  SelectionMode,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CharacterNode from '@/components/lore/CharacterNode';
import RelationshipEdge from '@/components/lore/RelationshipEdge';
import NodeEditPanel from '@/components/lore/NodeEditPanel';
import EdgeEditPanel from '@/components/lore/EdgeEditPanel';
import TMDBPanel from '@/components/lore/TMDBPanel';
import SettingsDialog from '@/components/lore/SettingsDialog';
import SearchBar from '@/components/lore/SearchBar';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { getMap, saveMap } from '@/store/mapStore';
import { CharacterNodeData, RelationshipEdgeData, LoreMap } from '@/types/lore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Film, Settings, Download, Shuffle, UserPlus } from 'lucide-react';
import html2canvas from 'html2canvas';

const nodeTypes = { character: CharacterNode };
const edgeTypes = { relationship: RelationshipEdge };

function MapEditorInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const [map, setMap] = useState<LoreMap | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editingNode, setEditingNode] = useState<Node<CharacterNodeData> | null>(null);
  const [editingEdge, setEditingEdge] = useState<Edge<RelationshipEdgeData> | null>(null);
  const [tmdbOpen, setTmdbOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const { takeSnapshot, undo, redo } = useUndoRedo();

  // Load map
  useEffect(() => {
    if (!id) return;
    const loaded = getMap(id);
    if (!loaded) { navigate('/'); return; }
    setMap(loaded);
    setNodes(loaded.nodes.map(n => ({ ...n, type: 'character' })) as Node[]);
    setEdges(loaded.edges.map(e => ({ ...e, type: 'relationship' })) as Edge[]);
  }, [id]);

  // Autosave
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();
  const doSave = useCallback(() => {
    if (!map) return;
    const updated: LoreMap = {
      ...map,
      updatedAt: new Date().toISOString(),
      nodes: nodes.map(n => ({ id: n.id, type: 'character', position: n.position, data: n.data as CharacterNodeData })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, type: 'relationship', data: e.data as RelationshipEdgeData })),
    };
    saveMap(updated);
  }, [map, nodes, edges]);

  useEffect(() => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(doSave, 1000);
    return () => clearTimeout(saveTimeout.current);
  }, [nodes, edges, doSave]);

  // Periodic save
  useEffect(() => {
    const interval = setInterval(doSave, 30000);
    return () => clearInterval(interval);
  }, [doSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        const state = undo(nodes, edges);
        if (state) { setNodes(state.nodes); setEdges(state.edges); }
      }
      if (((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey)) || ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        const state = redo(nodes, edges);
        if (state) { setNodes(state.nodes); setEdges(state.edges); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nodes, edges, undo, redo]);

  const onConnect = useCallback((connection: Connection) => {
    takeSnapshot(nodes, edges);
    setEdges(eds => addEdge({
      ...connection,
      type: 'relationship',
      data: { label: '', direction: 'undirected', color: '#888888', style: 'solid' } as RelationshipEdgeData,
    }, eds));
  }, [nodes, edges, takeSnapshot]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setEditingNode(node as Node<CharacterNodeData>);
    setEditingEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setEditingEdge(edge as Edge<RelationshipEdgeData>);
    setEditingNode(null);
  }, []);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setFocusedNodeId(prev => prev === node.id ? null : node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setEditingNode(null);
    setEditingEdge(null);
    setFocusedNodeId(null);
  }, []);

  const onNodesDelete = useCallback(() => { takeSnapshot(nodes, edges); }, [nodes, edges, takeSnapshot]);
  const onEdgesDelete = useCallback(() => { takeSnapshot(nodes, edges); }, [nodes, edges, takeSnapshot]);

  const updateNodeData = useCallback((nodeId: string, data: Partial<CharacterNodeData>) => {
    takeSnapshot(nodes, edges);
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
  }, [nodes, edges, takeSnapshot]);

  const updateEdgeData = useCallback((edgeId: string, data: Partial<RelationshipEdgeData>) => {
    takeSnapshot(nodes, edges);
    setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, data: { ...e.data, ...data } } : e));
  }, [nodes, edges, takeSnapshot]);

  const addCharacterNode = useCallback((name: string, photo: string) => {
    takeSnapshot(nodes, edges);
    const id = crypto.randomUUID();
    const position = screenToFlowPosition({ x: 200 + Math.random() * 400, y: 200 + Math.random() * 300 });
    const newNode: Node = {
      id,
      type: 'character',
      position,
      data: { name, photo, ringColor: '#c8a44e' } as CharacterNodeData,
    };
    setNodes(nds => [...nds, newNode]);
  }, [nodes, edges, takeSnapshot, screenToFlowPosition]);

  const handleTmdbAdd = useCallback((characters: { name: string; photo: string }[]) => {
    characters.forEach((c, i) => {
      setTimeout(() => addCharacterNode(c.name, c.photo), i * 50);
    });
  }, [addCharacterNode]);

  const addEmptyNode = useCallback(() => {
    addCharacterNode('New Character', '');
  }, [addCharacterNode]);

  // Auto-layout (simple force-directed)
  const autoLayout = useCallback(() => {
    takeSnapshot(nodes, edges);
    const spacing = 180;
    const cols = Math.ceil(Math.sqrt(nodes.length));
    setNodes(nds => nds.map((n, i) => ({
      ...n,
      position: {
        x: (i % cols) * spacing + Math.random() * 20,
        y: Math.floor(i / cols) * spacing + Math.random() * 20,
      },
    })));
    setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 100);
  }, [nodes, edges, takeSnapshot, fitView]);

  // Export PNG
  const exportPNG = useCallback(async () => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#0a0a0f', scale: 2 });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${map?.title || 'lore-map'}.png`;
    a.click();
  }, [map]);

  // Focus mode: dim non-connected nodes/edges
  const styledNodes = useMemo(() => {
    if (!focusedNodeId) return nodes;
    const connectedIds = new Set<string>([focusedNodeId]);
    edges.forEach(e => {
      if (e.source === focusedNodeId) connectedIds.add(e.target);
      if (e.target === focusedNodeId) connectedIds.add(e.source);
    });
    return nodes.map(n => ({
      ...n,
      style: connectedIds.has(n.id) ? { opacity: 1 } : { opacity: 0.15, transition: 'opacity 0.3s' },
    }));
  }, [nodes, edges, focusedNodeId]);

  const styledEdges = useMemo(() => {
    if (!focusedNodeId) return edges;
    return edges.map(e => ({
      ...e,
      style: (e.source === focusedNodeId || e.target === focusedNodeId)
        ? { opacity: 1 }
        : { opacity: 0.1, transition: 'opacity 0.3s' },
    }));
  }, [edges, focusedNodeId]);

  if (!map) return null;

  return (
    <div ref={reactFlowWrapper} className="w-full h-screen relative canvas-grain">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={() => { doSave(); navigate('/'); }} className="text-foreground hover:bg-accent">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-sm font-semibold text-foreground">{map.title}</h2>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <SearchBar />
          <Button variant="ghost" size="icon" onClick={() => setTmdbOpen(true)} title="Add from Movie/Show">
            <Film className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={addEmptyNode} title="Add Character">
            <UserPlus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={autoLayout} title="Auto Layout">
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={exportPNG} title="Export PNG">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        selectionMode={SelectionMode.Partial}
        panOnDrag
        selectionOnDrag={false}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        style={{ backgroundColor: 'hsl(240 10% 4%)' }}
      >
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#c8a44e33"
          maskColor="rgba(0,0,0,0.7)"
          pannable
          zoomable
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(240 4% 15%)" />
      </ReactFlow>

      {/* Edit panels */}
      {editingNode && (
        <NodeEditPanel
          node={editingNode}
          onUpdate={updateNodeData}
          onClose={() => setEditingNode(null)}
        />
      )}
      {editingEdge && (
        <EdgeEditPanel
          edge={editingEdge}
          onUpdate={updateEdgeData}
          onClose={() => setEditingEdge(null)}
        />
      )}

      {/* TMDB Panel */}
      <TMDBPanel open={tmdbOpen} onClose={() => setTmdbOpen(false)} onAddCharacters={handleTmdbAdd} />

      {/* Settings */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export default function MapEditor() {
  return (
    <ReactFlowProvider>
      <MapEditorInner />
    </ReactFlowProvider>
  );
}
