# Contributing to Lore

Thank you for considering contributing to Lore. This document explains how to propose changes and what we expect from contributors.

## Code of conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to contribute

### Reporting bugs

- Use the [Bug report](https://github.com/NeelkanthTandel/lore/issues/new?template=bug_report.md) issue template.
- Include steps to reproduce, expected vs actual behavior, and your environment (OS, Node version, browser).

### Suggesting features

- Use the [Feature request](https://github.com/NeelkanthTandel/lore/issues/new?template=feature_request.md) issue template.
- Describe the use case and why it would help.

### Pull requests

1. **Fork and clone**
   ```bash
   git clone https://github.com/NeelkanthTandel/lore.git
   cd lore
   ```

2. **Create a branch**
   ```bash
   git checkout -b fix/short-description
   # or
   git checkout -b feat/short-description
   ```

3. **Set up the project**
   ```bash
   npm install
   ```

4. **Make your changes**
   - Follow existing code style (we use ESLint; run `npm run lint`).
   - Add or update tests where relevant; run `npm run test`.
   - Keep commits focused and messages clear (e.g. `fix: correct map title save`, `feat: add export to JSON`).

5. **Push and open a PR**
   ```bash
   git push origin fix/short-description
   ```
   - Open a pull request against the default branch.
   - Fill in the PR template (description, related issues, testing done).
   - Ensure CI (lint/test) passes.

6. **Review**
   - Address review feedback. Once approved, a maintainer will merge.

## Development setup

- **Node.js:** v18 or later recommended.
- **Editor:** Any; the project uses ESLint and TypeScript. Formatting is left to your editor or Prettier if you add it.
- **Tests:** `npm run test` (Vitest). Use `npm run test:watch` for watch mode.

## Project structure (high level)

- `src/pages/` – Route-level pages (Home, MapEditor, Access, NotFound).
- `src/components/` – Reusable UI and lore-specific components (nodes, panels, dialogs).
- `src/store/` – State and Supabase logic (e.g. `mapStore`).
- `src/types/` – TypeScript types.
- `src/hooks/` – Custom React hooks.

When adding features, prefer small, focused PRs and keep the existing patterns (e.g. store usage, component structure).

## Questions?

Open a [Discussion](https://github.com/NeelkanthTandel/lore/discussions) or an issue and we’ll try to help.

Thanks for contributing.
