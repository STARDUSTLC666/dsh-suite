# dsh-suite

[中文](README.md)

![dsh-suite whale girl plugin cover](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

Install 18 independent DSH plugins for email, calendars, memory, media and developer workflows with their combined defaults. Components remain independently installable; Review and Computer Use are distributed separately.

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

Feedback and contributions are welcome: report [issues](https://github.com/STARDUSTLC666/dsh-suite/issues) or submit [pull requests](https://github.com/STARDUSTLC666/dsh-suite/pulls).

0.6.3 synchronizes npm descriptions and both README guides for all 18 components, retaining the speech protocol, code inspection and write-confirmation fixes and the official HyperFrames 0.8.211 skills and renderer. The [per-plugin audit](docs/validation-2026-10-28-boundaries.md) distinguishes local tests, native host, browser interactions and live services.

## What it does

- Cover email, calendars, memory, media, developer tools and notifications.
- Pin component versions for reproducible installation and co-load checks.
- Components can also be installed and configured independently.

## Install

In DSH Desktop, install `@stardustlc/dsh-suite` from the Plugins panel. If the bundled dsh command is available:

```bash
dsh plugin --profile desktop add @stardustlc/dsh-suite
```

For the web version, replace `desktop` with `web`. Restart DSH after installation.

## Start using it

Install the suite when you need the full set, then configure the accounts and tools you use. For a few features, install the corresponding individual plugins. The guide lists the components.

PPT 0.19.0 also provides: choose a share bundle with current speaker notes or a project bundle retaining the JSON. Downloads require no AI review. Feature upgrades remain a user choice; automatic installation is off by default.

## Requirements and configuration

Enable only the suite bundle in the profile; it loads the components. Each component still has its own account, executable and network requirements.

This version synchronizes independent update controls across all 18 components. Nine native workbenches retain host language, theme, narrow-window support and edit protection; the remaining components provide controls in their own settings sections. Components remain independently installable.

Requires official DSH **0.2.1-rc.3 or newer**; this round was checked on **0.2.1-rc.4**. See the [workbench guide](docs/WORKBENCH_UI.md) and [validation record](docs/validation-2026-10-28-boundaries.md) for actual-operation boundaries. Review and Computer Use remain separate plugins outside this bundle's 18 components.

Detailed configuration, tool arguments and troubleshooting are in the [usage guide](docs/USAGE.en.md). For standalone development, follow the Node requirement in [package.json](package.json).

## Plugin updates

Requires DSH 0.2.1-rc.3 or newer. Update controls sit at the bottom of the existing workbench, or native plugin details for plugins without a workbench. Checks, release notes and preferences expand in place, with no separate update page or settings menu. Automatic checks are on by default; **automatic installation is off by default**. Only explicit opt-in permits compatible stable patches while idle with no unsaved changes. Preferences are independent, with per-plugin disable, deferral and ignore controls. No forced DSH restart or upgrade, and local-source installations stay unchanged. Suite components explain and operate on the whole Suite in the same footer.

Older Suite releases need one manual update in native plugin management to acquire these controls.

## Documentation

- [Usage and troubleshooting](docs/USAGE.en.md)
- [Changelog](CHANGELOG.md)
- [Validation scope and history](docs/VALIDATION.md)
- [Report a problem or suggest a feature](https://github.com/STARDUSTLC666/dsh-suite/issues)

## License

[MIT](LICENSE)
