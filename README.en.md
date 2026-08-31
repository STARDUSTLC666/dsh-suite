[简体中文](README.md)

![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite) ![downloads](https://img.shields.io/npm/dm/@stardustlc/dsh-suite) ![license](https://img.shields.io/github/license/STARDUSTLC666/dsh-suite) ![stars](https://img.shields.io/github/stars/STARDUSTLC666/dsh-suite?style=social)

# dsh-suite

> **The STARDUSTLC plugin suite**: 18 DSH plugins, one command.

Bundles five product lines — office flow (with dream-based memory), media studio, DevOps, messaging and presets — into your DeepSeek Harness at once. Every row in the combined patch keeps the component's own defaults.

## Compatibility

Verified on `@deepseek-ai/dsh@0.1.2-alpha.2` (2026-08-31): all 18 components booted together, token auth OK, zero errors (including dsh-minimal-ptc 0.4.2 adapted to the PTC rename).

## Install / Uninstall

The suite itself is on npm (prebuilt, no build approval needed):

```bash
dsh plugin --profile web add @stardustlc/dsh-suite
```

One command (suite + all 18 components; pnpm forbids git subdependencies, so components must be direct deps):

```bash
dsh plugin --profile web add github:STARDUSTLC666/dsh-suite github:STARDUSTLC666/dsh-calendar github:STARDUSTLC666/dsh-cite github:STARDUSTLC666/dsh-code-security github:STARDUSTLC666/dsh-codex-port github:STARDUSTLC666/dsh-dingtalk github:STARDUSTLC666/dsh-docker github:STARDUSTLC666/dsh-dream github:STARDUSTLC666/dsh-email github:STARDUSTLC666/dsh-ffmpeg github:STARDUSTLC666/dsh-flakefinder github:STARDUSTLC666/dsh-hyperframes github:STARDUSTLC666/dsh-minimal-ptc github:STARDUSTLC666/dsh-ppt github:STARDUSTLC666/dsh-remotion github:STARDUSTLC666/dsh-rss github:STARDUSTLC666/dsh-slack github:STARDUSTLC666/dsh-sql github:STARDUSTLC666/dsh-voice
```

```bash
dsh plugin --profile web remove @stardustlc/dsh-suite
```

Restart the web service afterwards. Prefer a single component? Install its own repo directly without this suite.

## What's inside (18)

| Line | Component | Capability |
| :-- | :-- | :-- |
| Office | dsh-email | IMAP/SMTP list/read/search/send/folders/attachments with since/until filters, eight provider presets, send-approval gate |
| | dsh-calendar | CalDAV list/create/update/delete/search (Google/iCloud/Nextcloud/custom) |
| | dsh-rss | RSS/Atom subscriptions + cross-feed search + incremental fetch |
| | dsh-cite | Crossref lookup + four citation styles + BibTeX |
| | dsh-dream | Session replay → reflection → dream journal → AGENTS.md bridge (privacy masking) |
| Media | dsh-ffmpeg | probe/cut/concat/encode/subtitle/batch frames/GIF |
| | dsh-voice | edge-tts synthesis + ASR transcription + voice preview |
| | dsh-ppt | One prompt to HTML slideshow + PPTX export |
| | dsh-hyperframes | HyperFrames by HeyGen five-skill bundle |
| | dsh-remotion | Remotion programmatic-video skill |
| DevOps | @stardustlc/dsh-docker | Seven container tools (incl. health) + exec approval gate |
| | dsh-sql | SQLite/MySQL/PostgreSQL + read-only guard + approval gate + stats/CSV |
| | dsh-flakefinder | Flaky-test detection + quarantine manifest |
| | dsh-code-security | 40+ rule deterministic security review + SARIF |
| | dsh-codex-port | Batch-port official Codex plugins into DSH skills |
| Messaging | dsh-dingtalk | DingTalk group robot (HMAC signing) |
| | dsh-slack | Two-way Slack over Socket Mode |
| Presets | dsh-minimal-ptc | Minimal-PTC agent preset |

Every component ships a `*_health` self-check tool — run them after install.

## Configuration

Override any component by its id in your profile's `cordis.patch.yml`.

## Development

```bash
pnpm install
pnpm test   # 5 tests: combined patch validity, 18-entry integrity, unique ids, dependency parity, docs
```

## License

MIT (all components are MIT in their own repos)
