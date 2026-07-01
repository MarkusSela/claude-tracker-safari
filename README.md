# Claude Tracker

An inline usage panel for **claude.ai**, ported to Safari (macOS · iOS · iPadOS).
It injects a small panel into the Claude page showing your approximate token
count, cache timer, and **session (5h)** and **weekly (7d)** usage bars that fill
in real time. No account, no data collection.

Ported from the Firefox/Chrome extension "Claude Counter" (MV3).

- **Display name:** Claude Tracker (rename freely — see below)
- **Bundle ID:** `io.github.markussela.aitracker` (permanent — never change)

---

## For users

### iPhone / iPad (via SideStore)

1. Install [SideStore](https://sidestore.io) (one-time PC setup, free Apple ID).
2. In SideStore → **Sources** → **＋** → add:
   `https://markussela.github.io/claude-tracker-safari/source.json`
3. Open the source, install **Claude Tracker**.
4. **Settings → Apps → Claude Tracker** → enable, then enable it in Safari's
   extension settings.
5. Open **claude.ai** in Safari. The panel appears in the chat.

> Free Apple ID certs expire after 7 days; SideStore auto-refreshes in the
> background. Keep SideStore installed.

### Mac (unsigned, no App Store)

1. Download `ClaudeTracker-macOS.zip` from
   [Releases](../../releases/latest), unzip, move the app to Applications, open it.
2. Safari → **Settings → Advanced → Show features for web developers**.
3. Safari → **Develop → Allow Unsigned Extensions**.
4. Safari → **Settings → Extensions** → enable **Claude Tracker**.
5. Open **claude.ai**.

> "Allow Unsigned Extensions" resets each time Safari restarts. To make it
> permanent, the app must be notarized (Apple Developer Program) or shipped
> via the App Store.

---

## Build (no Mac required)

Building for Safari/iOS needs macOS + Xcode. This repo does it on a **GitHub
Actions macOS runner** — free on public repos, no local Mac.

1. Push this repo to GitHub (public).
2. **Settings → Actions** → allow workflows.
3. **Settings → Pages** → deploy from branch `main`, folder `/docs` (serves
   `source.json`).
4. The workflow (`.github/workflows/build.yml`) runs on push and produces
   `ClaudeTracker.ipa` + `ClaudeTracker-macOS.zip` as artifacts.
5. To publish a downloadable release the SideStore source points at:
   ```
   git tag v0.4.2 && git push --tags
   ```

> **First run:** the "Inspect generated project" step logs the exact Xcode
> scheme names. If a build step fails with "scheme not found", copy the real
> names into the `-scheme` values in the workflow. This is the one spot that
> may need a single tweak after the first CI run.

Have a Mac in hand instead? Run `scripts/build-safari.sh`.

---

## Known risk (test on device)

The extension wraps `fetch` in the page context (via `src/injected/bridge.js`)
to read Claude's SSE `message_limit` events. This pattern works in Firefox/Chrome
and *should* work in Safari (content-script injection + `web_accessible_resources`
are supported, and the extension has **no background service worker**, which is
the part iOS Safari restricts). But SSE interception through Safari's content-
script sandbox is the one thing that can only be confirmed by running it on a
real device. If the bars don't fill, that's where to look.

---

## Renaming / adding other AIs later

- The **display name** ("Claude Tracker") can change anytime with zero
  consequences — edit `--app-name` in the workflow and `name` in
  `extension/manifest.json`.
- The **bundle ID** is the permanent identity used for updates. Changing it =
  a brand-new app (lost updates/reviews). It's deliberately generic
  (`aitracker`) so it survives a future multi-AI rename.
- **App Store note:** "Claude" in the app *name* may be rejected (trademark).
  For App Store, use a neutral name (e.g. "AI Usage Tracker") with "for Claude"
  in the subtitle. Sideloading has no such restriction.

Adding another AI = a new site in `content_scripts.matches` + a per-site
adapter. Each provider exposes usage differently; some don't expose it at all.

---

## Support

If this is useful, support development via the **Sponsor** button (see
`.github/FUNDING.yml`). Funds go toward the Apple Developer Program ($99/yr)
to publish on the App Store — no sideloading, permanent, auto-updating.

## License

See [LICENSE](LICENSE). Original "Claude Counter" work retains its license.
