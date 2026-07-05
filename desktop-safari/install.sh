#!/usr/bin/env bash
# Installs Claude Tracker into Claude Desktop (bundled-Electron layout).
# Drops a wrapper at resources/app/ — Electron loads that dir BEFORE
# app.asar, so no launcher edit and no asar modification needed.
# Original app.asar stays untouched; apt upgrades won't remove this extra
# dir (dpkg doesn't purge files it doesn't own). Re-run after upgrades only
# if the app dir ever gets wiped.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
RESOURCES=/usr/lib/claude-desktop/node_modules/electron/dist/resources
ASAR="$RESOURCES/app.asar"
APPDIR="$RESOURCES/app"

[ "$(id -u)" -eq 0 ] || { echo "Run with sudo."; exit 1; }
[ -f "$ASAR" ] || { echo "app.asar not found at $ASAR"; exit 1; }
[ -f "$HERE/wrapper/tracker-bundle.js" ] || { echo "tracker-bundle.js missing — run build-bundle.sh first"; exit 1; }

mkdir -p "$APPDIR"
cp "$HERE/wrapper/wrapper.js" "$HERE/wrapper/tracker-bundle.js" "$APPDIR/"
cat > "$APPDIR/package.json" <<'PKG'
{ "name": "claude-tracker-wrapper", "version": "1.1.0", "main": "wrapper.js" }
PKG

echo "Installed: $APPDIR"
echo "Launch claude-desktop — bars should appear on the Claude page."
