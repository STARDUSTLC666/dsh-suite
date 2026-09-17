[简体中文](README.md)

![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite) ![downloads](https://img.shields.io/npm/dm/@stardustlc/dsh-suite) ![license](https://img.shields.io/github/license/STARDUSTLC666/dsh-suite) ![stars](https://img.shields.io/github/stars/STARDUSTLC666/dsh-suite?style=social)

# dsh-suite

> **The STARDUSTLC plugin suite**: 18 DSH plugins, one command.

Bundles five product lines — office flow (with dream-based memory), media studio, DevOps, messaging and presets — into your DeepSeek Harness at once. Every row in the combined patch keeps the component's own defaults.

## Compatibility

Verified against official `@deepseek-ai/dsh@0.1.5-rc.1` and Node `24.16.0` on 2026-09-11: 18 components plus separately installed Modlens register 97 host tools and 34 skills. All component tool schemas and both PTC SDK generators pass; Minimal PTC mounts in a real agent and exposes `run_code` to the model. Isolated Web startup, token authentication (303/401/200) and process shutdown pass. Requires Node 22.19 or later within 22.x, or 24 or later. The scripts below reproduce these checks; offline tests do not establish live external-service readiness.

## Install / Uninstall

Installing the suite automatically installs the verified versions of all 18 components. The profile activates one suite layer, which loads the components:

```bash
dsh plugin --profile web add @stardustlc/dsh-suite
```

Alternatively, install the suite source from GitHub; its components still come from npm:

```bash
dsh plugin --profile web add github:STARDUSTLC666/dsh-suite
```

```bash
dsh plugin --profile web remove @stardustlc/dsh-suite
```

Restart the web service afterwards. Prefer a single component? Install its own repo directly without this suite.

### Migrate an older suite installation

If the suite and all components were previously installed as direct dependencies, first upgrade the suite to 0.1.3 or later with the command above, then remove the components' direct-install records. They remain installed as suite dependencies, avoiding the `duplicate loader entry id` startup failure:

```bash
dsh plugin --profile web remove @stardustlc/dsh-docker @stardustlc/dsh-dream dsh-calendar dsh-cite dsh-code-security dsh-codex-port dsh-dingtalk dsh-email dsh-ffmpeg dsh-flakefinder dsh-hyperframes dsh-minimal-ptc dsh-ppt dsh-remotion dsh-rss dsh-slack dsh-sql dsh-voice
```

Keep your profile's `cordis.patch.yml` configuration overrides, then restart Web.

## What's inside (18)

| Line | Component | Capability |
| :-- | :-- | :-- |
| Office | dsh-email | Ten IMAP/SMTP tools: list/read/search/send, attachments, incremental new-mail watch, flag & folder moves, reply/reply-all/forward; eight provider presets plus custom ones, Outlook OAuth2 device-code login, card-based multi-account settings page (bilingual), send-approval gate |
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
node scripts/smoke-harness.mjs --harness-root C:/path/to/deepseek-harness --install-tarballs ../.harness-validation/tarballs.json --contract-report ../.harness-validation/offline-report.json --report ../.harness-validation/install-report.json
```

`--workspace-root` selects the parent of the component repositories. `--report` saves JSON, `--json` prints only JSON, and failures return a nonzero exit status. `--contracts-only` validates existing `lib/` artifacts without rebuilding or running unit tests.

Use `--install-tarballs` before release to test installation. The report must contain `{ "ok": true, "packages": [{ "name", "version", "tarball", "integrity" }] }` for the suite and all 18 components, with `sha512-...` integrity values. Only the temporary profile redirects those versions to local tarballs. The official CLI installs the suite; verification requires transitive component dependencies, no duplicate profile layers, successful startup, the complete registry and PTC mounting. Dependency installation can contact npm; this mode is not an offline test.

Contracts use the selected Harness's real `ToolRuntime` and `SkillRegistry`: required service declarations, all parameter/output schemas, skill registrations and collisions, both PTC SDKs, and the execution/rendering of 16 health fixtures plus `ppt_themes`. The preset is materialized in an isolated home and its Harness module references are resolved. Startup verification also mounts it in a real agent, requiring `run_code` as the model entry point and retention of plugin tools and the shell. Only these read-only output samples are executed; other business workflows rely on the component unit tests and mocked dependencies.

HyperFrames and Remotion also undergo a real registry regression: remove one registered skill and require unhealthy status, then restore the matching registration and require healthy status. The startup smoke check executes both health tools and requires all bundled skills to be active.

Child environments omit service credentials and put HOME, DSH_HOME, CODEX_HOME and temporary files under workspace `.harness-validation/`. A Node preload permits loopback mock servers and blocks external fetch/TCP/UDP. It prevents accidental network access by trusted tests; it is not an OS sandbox. Test names containing `integration`, `live` or `e2e` are excluded and reported. Voice synthesis is opt-in via that component's `pnpm test:integration`. Crossref and subprocess version probes use fixtures, so `fixtureOk` does not describe live service readiness.

Run directories and reports remain available for inspection. `smoke-harness.mjs` covers real CLI startup, all components loaded together, Web HTTP and authentication, and compares every tool and skill against `--contract-report`. Add `--extra-plugin C:/path/to/modlens` to include a locally installed Modlens. These development scripts are used from the source checkout and are not shipped in the suite's patch-only npm package.

## License

MIT (all components are MIT in their own repos)
