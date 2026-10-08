# dsh-suite usage guide

[Overview](../README.en.md) · [Changelog](../CHANGELOG.md) · [Validation](VALIDATION.md)

## UI language

Select Chinese or English in DSH Settings → General → Language. Both interfaces use the same saved lessons, drafts, feeds, events and projects; language changes do not duplicate or translate user content. Native file controls follow the OS/browser language and original engine diagnostics remain intact. Dream can consolidate lesson candidates after task completion and a quiet period, within its budget, and retains manual tools. Candidates require human acceptance before reuse. Each chat controls contribution and use separately. It never automatically accepts candidates, edits user projects or treats retrieval counts as fact verification.

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
| Office | dsh-email | Eleven IMAP/SMTP and local-draft tools; editable drafts and attachment previews, per-account trusted recipients, Outlook OAuth2 login, bilingual multi-account settings and send approval |
| | dsh-calendar | CalDAV list/create/update/delete/search; month/week/agenda and drag rescheduling; ICS file/text previews, duplicate/conflict checks and connection/authorization guidance |
| | dsh-rss | RSS/Atom subscriptions + cross-feed search + incremental fetch; bilingual subscription panel, category filters, availability checks and OPML import previews/export |
| | dsh-cite | Bilingual library: DOI / BibTeX batch import, duplicate review, explicit Crossref enrichment, four basic citation formats and original-source backups |
| | dsh-dream | Session replay → source verification → lesson review → project-rule preview, apply and rollback (privacy masking) |
| Media | dsh-ffmpeg | probe/cut/concat/encode/subtitle/frames/GIF/adjust (speed/volume/mute/rotate), ten tools |
| | dsh-voice | edge-tts synthesis + ASR transcription + voice preview |
| | dsh-ppt | HTML slideshow and editable PPTX: 11 layouts including images/charts, per-slide editing/undo, quality reports, four scenario outlines, branding and speaker notes; optional PNG/PDF export via the official LibreOffice Kit |
| | dsh-hyperframes | HyperFrames by HeyGen's 21 skills; bilingual templates, assets, Studio previews, MP4 and source downloads |
| | dsh-remotion | Remotion React video skills; bilingual templates, assets, Studio previews, MP4 and source downloads |
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
node scripts/smoke-harness.mjs --harness-root C:/path/to/deepseek-harness --install-tarballs ../.harness-validation/tarballs.json --registry-components --registry-suite --contract-report ../.harness-validation/offline-report.json --report ../.harness-validation/registry-report.json
```

`--workspace-root` selects the parent of the component repositories. `--report` saves JSON, `--json` prints only JSON, and failures return a nonzero exit status. `--contracts-only` validates existing `lib/` artifacts without rebuilding or running unit tests.

Use `--install-tarballs` before release to test installation. The report must contain `{ "ok": true, "packages": [{ "name", "version", "tarball", "integrity" }] }` for the suite and all 18 components, with `sha512-...` integrity values. Only the temporary profile redirects those versions to local tarballs. The official CLI installs the suite; verification requires transitive component dependencies, no duplicate profile layers, successful startup, the complete registry and PTC mounting. Dependency installation can contact npm; this mode is not an offline test.

Contracts use the selected Harness's real `ToolRuntime` and `SkillRegistry`: required service declarations, all parameter/output schemas, skill registrations and collisions, both PTC SDKs, and the execution/rendering of 16 health fixtures plus `ppt_themes`. Legacy-host checks cover the retired directory format. On 0.1.7, startup verification checks declarative preset registration and module resolution. Startup verification also mounts it in a real agent, requiring `run_code` as the model entry point and retention of plugin tools and the shell. Only these read-only output samples are executed; other business workflows rely on the component unit tests and mocked dependencies.

HyperFrames and Remotion also undergo a real registry regression: remove one registered skill and require unhealthy status, then restore the matching registration and require healthy status. The startup smoke check executes both health tools and requires all bundled skills to be active.

Child environments omit service credentials and put HOME, DSH_HOME, CODEX_HOME and temporary files under workspace `.harness-validation/`. A Node preload permits loopback mock servers and blocks external fetch/TCP/UDP. It prevents accidental network access by trusted tests; it is not an OS sandbox. Test names containing `integration`, `live` or `e2e` are excluded and reported. Voice synthesis is opt-in via that component's `pnpm test:integration`. Crossref and subprocess version probes use fixtures, so `fixtureOk` does not describe live service readiness.

Run directories and reports remain available for inspection. `smoke-harness.mjs` covers real CLI startup, all components loaded together, Web HTTP and authentication, and compares every tool and skill against `--contract-report`. Add `--extra-plugin C:/path/to/modlens` to include a locally installed Modlens. These development scripts are used from the source checkout and are not shipped in the suite's patch-only npm package.

## License

MIT (all components are MIT in their own repos). The optional LibreOffice Kit renderer used by PPT is MPL-2.0; preserve its license and third-party notices when enabling or redistributing it. See the [PPT integration notes](https://github.com/STARDUSTLC666/dsh-ppt/blob/master/docs/LIBREOFFICE-INTEGRATION-2026-10-01.md).
