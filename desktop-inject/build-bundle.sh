#!/usr/bin/env bash
# Builds tracker-bundle.js for Claude Desktop (Linux) injection.
# Everything runs in the page's main world, so bridge.js goes FIRST (fetch
# wrapper live), then the content scripts. bridge-client detects no extension
# runtime and skips script-tag injection (userscript mode).
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HERE/extension/src"
OUT="$HERE/desktop-inject/wrapper"
BUNDLE="$OUT/tracker-bundle.js"

{
  echo "/* Claude Tracker desktop bundle — generated $(date -u +%F) */"
  echo "(() => { try {"
  echo "const css = $(python3 -c "import json;print(json.dumps(open('$SRC/styles.css').read()))");"
  echo "const st = document.createElement('style'); st.id='cc-styles'; st.textContent = css;"
  echo "(document.head || document.documentElement).appendChild(st);"
  echo "} catch (e) { console.error('[ClaudeTracker] css inject failed', e); } })();"
  for f in injected/bridge.js content/constants.js content/settings.js \
           content/bridge-client.js vendor/o200k_base.js content/tokens.js \
           content/ui.js content/main.js; do
    cat "$SRC/$f"
    printf '\n;\n'
  done
} > "$BUNDLE"

node --check "$BUNDLE" && echo "bundle OK: $BUNDLE ($(du -h "$BUNDLE" | cut -f1))"
