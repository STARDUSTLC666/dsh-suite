# Suite 0.2.12: RSS subscription panel

Suite 0.2.12 pins `dsh-rss@0.5.0` in the manifest and frozen lockfile. The other 17 component pins and both loader patches retain their 0.2.11 versions. RSS has published integrity `sha512-ow7Y/lQKjzl1+FSYPakeYQneb1rk2oo9XLAER2Qe00M55JEOSB8A9ugURowdxELFQX4VeXSxQ9pwNRDBwAjliw==`.

Settings → RSS subscriptions adds, edits and removes subscriptions, searches and filters categories, checks availability and imports/exports OPML. It shares the original settings and subscription list with the conversation tools. The panel follows the host's Chinese/English locale and light/dark theme. Existing subscriptions require no migration.

OPML import previews new, duplicate and invalid entries before saving. Existing names and categories are preserved by default; opting into updates shows the before/after values. A stale preview is rejected without losing its text. Removal confirms the exact subscription. New URLs must pass the existing network checks; editing metadata for the same URL works offline.

RSS fixes three reproduced regressions: truncated XML being partially imported, invalid or credential-bearing URLs being accepted, and concurrent additions losing a subscription. Panel routes also validate same-origin JSON requests, revision conflicts, size limits, failed settings writes and disconnected clients. Windows / Node 24.16.0 passes 94 tests, including 13 regression and HTTP tests exercised again from a freshly installed release package. The npm tarball is checked against the tested package's SHA512 integrity.

Browser acceptance uses the official-source Harness 0.2.0-rc.2, commit `639ed01539`, in an isolated, keyless Windows profile with synthetic localhost feeds. Actual clicks and keyboard input cover add/edit/remove, failed-add input preservation, search/category filters, feed checks, malformed OPML, import preview and confirmation, duplicate preservation/update, two-page conflicts, Tab/Enter/Escape, locale/theme changes and persistence after a host restart. Final browser logs contain no new errors. Export displays its download confirmation; the downloaded file location was not inspected.

Native desktop-window operation, file-picker selection and external production feeds were not exercised in this round. A 390px iframe fixture could load Harness, but the browser tool could not target its nested controls; narrow-screen RSS interaction remains blocked rather than passed. The paste import flow was tested. Web acceptance does not replace native desktop acceptance.

Suite release gates require its 11 manifest/lockfile/offline tests, frozen pnpm installation, the official-host contracts, final tarball inspection and an isolated official-CLI installation/startup. Startup checks verify all 18 transitive components, the complete tool/skill inventory, the minimal-PTC mount and Web authentication; they do not constitute human UI tests for all 18 plugins. Release reports are retained in the workspace validation directory.

The earlier [Email PR #18](validation-2026-10-02-email.md), [PPT](validation-2026-10-01-ppt.md), [Calendar/RSS](validation-2026-10-01-calendar-rss.md) and [Dream/Email/Slack](validation-2026-10-01.md) records retain their original scope.
