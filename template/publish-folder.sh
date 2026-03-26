#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-https://buildr.mthnmhn.com}"
PUBLISH_TOKEN="${PUBLISH_TOKEN:-CHANGE_ME}"
PROJECT_ID="${PROJECT_ID:-$(basename "$PWD")}" 
SLUG="${SLUG:-$(basename "$PWD")}" 

ZIP_TMP="$(mktemp -t publish-XXXXXX.zip)"
rm -f "$ZIP_TMP"
cleanup() { rm -f "$ZIP_TMP"; }
trap cleanup EXIT

echo "Building project (npm run build)..."
npm run build >/dev/null

DIST_DIR="${DIST_DIR:-dist}"
if [ ! -d "$DIST_DIR" ]; then
  echo "Build output not found at '$DIST_DIR'. Set DIST_DIR or ensure npm run build produces it." >&2
  exit 1
fi

INDEX_HTML="$DIST_DIR/index.html"
SPA_FALLBACK="$DIST_DIR/404.html"
if [ -f "$INDEX_HTML" ] && [ ! -f "$SPA_FALLBACK" ]; then
  cp "$INDEX_HTML" "$SPA_FALLBACK"
fi

echo "Zipping build output from $PWD/$DIST_DIR"
(cd "$DIST_DIR" && zip -qr "$ZIP_TMP" .)

ARCHIVE_B64="$(base64 < "$ZIP_TMP" | tr -d '\n')"

echo "Publishing to $API_BASE/api/projects/$PROJECT_ID/publish (slug: $SLUG)"
RESPONSE="$(
  curl -fsSL -X POST "$API_BASE/api/projects/$PROJECT_ID/publish" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $PUBLISH_TOKEN" \
    -d "{\"archiveBase64\":\"$ARCHIVE_B64\",\"slug\":\"$SLUG\"}"
)"

echo "$RESPONSE"
echo "Expected URL: ${API_BASE%/}/proto/$SLUG"
