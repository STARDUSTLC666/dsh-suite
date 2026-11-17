# dsh-suite

[中文](README.md)

![dsh-suite whale girl plugin cover](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

Install 18 independent DSH plugins for email, calendars, memory, media and developer workflows with their combined defaults. Components remain independently installable; Review and Computer Use are distributed separately.

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-total-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

[Download statistics](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/README.md)

Feedback and contributions are welcome: report [issues](https://github.com/STARDUSTLC666/dsh-suite/issues) or submit [pull requests](https://github.com/STARDUSTLC666/dsh-suite/pulls).

0.9.1 gives the bundle and its 18 plugins purpose-made whale-girl icons with distinct function emblems, transparent padding and native list/detail support. Calendar availability suggestions remain included; [availability guide](docs/calendar-availability-2026-10-30.md).

## What it does

- Cover email, calendars, memory, media, developer tools and notifications.
- Pin component versions for reproducible installation and co-load checks.
- Components can also be installed and configured independently.

## What is included

| Line | Components (each with its own repository and version) |
|---|---|
| 📨 Office | [Email](https://github.com/STARDUSTLC666/dsh-email) · [Calendar](https://github.com/STARDUSTLC666/dsh-calendar) · [RSS](https://github.com/STARDUSTLC666/dsh-rss) · [Citations](https://github.com/STARDUSTLC666/dsh-cite) · [Dream](https://github.com/STARDUSTLC666/dsh-dream) |
| 🎬 Media | [FFmpeg](https://github.com/STARDUSTLC666/dsh-ffmpeg) · [Voice](https://github.com/STARDUSTLC666/dsh-voice) · [PPT](https://github.com/STARDUSTLC666/dsh-ppt) · [HyperFrames](https://github.com/STARDUSTLC666/dsh-hyperframes) · [Remotion](https://github.com/STARDUSTLC666/dsh-remotion) |
| 🔧 DevOps | [Docker](https://github.com/STARDUSTLC666/dsh-docker) · [SQL](https://github.com/STARDUSTLC666/dsh-sql) · [Flakefinder](https://github.com/STARDUSTLC666/dsh-flakefinder) · [Code Security](https://github.com/STARDUSTLC666/dsh-code-security) · [Codex Port](https://github.com/STARDUSTLC666/dsh-codex-port) |
| 💬 Notifications and presets | [DingTalk](https://github.com/STARDUSTLC666/dsh-dingtalk) · [Slack](https://github.com/STARDUSTLC666/dsh-slack) · [Minimal PTC](https://github.com/STARDUSTLC666/dsh-minimal-ptc) |

Nine components ship a native main-area workbench (Calendar, Citations, Code Security, Dream, Email, HyperFrames, PPT, Remotion, RSS); the rest are used from their own settings sections or conversation tools. Capabilities, tool arguments and self-checks are listed in the [usage guide](docs/USAGE.en.md#whats-inside-18).

[@stardustlc/dsh-review](https://github.com/STARDUSTLC666/dsh-review) (Git change review) and [deepseek-computer-use](https://github.com/STARDUSTLC666/deepseek-computer-use) (Windows desktop control) are companion plugins and are **not** part of these 18 components.

## Install

In DSH Desktop, install `@stardustlc/dsh-suite` from the Plugins panel. If the bundled dsh command is available:

```bash
dsh plugin --profile desktop add @stardustlc/dsh-suite
```

For the web version, replace `desktop` with `web`. Restart DSH after installation.

## Start using it

1. Install @stardustlc/dsh-suite in the desktop or web profile you use, then restart that profile.
2. Check Suite and its components in plugin management. The bundle contains 18 components; install Review and Computer Use separately.
3. Configure only the components you need: email/calendar require your accounts, and media tools require their local runtimes.
4. Start a concrete task from a sidebar workbench or conversation tools and verify its real result.
5. Check updates at the bottom of a component page. Suite components update as a bundle; you choose installation and restart timing.

## Requirements and configuration

Enable only the suite bundle in the profile; it loads the components. Each component still has its own account, executable and network requirements.

This version synchronizes independent update controls across all 18 components. Nine native workbenches retain host language, theme, narrow-window support and edit protection; the remaining components provide controls in their own settings sections. Components remain independently installable.

Requires official DSH **0.2.2-rc.3 or newer**; this round checked 0.2.2-rc.3 at the adaptation level (loading, contracts and offline tests, not the previous full Web walkthrough), recorded [here](docs/validation-2026-11-14-rc3.md). See the [workbench guide](docs/WORKBENCH_UI.md) and the earlier [validation record](docs/validation-2026-10-28-boundaries.md) for actual-operation boundaries. Review and Computer Use remain separate plugins outside this bundle's 18 components.

### Compatibility and mixed installs

- Requires official DSH 0.2.2-rc.3 or newer. On an older host the components still load, but the update control at the bottom of the page is absent: upgrade DSH first, then reopen the plugin details.
- Suite pins component versions and updates them as one bundle; the footer on any component page acts on the whole Suite.
- Components can also be installed and updated independently. Do not install the same component both ways: the profile ends up with a duplicate loader entry (`duplicate loader entry id`); see the [migration steps](docs/USAGE.en.md#migrate-an-older-suite-installation).
- When a new release does not match this environment (a newer DSH or Node.js is required, for example), the footer states the reason and the current version keeps working; check again after upgrading.

Detailed configuration, tool arguments and troubleshooting are in the [usage guide](docs/USAGE.en.md). For standalone development, follow the Node requirement in [package.json](package.json).

## Plugin updates

Requires DSH 0.2.2-rc.3 or newer. Update controls sit at the bottom of the existing workbench, or native plugin details for plugins without a workbench. Checks, release notes and preferences expand in place, with no separate update page or settings menu. Automatic checks are on by default; **automatic installation is off by default**. Only explicit opt-in permits compatible stable patches while idle with no unsaved changes. Preferences are independent, with per-plugin disable, deferral and ignore controls. No forced DSH restart or upgrade, and local-source installations stay unchanged. Suite components explain and operate on the whole Suite in the same footer.

Older Suite releases need one manual update in native plugin management to acquire these controls.

## Documentation

- [Usage and troubleshooting](docs/USAGE.en.md)
- [Changelog](CHANGELOG.md)
- [Validation scope and history](docs/VALIDATION.md)
- [Report a problem or suggest a feature](https://github.com/STARDUSTLC666/dsh-suite/issues)

## License

[MIT](LICENSE)
