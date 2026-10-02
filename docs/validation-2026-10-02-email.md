# Suite 0.2.11: Email PR #18

Suite 0.2.11 pins `dsh-email@0.14.6` in the manifest and frozen lockfile. All other component pins and both loader patches are unchanged from 0.2.10. The published Email tarball has integrity `sha512-7rqRkfeXU6+z7ha06inVc5mb9VSmEXWsLvL2sPooVlPwSe17zWq+aD9guoXYAfiCISkOFso4Qmajg6PPZEWJkg==`.

Email completes [PR #18](https://github.com/STARDUSTLC666/dsh-email/pull/18). Untouched saved form endpoints and partial drafts no longer erase explicit row IMAP/SMTP servers by projecting empty objects. The shared normalization already introduced in 0.14.2 remains in use: Outlook selects 587/STARTTLS, while explicit port/TLS settings without a placeholder host survive. The original contribution is retained in the merge history and [issue #17](https://github.com/STARDUSTLC666/dsh-email/issues/17) is closed.

On Windows / Node 24.16.0, Email passes 297 tests. Both new row-server preservation regressions failed before the fix and pass afterward. The final tarball passes a fresh installation, root-module import and six endpoint regressions. Email's PR and merged main commit pass GitHub CI.

The suite passes its 11 manifest, lockfile and offline-environment tests and a frozen pnpm 11.7.0 installation. The contract verifier uses the official-source Harness 0.2.0-rc.2, commit `639ed01539`, and registers all 18 components with 104 tools and 35 plugin skills. Email resolves as 0.14.6.

The release also requires final tarball inspection and an isolated official-CLI installation/startup check. These verify the dependency pins, single suite loader entry, tool/skill inventory, minimal-PTC mount and Web authentication. Installation and startup reports are retained in the workspace release directory.

This update does not add UI features or repeat native desktop operation, real mailbox login, OAuth2 authorization or SMTP delivery checks. The earlier [PPT](validation-2026-10-01-ppt.md), [Calendar/RSS](validation-2026-10-01-calendar-rss.md) and [Dream/Email/Slack](validation-2026-10-01.md) acceptance records retain their original scope.
