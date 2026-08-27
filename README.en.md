[简体中文](README.md)

# dsh-suite

> **The STARDUSTLC plugin suite**: 18 DSH plugins, one command.

Bundles four product lines — office flow, media studio, DevOps, and dream-based memory — into your DeepSeek Harness at once. Every row in the combined patch keeps the component's own defaults.

## Compatibility

Verified on `@deepseek-ai/dsh@0.1.1-rc.2` (2026-08-27): all 18 components booted together, HTTP 200, zero errors.

## Install / Uninstall

```bash
dsh plugin --profile web add github:STARDUSTLC666/dsh-suite
dsh plugin --profile web remove dsh-suite
```

Restart the web service afterwards. Prefer a single component? Install its own repo directly.

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
