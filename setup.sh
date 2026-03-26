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
green="\033[32m"
yellow="\033[33m"
red="\033[31m"
reset="\033[0m"

info()  { printf "${bold}${green}>>>${reset} %s\n" "$1"; }
warn()  { printf "${bold}${yellow}>>>${reset} %s\n" "$1"; }
error() { printf "${bold}${red}>>>${reset} %s\n" "$1" >&2; }

# ── Target = current directory ──
TARGET_DIR="$(pwd)"
PROJECT_NAME="$(basename "$TARGET_DIR")"
SAFE_NAME="$(printf '%s' "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')"
if [ -z "$SAFE_NAME" ]; then
  SAFE_NAME="my-prototype"
fi

# ── Warn if folder is not empty ──
if [ "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
  warn "This folder is not empty: $TARGET_DIR"
  echo ""
  ls -1 "$TARGET_DIR" | head -10
  FILE_COUNT="$(ls -1 "$TARGET_DIR" | wc -l | tr -d ' ')"
  if [ "$FILE_COUNT" -gt 10 ]; then
    echo "  ... and $((FILE_COUNT - 10)) more"
  fi
  echo ""
  printf "  Continue anyway? Existing files may be overwritten. (y/n) "
  read -r answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    error "Aborted."
    exit 1
  fi
  echo ""
fi

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
      printf "  Homebrew detected. Install Node.js now? (y/n) "
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

# The zip extracts to a folder named "proto-kit-main/"
EXTRACTED="$TMP_EXTRACT/proto-kit-$BRANCH"

if [ ! -d "$EXTRACTED/template" ]; then
  error "Unexpected archive structure. Expected template/ folder in repo."
  exit 1
fi

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
# Always take package.json from scaffold
cp "$TMP_SCAFFOLD/package.json" .
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

# ── Patch tsconfig files ──
# Vite's tsconfigs have block comments (/* ... */) and line comments (//) — use sed to strip them
patch_tsconfig_app() {
  # Strip /* ... */ and // comments, then remove trailing commas before } or ]
  sed -e 's|/\*[^*]*\*/||g' -e 's|//.*$||' tsconfig.app.json \
    | tr '\n' '\f' \
    | sed -E 's/,([[:space:]\f]*[}\]])/\1/g' \
    | tr '\f' '\n' > tsconfig.app.clean.json
  node -e "
var fs = require('fs');
var cfg = JSON.parse(fs.readFileSync('tsconfig.app.clean.json', 'utf8'));
cfg.compilerOptions.baseUrl = '.';
cfg.compilerOptions.paths = { '@/*': ['src/*'] };
if (!cfg.compilerOptions.types) cfg.compilerOptions.types = ['vite/client'];
fs.writeFileSync('tsconfig.app.json', JSON.stringify(cfg, null, 2) + '\n');
"
  rm -f tsconfig.app.clean.json
}

patch_tsconfig_node() {
  sed -e 's|/\*[^*]*\*/||g' -e 's|//.*$||' tsconfig.node.json \
    | tr '\n' '\f' \
    | sed -E 's/,([[:space:]\f]*[}\]])/\1/g' \
    | tr '\f' '\n' > tsconfig.node.clean.json
  node -e "
var fs = require('fs');
var cfg = JSON.parse(fs.readFileSync('tsconfig.node.clean.json', 'utf8'));
var inc = cfg.include || [];
if (inc.indexOf('git-api.ts') === -1) inc.push('git-api.ts');
if (inc.indexOf('vercel-api.ts') === -1) inc.push('vercel-api.ts');
cfg.include = inc;
fs.writeFileSync('tsconfig.node.json', JSON.stringify(cfg, null, 2) + '\n');
"
  rm -f tsconfig.node.clean.json
}

[ -f tsconfig.app.json ] && patch_tsconfig_app
[ -f tsconfig.node.json ] && patch_tsconfig_node

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
  sed -i '' "s|__PROTO_NAME__|$PROJECT_NAME|g" src/state/app-store.ts 2>/dev/null || true
fi

# ── Make scripts executable ──
chmod +x publish-folder.sh start-dev.command start-ladle.command 2>/dev/null || true

# ── Initialize git ──
if [ ! -d .git ]; then
  git init -q
fi
git add -A
git commit -q -m "Initial prototype setup"

# ── Done! ──
echo ""
echo "────────────────────────────────────────────"
info "Prototype ready: $TARGET_DIR"
echo "────────────────────────────────────────────"
echo ""
info "Starting dev server..."
echo ""

# Open browser after a short delay (dev server needs a moment)
(sleep 3 && open "http://localhost:5173" 2>/dev/null || true) &

npm run dev
