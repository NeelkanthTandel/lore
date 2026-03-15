# Lore

A visual tool for building and editing **lore maps**—character relationships, story worlds, and narrative structure. Create nodes for characters or concepts, connect them with relationships, and optionally link to TMDB for film/TV references.

![Lore](https://img.shields.io/badge/Lore-open%20source-blue) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Name and trademark:** The maintainers of this project do not claim any trademark, service mark, or other rights in the name "Lore" or any related names or marks. "Lore" is used only to describe this software project. Any rights in such names belong to their respective owners.

## Features

- **Interactive map editor** – Drag-and-drop nodes and edges on a canvas (powered by [React Flow](https://reactflow.dev/))
- **Character & relationship nodes** – Define characters and relationships with labels and metadata
- **TMDB integration** – Attach film/TV references to nodes (optional)
- **Persistence** – Save maps locally or sync with [Supabase](https://supabase.com/) when configured
- **Sharing** – Share maps via URL when using Supabase
- **Export** – Export the current map as PNG

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [@xyflow/react](https://reactflow.dev/) (React Flow) for the graph canvas
- [Supabase](https://supabase.com/) for optional backend and sharing
- [TanStack Query](https://tanstack.com/query/latest) for data fetching

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended) and npm

### Install and run

```bash
git clone https://github.com/NeelkanthTandel/lore.git
cd lore
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Optional: Supabase (persistence & sharing)

1. Create a [Supabase](https://supabase.com/) project.
2. Run the SQL from the Supabase dashboard (or see docs) to create the `lore_maps` table and RLS policies.
3. Add a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Restart the dev server. Maps will be stored in Supabase and sharing will work.

### Build for production

```bash
npm run build
npm run preview   # optional: preview production build
```

## Versioning

We use **calendar versioning** in the form `YYYY.MM.DD` (e.g. `2026.03.15`), similar to [OpenCLAW](https://github.com/OpenCLAW/OpenCLAW). The version number is the release date; there are no separate major/minor/patch numbers.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build        |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint               |
| `npm run test` | Run Vitest tests         |

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.

- **Bug reports & feature requests:** [Open an issue](https://github.com/NeelkanthTandel/lore/issues)
- **Code changes:** See [CONTRIBUTING.md](CONTRIBUTING.md) for the PR process

## Security

To report a security vulnerability, see [SECURITY.md](SECURITY.md).

## License

This project is open source under the [MIT License](LICENSE). See [NOTICE](NOTICE) for the name and trademark disclaimer.
