# Claude Tracker — Safari Extension for claude.ai

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/marukoshi)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-MarkusSela-EA4AAA?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/MarkusSela)
[![Build](https://github.com/MarkusSela/claude-tracker-safari/actions/workflows/build.yml/badge.svg)](https://github.com/MarkusSela/claude-tracker-safari/actions/workflows/build.yml)

A **Safari web extension** that adds an inline usage panel to **claude.ai**,
for macOS · iOS · iPadOS. It shows your approximate token count, cache timer,
and **session (5h)** and **weekly (7d)** usage bars that fill in real time —
right inside the Claude page. No account, no data collection.

Ported from the Firefox/Chrome extension "Claude Counter" (Manifest V3).

- **Display name:** Claude Tracker
- **Bundle ID:** `io.github.markussela.aitracker` *(permanent — never change it)*

---

## For users

### iPhone / iPad — via SideStore

1. Install [SideStore](https://sidestore.io) (one-time PC setup, free Apple ID).
2. In SideStore → **Sources → ＋** → add:
   `https://markussela.github.io/claude-tracker-safari/source.json`
3. Open the source and install **Claude Tracker**.
4. **Settings → Apps → Claude Tracker** → enable it, then turn it on in Safari's
   extension settings.
5. Open **claude.ai** in Safari — the panel appears in the chat.

> The same IPA works on both iPhone and iPad (universal build).
>
> Free Apple ID certificates expire after 7 days; SideStore auto-refreshes in
> the background, so keep SideStore installed and refreshed.

### Mac — unsigned, no App Store

1. Download `ClaudeTracker-macOS.zip` from [Releases](../../releases/latest),
   unzip, move the app to Applications, and open it once.
2. Safari → **Settings → Advanced → Show features for web developers**.
3. Safari → **Develop → Allow Unsigned Extensions**.
4. Safari → **Settings → Extensions** → enable **Claude Tracker**.
5. Open **claude.ai**.

> "Allow Unsigned Extensions" resets when Safari restarts. To make it permanent,
> the app has to be notarized (Apple Developer Program) or shipped via the
> App Store.

---

## Build it yourself (no Mac required)

Building for Safari/iOS needs macOS + Xcode. This repo does it on a **GitHub
Actions macOS runner** — free on public repos, no local Mac needed.

1. Push this repo to GitHub (public).
2. **Settings → Actions** → allow workflows.
3. **Settings → Pages** → deploy from branch `main`, folder `/docs`
   (this serves `source.json`).
4. The workflow (`.github/workflows/build.yml`) runs on every push and produces
   `ClaudeTracker.ipa` + `ClaudeTracker-macOS.zip` as artifacts.
5. To publish a downloadable release that the SideStore source points at:
   create a release with tag `v0.4.2` and attach `ClaudeTracker.ipa`
   (keep the filename exact).

Have a Mac in hand instead? Run `scripts/build-safari.sh`.

---

## Known risk (verify on device)

The extension wraps `fetch` in the page context (`src/injected/bridge.js`) to
read Claude's SSE `message_limit` events. This pattern works in Firefox/Chrome
and *should* work in Safari — content-script injection and
`web_accessible_resources` are supported, and the extension has **no background
service worker** (the part iOS Safari restricts). But SSE interception through
Safari's content-script sandbox can only be fully confirmed by running it on a
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
  For the App Store, use a neutral name (e.g. "AI Usage Tracker") with
  "for Claude" in the subtitle. Sideloading has no such restriction.

Adding another AI = a new site in `content_scripts.matches` plus a per-site
adapter. Each provider exposes usage differently; some don't expose it at all.

### Roadmap: other AI providers

Claude exposes its usage cleanly (native session/weekly limits over SSE), which
is what makes these bars possible. In the future, if there's interest, I'd like
to extend Claude Tracker to **other AI chat services whose token usage isn't
clearly visible** — the ones that don't surface how much of your quota you've
burned. Those need per-provider reverse-engineering, and some may not be
feasible at all, but the generic (`aitracker`) identity is built to grow into a
multi-AI usage tracker without breaking anything. If a provider you use matters
to you, open an issue.

---

## Support ☕

Claude Tracker is free and open source, and it'll stay that way. If it's saved
you from hitting a limit mid-conversation, consider buying me a coffee.

Funds go toward the **Apple Developer Program ($99/yr)** — that's what unlocks a
proper **App Store / TestFlight** release, so anyone can install with one tap
instead of setting up SideStore.

[![Buy me a coffee on Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge)](https://ko-fi.com/marukoshi)

**🎯 Current goal — Apple Developer Program ($99/yr):** one-tap installs via
App Store / TestFlight, no SideStore setup for anyone.
**Stretch goal:** support for more AI providers whose usage isn't clearly
visible.

Every coffee gets us closer. Grazie 🙏

---

## Credits & license

Ported and maintained by [MarkusSela](https://github.com/MarkusSela).
Based on the original "Claude Counter" web extension. See [LICENSE](LICENSE);
the original work retains its own license.

Not affiliated with Anthropic. "Claude" is a trademark of Anthropic.
