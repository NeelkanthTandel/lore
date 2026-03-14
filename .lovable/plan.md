

# Lore — Character Relationship Map Builder

## Home Screen
- Dark-themed landing with list of saved maps (thumbnail, title, date, node count)
- "New Map" button to create a new project
- Maps stored in localStorage with autosave (on change + every 30s)

## Canvas Editor (Core)
- **React Flow** powered infinite canvas with dark charcoal background (#0e0e10) and subtle grain texture
- **Pan/zoom**: click+drag on empty space to pan, scroll wheel to zoom
- **Minimap** in bottom-right corner
- **Undo/Redo** with Ctrl+Z / Ctrl+Y
- **Delete** selected nodes/edges with Delete/Backspace keys

## Character Nodes
- Custom React Flow nodes with circular portrait photo, character name, optional color-coded faction tag
- Draggable, with drop shadow and user-assignable colored ring
- Double-click to enter **Focus Mode** (highlight node + direct connections, dim everything else)
- Click node to open edit panel (name, photo URL, faction, ring color)

## Edges (Connections)
- Custom labeled edges with relationship text (e.g. "father of", "betrayed")
- Direction options: one-way arrow, two-way arrow, undirected
- User-picked color and style (solid, dashed, dotted)
- Bezier curves for graceful routing around clusters
- Click edge to edit label, color, style, direction

## Selection & Layout
- **Multi-select**: Shift+click or Shift+drag to select multiple nodes, move as group
- **Auto-layout** button: force-directed layout with smooth animation to reduce overlap
- **Search bar** at top: type character name → pan+zoom to that node and highlight it

## TMDB Integration
- Slide-in sidebar panel: "Add from Movie/Show"
- Search TMDB by title → show results with poster, title, year
- Select a result → fetch cast list with character name, actor name, photo
- Checkbox characters to add → they appear as nodes with TMDB photo and name
- **Settings panel** (gear icon, top-right): configure TMDB API key, stored in localStorage

## Export
- Download current map as PNG using html2canvas

## Visual Style
- Dark theme: charcoal canvas, dark surfaces, crisp white text
- Cinematic serif display font for "Lore" branding, clean sans-serif for UI
- Slide-in/out panels, no permanent sidebars
- Smooth micro-animations throughout

## Tech
- React Flow for graph engine (nodes, edges, canvas, minimap, controls)
- Tailwind CSS for styling
- localStorage for all persistence
- html2canvas for PNG export
- TMDB REST API for movie/character data

