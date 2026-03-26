# Prototype Project Notes

**This is a Zluri product prototype.** You're helping a designer build wireframes, prototypes, and proof-of-concepts for new features on Zluri's identity governance and ISPM (IT Security & Policy Management) platform. The app shell, navigation, design tokens, and components are already set up — focus on building pages and features using them.

---

## DO NOT MODIFY — Protected Files and Infrastructure

**The following files, directories, and configurations are part of the prototype infrastructure. They MUST NOT be edited, deleted, renamed, moved, or overwritten by any AI agent under any circumstances.**

### Protected files — never touch these:

**Entry & routing:**
- `src/main.tsx` — App entry point
- `src/App.tsx` — Route definitions and `__DEV__` gating logic
- `src/globals.d.ts` — `__DEV__` compile-time constant declaration

**Build & deploy config:**
- `vite.config.ts` — Build config with git/vercel API plugins and `__DEV__` define
- `git-api.ts` — Vite plugin providing git API endpoints
- `vercel-api.ts` — Vite plugin providing Vercel deployment endpoints
- `vercel.json` — SPA rewrite rules for Vercel
- `publish-folder.sh` — Build and deploy script

**Design system:**
- `src/index.css` — Design system tokens, font imports, and Tailwind config
- `tailwind.config.cjs` — Color scales, typography, and font families
- `DESIGN_SYSTEM.md` — Design system reference
- `AGENTS.md` — This file

**Layout components:**
- `src/components/layout/AppShell.tsx` — Main layout wrapper
- `src/components/layout/TopHeader.tsx` — Header with zluri dropdown menu
- `src/components/layout/SideRibbon.tsx` — Side ribbon navigation
- `src/components/layout/SecondaryNav.tsx` — Secondary navigation
- `src/components/layout/Breadcrumb.tsx` — Breadcrumb navigation
- `src/components/layout/index.ts` — Layout barrel exports

**Prototype settings pages (dev-only, stripped from production builds):**
- `src/pages/ProtoSettingsAbout.tsx` — Welcome/onboarding page
- `src/pages/ProtoSettingsSettings.tsx` — Git and Vercel configuration
- `src/pages/ProtoSettingsNavigation.tsx` — Sidebar navigation editor
- `src/pages/ProtoSettingsVersions.tsx` — Commit history viewer
- `src/pages/PlaceholderPage.tsx` — Default page for nav items in production

**Infrastructure components:**
- `src/components/CommitModal.tsx` — Commit UI
- `src/components/PushModal.tsx` — Push UI

**State stores:**
- `src/state/app-store.ts` — Prototype settings, git token, Vercel config
- `src/state/deploy-store.ts` — Deployment and push history
- `src/state/nav-store.ts` — Sidebar navigation items (structure is protected, but you can change default item labels/icons — see "What you CAN do")

**Libraries:**
- `src/lib/git.ts` — Git API client
- `src/lib/vercel.ts` — Vercel API client
- `src/lib/icon-registry.ts` — Lucide icon name-to-component registry
- `src/lib/nav-routes.ts` — `labelToSlug()` helper used by routing

### Protected routes — never repurpose or remove:
- `/proto-settings` and all sub-routes (`/about`, `/settings`, `/navigation`, `/versions`)

### Protected behavior — never alter:
- The zluri dropdown menu in the header (Prototype Settings, Commit, Push, Deploy)
- The `protoSettings`, `gitToken`, and `vercelToken` state in the Zustand store
- The git API endpoints served by the Vite plugin (`/api/git/*`)
- The Vercel API endpoints served by the Vite plugin (`/api/vercel/*`)
- The document title sync from `protoSettings.name`
- The header title reading from `protoSettings.headerTitle`
- The `__DEV__` compile-time gating that strips proto-settings from production builds

### What you CAN do:
- Add new pages in `src/pages/` and new routes in `src/App.tsx`
- Add new components in `src/components/` (but not in `src/components/layout/`)
- Add new UI primitives in `src/components/ui/`
- Add new Zustand stores in `src/state/` (but do not modify existing stores)
- Add new data files in `src/data/`
- Change the default nav items in `nav-store.ts` (labels, icons, sub-items) to match the prototype being built
- Use the AppShell, layout components, and UI primitives as intended

---

## Stack
- Vite + React + TypeScript
- Multipage app using React Router (`BrowserRouter` + `<Routes>`)
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

- Nav items in `nav-store.ts` auto-generate routes via `labelToSlug()` (e.g., "Contracts & Licenses" → `/contracts-licenses`)
- `/proto-settings/*` routes are gated behind `__DEV__` and stripped from production builds
- `/proto-settings/about` — Welcome/onboarding page
- `/proto-settings/settings` — Git and Vercel deployment configuration
- `/proto-settings/navigation` — Sidebar navigation editor
- `/proto-settings/versions` — Commit history viewer
- Add your prototype's pages as new routes in `src/App.tsx`

## Conventions
- Prefer JSON for mock data; only add .ts files when types or helpers are required.
- Keep pages in `src/pages/` and wire routes in `src/App.tsx`.
- Reusable UI primitives go in `src/components/ui/` (shadcn-style wrappers). Use these first before rolling custom UI.
- Layout components go in `src/components/layout/`.
- Zustand stores live in `src/state/`.
- Responsiveness targets tablet + desktop layouts; ensure grid/spacing scale for wider viewports (not mobile-first).
- Commit locally to git after every major change.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview build
- `npm run test` — run Vitest
- `npm run test:ui` — Vitest UI
- `npm run ladle` — component gallery
- `npm run ladle:build` — build component gallery
- `npm run lint` — ESLint
