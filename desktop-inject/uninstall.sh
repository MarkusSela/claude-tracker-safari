#!/usr/bin/env bash
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Run with sudo."; exit 1; }
APPDIR=/usr/lib/claude-desktop/node_modules/electron/dist/resources/app
rm -rf "$APPDIR"
echo "Removed $APPDIR. Original app.asar untouched, claude-desktop back to normal."
