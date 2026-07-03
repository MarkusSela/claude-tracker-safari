#!/usr/bin/env bash
# Packs the extension for browser stores from extension/ source.
#   dist/claude-tracker-chromium.zip  → Chrome Web Store, Edge Add-ons, Brave (via CWS)
#   dist/claude-tracker-firefox.zip   → Firefox AMO
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HERE/extension"
DIST="$HERE/dist"
TMP="$(mktemp -d)"
rm -rf "$DIST"; mkdir -p "$DIST"

# --- Chromium pack: strip browser_specific_settings (Firefox-only key) ---
cp -R "$SRC" "$TMP/chromium"
python3 - "$TMP/chromium/manifest.json" <<'PYEOF'
import json, sys
p = sys.argv[1]
m = json.load(open(p))
m.pop('browser_specific_settings', None)
json.dump(m, open(p, 'w'), indent=2)
PYEOF
(cd "$TMP/chromium" && zip -rq "$DIST/claude-tracker-chromium.zip" . -x "*.DS_Store")

# --- Firefox pack: manifest as-is (includes gecko id) ---
(cd "$SRC" && zip -rq "$DIST/claude-tracker-firefox.zip" . -x "*.DS_Store")

rm -rf "$TMP"
ls -la "$DIST"
