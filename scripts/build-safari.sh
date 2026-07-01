#!/usr/bin/env bash
# Local build (run on a Mac with Xcode). CI does the same in
# .github/workflows/build.yml — this is only if you have a Mac in hand.
set -euo pipefail

APP_NAME="Claude Tracker"
BUNDLE_ID="io.github.markussela.aitracker"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

rm -rf "$HERE/build"
xcrun safari-web-extension-converter "$HERE/extension" \
  --project-location "$HERE/build" \
  --app-name "$APP_NAME" \
  --bundle-identifier "$BUNDLE_ID" \
  --swift --force

echo
echo "Xcode project created at: build/$APP_NAME/$APP_NAME.xcodeproj"
echo "Open it in Xcode, then:"
echo "  macOS: build & run, then Safari > Develop > Allow Unsigned Extensions."
echo "  iOS:   select your device + free Apple ID team, build & run to install."
open "$HERE/build/$APP_NAME/$APP_NAME.xcodeproj"
