# Prototype Project Notes

## DO NOT MODIFY — Protected Files and Infrastructure

**The following files, directories, and configurations are part of the prototype infrastructure. They MUST NOT be edited, deleted, renamed, moved, or overwritten by any AI agent under any circumstances.**

### Protected files — never touch these:
- `git-api.ts` — Vite plugin providing git API endpoints
- `vite.config.ts` — Build config including the git API plugin
- `src/state/app-store.ts` — Zustand store with prototype settings and git token
- `src/lib/git.ts` — Git API client
- `src/components/CommitModal.tsx` — Commit UI
- `src/components/PushModal.tsx` — Push UI
- `src/components/layout/TopHeader.tsx` — Header with zluri dropdown menu
- `src/components/layout/SideRibbon.tsx` — Side ribbon navigation
- `src/components/layout/AppShell.tsx` — Main layout wrapper
- `src/components/layout/SecondaryNav.tsx` — Secondary navigation
- `src/components/layout/Breadcrumb.tsx` — Breadcrumb navigation
- `src/components/layout/index.ts` — Layout barrel exports
- `src/pages/ProtoSettingsAbout.tsx` — About page
- `src/pages/ProtoSettingsSettings.tsx` — Settings page with git config
- `src/pages/ProtoSettingsNavigation.tsx` — Navigation settings page
- `src/lib/vercel.ts` — Vercel API client
- `src/pages/ProtoSettingsVersions.tsx` — Commit history page
- `src/state/nav-store.ts` — Zustand store for navigation configuration
- `src/state/deploy-store.ts` — Zustand store for deployment history
- `src/lib/icon-registry.ts` — Lucide icon name-to-component registry
- `src/index.css` — Design system tokens, font imports, and Tailwind config
- `tailwind.config.cjs` — Color scales, typography, and font families
- `DESIGN_SYSTEM.md` — Design system reference
- `AGENTS.md` — This file
- `vercel-api.ts` — Vite plugin providing Vercel deployment endpoints
- `publish-folder.sh` — Publishing script

### Protected routes — never repurpose or remove:
- `/proto-settings` and all sub-routes (`/about`, `/settings`, `/navigation`, `/versions`)

### Protected behavior — never alter:
- The zluri dropdown menu in the header (Prototype Settings, Commit, Push)
- The `protoSettings` and `gitToken` state in the Zustand store
- The git API endpoints served by the Vite plugin (`/api/git/*`)
- The document title sync from `protoSettings.name`
- The header title reading from `protoSettings.headerTitle`

### What you CAN do:
- Add new pages in `src/pages/` and new routes in `src/App.tsx`
- Add new components in `src/components/` (but not in `src/components/layout/`)
- Add new UI primitives in `src/components/ui/`
- Add new Zustand stores in `src/state/` (but do not modify `app-store.ts`)
- Add new data files in `src/data/`
- Change the `"/"` route to point to your prototype's main page
- Use the AppShell, layout components, and UI primitives as intended

---

## Stack
- Vite + React + TypeScript
- Multipage app using React Router
- No backend; API calls are simulated via Zustand
- Mock data lives in JSON under `src/data/`
- UI uses Tailwind + shadcn-style Radix component wrappers (`src/components/ui/`)
- Layout shell components in `src/components/layout/` (AppShell, TopHeader, SideRibbon, etc.)
- Component gallery via Ladle (`src/stories/`)
- Unit/UI tests via Vitest + Testing Library (`tests/`)

## Design System

**Read `DESIGN_SYSTEM.md` for full reference.** Quick highlights:

- **Font**: Sora (body/display), Fragment Mono (code)
- **Colors**: Use `grey`, `blue`, `green`, `red`, `orange`, `yellow` scales (e.g., `bg-blue-600`, `text-grey-700`)
- **Typography**: Custom scale from `text-4xs` (11px) to `text-3xl` (64px). Most UI text should be `text-4xs` to `text-lg` (11–28px). Sizes `text-xl`+ are rare — only for page titles. `text-3xl` (64px) is almost never appropriate inside the app shell.
- **Layout**: Wrap all pages in `<AppShell>` for consistent header/sidebar/content structure

### Quick Color Reference
| Token | Hex | Usage |
|-------|-----|-------|
| `blue-600` | #0066FF | Primary actions |
| `red-600` | #E33F30 | Destructive |
| `green-600` | #229F2E | Success |
| `orange-500` | #F68009 | Warning |
| `grey-800` | #222222 | Primary text |
| `grey-500` | #909090 | Muted text |

### AppShell Usage
```tsx
import { AppShell } from '@/components/layout';

<AppShell title="Page Title">
  <div className="p-6">Content</div>
</AppShell>
```

## Routing

- `/proto-settings` is reserved for prototype-level settings (About, Settings). **Do not repurpose this path.**
- `/proto-settings/about` — Welcome/onboarding page (read-only, not for builders to modify).
- `/proto-settings/settings` — Prototype-level settings (future use).
- The builder's main prototype pages should live under their own routes (e.g., `/`, `/dashboard`, `/users`). Set the default `"/"` route to whatever makes sense for the prototype being built, but always keep `/proto-settings` accessible.

## Conventions
- Prefer JSON for mock data; only add .ts files when types or helpers are required.
- Keep pages in `src/pages/` and wire routes in `src/App.tsx`.
- Reusable UI primitives go in `src/components/ui/` (shadcn-style wrappers). Use these first before rolling custom UI.
- Layout components go in `src/components/layout/`.
- Zustand stores live in `src/state/`.
- Responsiveness targets tablet + desktop layouts; ensure grid/spacing scale for wider viewports (not mobile-first).
- Commit locally to git after every major change.

## Scripts
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run test` - run Vitest
- `npm run test:ui` - Vitest UI
- `npm run ladle` - component gallery
- `npm run ladle:build` - build component gallery
- `npm run lint` - ESLint

## Publishing
- Use `publish-folder.sh` to build and publish the `dist/` folder.
