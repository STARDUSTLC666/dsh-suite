# dsh-suite

[中文](README.md)

![dsh-suite whale girl plugin cover](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

Install 18 independent DSH plugins with a shared bundle of their defaults.

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

Feedback and contributions are welcome: report [issues](https://github.com/STARDUSTLC666/dsh-suite/issues) or submit [pull requests](https://github.com/STARDUSTLC666/dsh-suite/pulls).

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

## Requirements and configuration

Enable only the suite bundle in the profile; it loads the components. Each component still has its own account, executable and network requirements.

This version pins minimal PTC 0.5.6, fixing missing tool SDK declarations in the model prompt and following official DSH 0.2.1-alpha.5 execution-format guidance. See [this validation record](docs/validation-2026-10-17-alpha5.md) for the 18-component regressions, compatibility, actual PTC execution and Security/PPT browser interactions. Code Security 0.4.1 features remain documented in the [security record](docs/validation-2026-10-15-security.md).

Detailed configuration, tool arguments and troubleshooting are in the [usage guide](docs/USAGE.en.md). For standalone development, follow the Node requirement in [package.json](package.json).

## Documentation

- [Usage and troubleshooting](docs/USAGE.en.md)
- [Changelog](CHANGELOG.md)
- [Validation scope and history](docs/VALIDATION.md)
- [Report a problem or suggest a feature](https://github.com/STARDUSTLC666/dsh-suite/issues)

## License

[MIT](LICENSE)
