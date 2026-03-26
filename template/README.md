# Prototype Template

This project is a Vite + React + TypeScript multipage prototype.

## Quick start
1) Install deps: `npm install`
2) Run dev server: `npm run dev` or double-click `start-dev.command`
3) Open component gallery: `npm run ladle` or double-click `start-ladle.command`

## Project structure
- `src/pages/` - multipage routes
- `src/components/ui/` - shadcn-style Radix components
- `src/state/` - Zustand stores
- `src/data/` - JSON mock data
- `src/stories/` - Ladle stories
- `tests/` - Vitest + Testing Library

## Scripts
- `npm run dev` - Vite dev server
- `npm run build` - build for production
- `npm run preview` - preview build
- `npm run test` - run Vitest
- `npm run test:ui` - Vitest UI
- `npm run ladle` - component gallery
- `npm run ladle:build` - build component gallery
- `npm run lint` - ESLint

## Publishing
- `./publish-folder.sh` builds and publishes `dist/` using environment variables.

## Routing on static hosts
This is a single-page app. Static hosts must fall back to `index.html` for client routes.
- Vercel: `vercel.json` includes an SPA rewrite.
- `publish-folder.sh`: copies `dist/index.html` to `dist/404.html` for hosts that serve `404.html`.
