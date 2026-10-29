# dsh-suite

[中文](README.md)

![dsh-suite whale girl plugin cover](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

Install 18 independent DSH plugins for email, calendars, memory, media and developer workflows with their combined defaults. Components remain independently installable; Review and Computer Use are distributed separately.

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-total-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

[Download statistics](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/README.md)

Feedback and contributions are welcome: report [issues](https://github.com/STARDUSTLC666/dsh-suite/issues) or submit [pull requests](https://github.com/STARDUSTLC666/dsh-suite/pulls).

0.8.0 adds opt-in POP3 receiving in Email, with bounded search, attachments and the existing SMTP draft-confirmation flow. See the [POP3 validation scope](docs/validation-2026-10-29-pop3.md).

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

1. Install @stardustlc/dsh-suite in the desktop or web profile you use, then restart that profile.
2. Check Suite and its components in plugin management. The bundle contains 18 components; install Review and Computer Use separately.
3. Configure only the components you need: email/calendar require your accounts, and media tools require their local runtimes.
4. Start a concrete task from a sidebar workbench or conversation tools and verify its real result.
5. Check updates at the bottom of a component page. Suite components update as a bundle; you choose installation and restart timing.

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
