# Zluri Proto

Create a Zluri prototype with one command. No setup, no configuration — just run and start building.

## Quick Start

Create a folder, `cd` into it, and run:

```bash
mkdir my-prototype && cd my-prototype
npx zluri-proto
```

Or without npm:

```bash
mkdir my-prototype && cd my-prototype
curl -fsSL https://raw.githubusercontent.com/mthnmhn/proto-kit/main/setup.sh | bash
```

The script will:

1. Download the template and install dependencies
2. Start the dev server and open it in your browser

If the folder isn't empty, you'll get a warning before anything is overwritten.

## What You Get

A fully configured prototype that mirrors the Zluri product UI:

- **Navigation sidebar** — configurable items, icons, submenus
- **App shell** — header, breadcrumbs, secondary nav, content area
- **Component library** — buttons, inputs, cards, modals (Radix UI + Tailwind)
- **Git integration** — commit and push from the UI
- **Vercel deployment** — one-click deploy to a live URL
- **Versions timeline** — track commits, pushes, and deployments

## Requirements

- **Node.js 18+** — [download here](https://nodejs.org/en/download) (the script will try to install it via Homebrew if missing)

That's it. No git, no other tools needed.

## Working With Your Prototype

Once running, open the **zluri menu** (top-right) to:

- **Prototype Settings** — name, description, author
- **Navigation** — add, remove, reorder menu items with icon picker
- **Commit / Push** — save and upload changes to GitHub
- **Deploy** — publish to a live URL via Vercel
- **Versions** — see commit, push, and deployment history

These tools only appear locally — deployed prototypes show a clean product UI with no settings.

## Project Structure

```
your-prototype/
├── src/
│   ├── pages/           ← your prototype pages go here
│   ├── components/      ← reusable components
│   │   ├── ui/          ← base components (button, input, card)
│   │   └── layout/      ← app shell, sidebar, header
│   ├── state/           ← Zustand stores
│   └── lib/             ← utilities
├── vite.config.ts
└── tailwind.config.cjs
```

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, Zustand, Radix UI, Lucide Icons
