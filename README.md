# Claude Tracker — Safari Extension for claude.ai

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/marukoshi)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-MarkusSela-EA4AAA?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/MarkusSela)
[![Build](https://github.com/MarkusSela/claude-tracker-safari/actions/workflows/build.yml/badge.svg)](https://github.com/MarkusSela/claude-tracker-safari/actions/workflows/build.yml)

A **Safari web extension** that adds an inline usage panel to **claude.ai**,
for macOS · iOS · iPadOS. Live token count, cache timer, and **session (5h)**
and **weekly (7d)** usage bars — right inside the Claude page. No account, no
data collection.

Ported from the Firefox/Chrome extension "Claude Counter" (Manifest V3).

| iPhone | Mac |
|---|---|
| ![iOS screenshot](docs/screenshots/ios.png) | ![macOS screenshot](docs/screenshots/macos.png) |

## Features

- **Live usage bars** — session (5h) and weekly (7d) quota, updating in real
  time as you chat. No page refresh needed; tap the row to force a refresh.
- **Time marker** — the vertical line inside each bar shows where you are *in
  time* within the window. Fill ahead of the line = you're burning quota
  faster than the window elapses.
- **Token counter** — approximate conversation tokens + prompt-cache countdown.
- **Settings panel** (⚙ gear next to the bars):
  - **7 languages** — English, Italiano, 中文, 日本語, Русский, Português,
    العربية (auto-detected, switchable)
  - **Bar colors** — Blue, Claude, Green, Purple
  - **Layout** — Inline, Stacked (full-width bars), or Auto (stacked on
    narrow screens)
- **Live author card** — the panel header (profile, Ko-fi link, funding goal)
  is fetched from this repo's `meta.json`, so it never goes stale inside the
  app.
- **Theme-aware** — follows claude.ai light/dark mode.

Both the iOS/iPadOS app and the macOS app are built from the **same extension
source**, so every feature above ships on all platforms with each release.

## Install

### iPhone / iPad — via SideStore

1. Install [SideStore](https://sidestore.io) (one-time PC setup, free Apple ID).
2. SideStore → **Sources → ＋** → add:
   `https://markussela.github.io/claude-tracker-safari/source.json`
3. Install **Claude Tracker** from the source.
4. **Settings → Apps → Claude Tracker** → enable, then enable it in Safari's
   extension settings.
5. Open **claude.ai** in Safari.

> **Note on App IDs:** the app registers **two App IDs** (the app itself + the
> Safari extension). With a free Apple ID, SideStore allows 10 App IDs per
> week — installing Claude Tracker uses 2 of them. Both must register for the
> extension to work correctly.
>
> The same IPA is universal (iPhone + iPad). Free-account certificates expire
> after 7 days; SideStore auto-refreshes in the background.

### Mac — unsigned, no App Store

1. Download `ClaudeTracker-macOS.zip` from [Releases](../../releases/latest),
   unzip, move the app to Applications, open it once.
2. Safari → **Settings → Advanced → Show features for web developers**.
3. Safari → **Develop → Allow Unsigned Extensions**.
4. Safari → **Settings → Extensions** → enable **Claude Tracker**.
5. Open **claude.ai**.

> "Allow Unsigned Extensions" resets when Safari restarts — a notarized /
> App Store build (see the goal below) removes that friction permanently.

### Chrome / Edge / Brave / Firefox

Same extension, same features, packaged for desktop browsers:

- **Chrome & Brave** — install from the Chrome Web Store *(listing coming
  soon)*. Brave installs Chrome extensions natively.
- **Edge** — Edge Add-ons store *(coming soon)*, or install the Chrome
  listing directly.
- **Firefox** — Firefox Add-ons (AMO) *(coming soon)*.

Until store listings are live, grab `claude-tracker-chromium.zip` /
`claude-tracker-firefox.zip` from [Releases](../../releases/latest) and load
manually (`chrome://extensions` → Developer mode → Load unpacked, or
`about:debugging` → Load Temporary Add-on in Firefox).

## Build it yourself (no Mac required)

CI builds everything on a GitHub Actions macOS runner — free on public repos.

1. Fork/push this repo (public) → **Settings → Actions** → allow workflows.
2. **Settings → Pages** → deploy branch `main`, folder `/docs` (serves
   `source.json` + `meta.json`).
3. Every push builds `ClaudeTracker.ipa` + `ClaudeTracker-macOS.zip` as
   artifacts. Attach the IPA (exact filename) to a release so the SideStore
   source can download it.

Have a real Mac? `scripts/build-safari.sh`.

## Roadmap

- **More AI providers** — extend the tracker to AI chat services whose token
  usage isn't clearly visible. Each provider needs its own adapter (and some
  may not be feasible); the generic bundle ID (`aitracker`) is built for this.
  Want one? Open an issue.
- **Home-screen widget (iOS)** — last-known usage + live reset countdown via
  WidgetKit, fed by the extension through native messaging.
- **Alternate app icons** and small supporter perks.
- **App Store / TestFlight release** — see the goal below.

## Support ☕

Claude Tracker is free and open source, and it'll stay that way.

**🎯 Current goal — Apple Developer Program ($99/yr):** unlocks App Store /
TestFlight distribution: one-tap installs, automatic updates, no SideStore, no
7-day certificates, for everyone. Progress is shown live inside the app's
settings panel.

[![Buy me a coffee on Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge)](https://ko-fi.com/marukoshi)

Every coffee gets us closer. Grazie 🙏

## Credits & license

Ported and maintained by [MarkusSela](https://github.com/MarkusSela).
Based on the original "Claude Counter" web extension (MIT). See
[LICENSE](LICENSE).

Not affiliated with Anthropic. "Claude" is a trademark of Anthropic.
