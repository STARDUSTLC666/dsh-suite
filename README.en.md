[简体中文](README.md)

![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite) ![downloads](https://img.shields.io/npm/dm/@stardustlc/dsh-suite) ![license](https://img.shields.io/github/license/STARDUSTLC666/dsh-suite) ![stars](https://img.shields.io/github/stars/STARDUSTLC666/dsh-suite?style=social)

# dsh-suite

> **The STARDUSTLC plugin suite**: 18 DSH plugins, one command.

Bundles five product lines — office flow (with dream-based memory), media studio, DevOps, messaging and presets — into your DeepSeek Harness at once. Every row in the combined patch keeps the component's own defaults.

## Compatibility

Verified against `@deepseek-ai/dsh@0.1.3-alpha.1` (2026-09-05): 18 components, 96 tools and 34 skills. All tool schemas pass the official JSON Schema subset, both TypeScript and Python PTC SDKs render, and isolated Web startup and token authentication pass. The scripts below reproduce these checks against local source.

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
| Media | dsh-ffmpeg | probe/cut/concat/encode/subtitle/frames/GIF/adjust (speed/volume/mute/rotate), ten tools |
| | dsh-voice | edge-tts synthesis + ASR transcription + voice preview |
| | dsh-ppt | One prompt to HTML slideshow + PPTX export: 7 layouts (quote/table) + speaker notes |
| | dsh-hyperframes | HyperFrames by HeyGen bundle of 20 skills |
| | dsh-remotion | Remotion programmatic-video skill |
| DevOps | @stardustlc/dsh-docker | Seven container tools (incl. health) + exec approval gate |
| | dsh-sql | SQLite/MySQL/PostgreSQL + read-only guard + approval gate + stats/CSV |
| | dsh-flakefinder | Flaky-test detection + quarantine manifest |
| | dsh-code-security | 40+ rule deterministic security review + SARIF |
| | dsh-codex-port | Batch-port official Codex plugins into DSH skills |
| Messaging | dsh-dingtalk | DingTalk group robot (HMAC signing) |
| | dsh-slack | Two-way Slack over Socket Mode |
| Presets | dsh-minimal-ptc | Minimal-PTC agent preset |

16 components provide `*_health`; use the read-only `ppt_themes` for PPT and check the preset picker for minimal-ptc. Some health tools contact external services or invoke local CLIs.

## Configuration

Override any component by its id in your profile's `cordis.patch.yml`.

## Development

```bash
pnpm install
pnpm test   # suite manifest, documentation and offline-environment tests
```

Place the 18 component checkouts beside `dsh-suite`, with development dependencies already installed and Harness already built. The verifier discovers components from `cordis.patch.yml`, rebuilds with each local TypeScript compiler and runs top-level unit tests. It never runs an installation command.

```bash
node scripts/verify-local.mjs --harness-root C:/path/to/deepseek-harness --report ../.harness-validation/offline-report.json
node scripts/verify-local.mjs --harness-root C:/path/to/deepseek-harness --contracts-only --json
node scripts/smoke-harness.mjs --harness-root C:/path/to/deepseek-harness --contract-report ../.harness-validation/offline-report.json --report ../.harness-validation/smoke-report.json
```

`--workspace-root` selects the parent of the component repositories. `--report` saves JSON, `--json` prints only JSON, and failures return a nonzero exit status. `--contracts-only` validates existing `lib/` artifacts without rebuilding or running unit tests.

Contracts use the selected Harness's real `ToolRuntime` and `SkillRegistry`: required service declarations, all parameter/output schemas, skill registrations and collisions, both PTC SDKs, and the execution/rendering of 16 health fixtures plus `ppt_themes`. The preset is materialized in an isolated home and its Harness module references are resolved. Only these read-only output samples are executed; other business workflows rely on the component unit tests and mocked dependencies.

HyperFrames and Remotion also undergo a real registry regression: remove one registered skill and require unhealthy status, then restore the matching registration and require healthy status. The startup smoke check executes both health tools and requires all bundled skills to be active.

Child environments omit service credentials and put HOME, DSH_HOME, CODEX_HOME and temporary files under workspace `.harness-validation/`. A Node preload permits loopback mock servers and blocks external fetch/TCP/UDP. It prevents accidental network access by trusted tests; it is not an OS sandbox. Test names containing `integration`, `live` or `e2e` are excluded and reported. Voice synthesis is opt-in via that component's `pnpm test:integration`. Crossref and subprocess version probes use fixtures, so `fixtureOk` does not describe live service readiness.

Run directories and reports remain available for inspection. `smoke-harness.mjs` covers real CLI startup, all components loaded together, Web HTTP and authentication, and compares every tool and skill against `--contract-report`. Add `--extra-plugin C:/path/to/modlens` to include a locally installed Modlens. These development scripts are used from the source checkout and are not shipped in the suite's patch-only npm package.

## License

MIT (all components are MIT in their own repos)
