#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
#  Zluri Prototype Setup
#  Downloads template, installs deps, starts dev server
# ─────────────────────────────────────────────────────

REPO="mthnmhn/proto-kit"
BRANCH="main"
ARCHIVE_URL="https://github.com/$REPO/archive/refs/heads/$BRANCH.zip"

# ── Colors ──
bold="\033[1m"
dim="\033[2m"
green="\033[32m"
yellow="\033[33m"
red="\033[31m"
reset="\033[0m"

info()  { printf "${bold}${green}>>>${reset} %s\n" "$1"; }
warn()  { printf "${bold}${yellow}>>>${reset} %s\n" "$1"; }
error() { printf "${bold}${red}>>>${reset} %s\n" "$1" >&2; }

# ── Check Node.js ──
if ! command -v node >/dev/null 2>&1; then
  if ! command -v npm >/dev/null 2>&1; then
    echo ""
    error "Node.js is not installed."
    echo ""
    echo "  Node.js is required to run prototypes."
    echo "  Install it from: https://nodejs.org/en/download"
    echo ""

    # Try auto-install via Homebrew on macOS
    if command -v brew >/dev/null 2>&1; then
      echo -n "  Homebrew detected. Install Node.js now? (y/n) "
      read -r answer
      if [[ "$answer" =~ ^[Yy]$ ]]; then
        brew install node
      else
        exit 1
      fi
    else
      exit 1
    fi
  fi
fi

NODE_VERSION="$(node -v 2>/dev/null || echo 'unknown')"
info "Using Node.js $NODE_VERSION"

# ── Ask for project name ──
echo ""
printf "${bold}What do you want to call your prototype?${reset} ${dim}(e.g. onboarding-flow)${reset}\n"
printf "> "
read -r PROJECT_INPUT

if [ -z "$PROJECT_INPUT" ]; then
  PROJECT_INPUT="my-prototype"
fi

# Sanitize to a safe folder name
SAFE_NAME="$(printf '%s' "$PROJECT_INPUT" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')"
if [ -z "$SAFE_NAME" ]; then
  SAFE_NAME="my-prototype"
fi

# ── Ask where to create it ──
DEFAULT_DIR="$HOME/Desktop"
echo ""
printf "${bold}Where should I create it?${reset} ${dim}(press Enter for Desktop)${reset}\n"
printf "> "
read -r DIR_INPUT

if [ -z "$DIR_INPUT" ]; then
  PARENT_DIR="$DEFAULT_DIR"
else
  # Expand ~ if used
  PARENT_DIR="${DIR_INPUT/#\~/$HOME}"
fi

if [ ! -d "$PARENT_DIR" ]; then
  error "Directory does not exist: $PARENT_DIR"
  exit 1
fi

TARGET_DIR="$PARENT_DIR/$SAFE_NAME"

if [ -d "$TARGET_DIR" ]; then
  warn "Folder already exists: $TARGET_DIR"
  printf "  Overwrite? (y/n) "
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    rm -rf "$TARGET_DIR"
  else
    error "Aborted."
    exit 1
  fi
fi

# ── Download template ──
info "Downloading template..."

TMP_ZIP="$(mktemp -t proto-XXXXXX).zip"
TMP_EXTRACT="$(mktemp -d -t proto-extract-XXXXXX)"
cleanup() { rm -f "$TMP_ZIP"; rm -rf "$TMP_EXTRACT"; }
trap cleanup EXIT

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$ARCHIVE_URL" -o "$TMP_ZIP"
elif command -v wget >/dev/null 2>&1; then
  wget -q "$ARCHIVE_URL" -O "$TMP_ZIP"
else
  error "Neither curl nor wget found. Install one and retry."
  exit 1
fi

# ── Extract ──
info "Setting up project..."

unzip -q "$TMP_ZIP" -d "$TMP_EXTRACT"

# The zip extracts to a folder named "proto-kit-main/" — move its template/ contents
EXTRACTED="$TMP_EXTRACT/proto-kit-$BRANCH"

if [ ! -d "$EXTRACTED/template" ]; then
  error "Unexpected archive structure. Expected template/ folder in repo."
  exit 1
fi

mkdir -p "$TARGET_DIR"

# Copy template contents into the project
if command -v rsync >/dev/null 2>&1; then
  rsync -a "$EXTRACTED/template"/ "$TARGET_DIR"/
else
  cp -R "$EXTRACTED/template"/. "$TARGET_DIR"/
fi

cd "$TARGET_DIR"

# ── Create Vite scaffold (package.json, tsconfig, etc.) ──
info "Scaffolding project..."

TMP_SCAFFOLD=".tmp-vite-scaffold"
rm -rf "$TMP_SCAFFOLD"
npx -y create-vite@latest "$TMP_SCAFFOLD" --template react-ts --no-interactive --name "$SAFE_NAME" 2>/dev/null

# Copy scaffold files (package.json, tsconfig, etc.) but don't overwrite our template files
for f in "$TMP_SCAFFOLD"/*; do
  fname="$(basename "$f")"
  if [ ! -e "$fname" ]; then
    cp -R "$f" .
  fi
done
# Always take package.json and tsconfig from scaffold
cp "$TMP_SCAFFOLD/package.json" .
cp "$TMP_SCAFFOLD/tsconfig.json" . 2>/dev/null || true
cp "$TMP_SCAFFOLD/tsconfig.app.json" . 2>/dev/null || true
cp "$TMP_SCAFFOLD/tsconfig.node.json" . 2>/dev/null || true
rm -rf "$TMP_SCAFFOLD"

# ── Configure scripts ──
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc -b && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:ui="vitest --ui"
npm pkg set scripts.ladle="ladle serve --port 61000"
npm pkg set scripts.ladle:build="ladle build"

# ── Install dependencies ──
info "Installing dependencies (this may take a minute)..."

npm install \
  react-router-dom \
  zustand \
  clsx \
  class-variance-authority \
  tailwind-merge \
  tailwindcss-animate \
  lucide-react \
  @radix-ui/react-accordion \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-label \
  @radix-ui/react-popover \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slot \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-tooltip \
  --silent 2>/dev/null

npm install -D \
  @tailwindcss/vite \
  tailwindcss \
  postcss \
  autoprefixer \
  @vitejs/plugin-react \
  @ladle/react \
  vitest \
  @vitest/ui \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  eslint \
  eslint-plugin-react-hooks \
  eslint-plugin-react-refresh \
  @eslint/js \
  globals \
  typescript-eslint \
  --silent 2>/dev/null

# ── Patch tsconfig.app.json ──
if [ -f tsconfig.app.json ]; then
  node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('tsconfig.app.json', 'utf8'));
if (!cfg.compilerOptions.paths) {
  cfg.compilerOptions.baseUrl = '.';
  cfg.compilerOptions.paths = { '@/*': ['src/*'] };
  fs.writeFileSync('tsconfig.app.json', JSON.stringify(cfg, null, 2) + '\n');
}
"
fi

# ── Patch tsconfig.node.json ──
if [ -f tsconfig.node.json ]; then
  node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('tsconfig.node.json', 'utf8'));
const needed = ['git-api.ts', 'vercel-api.ts'];
const inc = cfg.include || [];
let changed = false;
for (const f of needed) {
  if (!inc.includes(f)) { inc.push(f); changed = true; }
}
if (changed) {
  cfg.include = inc;
  fs.writeFileSync('tsconfig.node.json', JSON.stringify(cfg, null, 2) + '\n');
}
"
fi

# ── Patch index.css for Tailwind v4 ──
INDEX_CSS="src/index.css"
if [ -f "$INDEX_CSS" ]; then
  # Add @config if missing
  if ! grep -q '@config' "$INDEX_CSS"; then
    printf '%s\n\n%s' '@config "../tailwind.config.cjs";' "$(cat "$INDEX_CSS")" > "$INDEX_CSS"
  fi
  # Replace old @tailwind directives with @import
  node -e "
const fs = require('fs');
let text = fs.readFileSync('src/index.css', 'utf8');
const old = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n';
if (text.includes(old)) {
  text = text.replace(old, '@import \"tailwindcss\";\n');
  fs.writeFileSync('src/index.css', text);
}
"
fi

# ── Inject project-specific values ──
GIT_USER="$(git config user.name 2>/dev/null || echo '')"

if [ -f src/pages/ProtoSettingsAbout.tsx ]; then
  sed -i '' "s|__PROJECT_DIR__|$TARGET_DIR|g" src/pages/ProtoSettingsAbout.tsx 2>/dev/null || true
fi

if [ -f src/state/app-store.ts ]; then
  sed -i '' "s|__GIT_USER__|$GIT_USER|g" src/state/app-store.ts 2>/dev/null || true
  sed -i '' "s|__PROTO_NAME__|$PROJECT_INPUT|g" src/state/app-store.ts 2>/dev/null || true
fi

# ── Make scripts executable ──
chmod +x publish-folder.sh start-dev.command start-ladle.command 2>/dev/null || true

# ── Initialize git ──
git init -q
git add -A
git commit -q -m "Initial prototype setup"

# ── Done! ──
echo ""
echo "────────────────────────────────────────────"
info "Prototype created at: $TARGET_DIR"
echo "────────────────────────────────────────────"
echo ""
info "Starting dev server..."
echo ""

# Open browser after a short delay (dev server needs a moment)
(sleep 3 && open "http://localhost:5173" 2>/dev/null || true) &

npm run dev
