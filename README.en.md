[简体中文](README.md)

# dsh-suite

> **The STARDUSTLC plugin suite**: 18 DSH plugins, one command.

Bundles five product lines — office flow (with dream-based memory), media studio, DevOps, messaging and presets — into your DeepSeek Harness at once. Every row in the combined patch keeps the component's own defaults.

## Compatibility

Verified on `@deepseek-ai/dsh@0.1.1-rc.2` (2026-08-27): all 18 components booted together, HTTP 200, zero errors.

## Install / Uninstall

One command (suite + all 18 components; pnpm forbids git subdependencies, so components must be direct deps):

```bash
dsh plugin --profile web add github:STARDUSTLC666/dsh-suite github:STARDUSTLC666/dsh-calendar github:STARDUSTLC666/dsh-cite github:STARDUSTLC666/dsh-code-security github:STARDUSTLC666/dsh-codex-port github:STARDUSTLC666/dsh-dingtalk github:STARDUSTLC666/dsh-docker github:STARDUSTLC666/dsh-dream github:STARDUSTLC666/dsh-email github:STARDUSTLC666/dsh-ffmpeg github:STARDUSTLC666/dsh-flakefinder github:STARDUSTLC666/dsh-hyperframes github:STARDUSTLC666/dsh-minimal-ptc github:STARDUSTLC666/dsh-ppt github:STARDUSTLC666/dsh-remotion github:STARDUSTLC666/dsh-rss github:STARDUSTLC666/dsh-slack github:STARDUSTLC666/dsh-sql github:STARDUSTLC666/dsh-voice
```

```bash
dsh plugin --profile web remove dsh-suite
```

Restart the web service afterwards. Prefer a single component? Install its own repo directly without this suite.

## What's inside (18)

Office: dsh-email, dsh-calendar, dsh-rss, dsh-cite, dsh-dream.
Media: dsh-ffmpeg, dsh-voice, dsh-ppt, dsh-hyperframes, dsh-remotion.
DevOps: @stardustlc/dsh-docker, dsh-sql, dsh-flakefinder, dsh-code-security, dsh-codex-port.
Messaging & presets: dsh-dingtalk, dsh-slack, dsh-minimal-ptc.

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
