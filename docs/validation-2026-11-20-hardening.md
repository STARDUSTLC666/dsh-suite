# 2026-11-20 stability and compatibility verification

Suite 0.13.3 pins the 17 updated non-PPT components to the same exact npm versions delivered as standalone packages. PPT remains at 0.29.1 and was excluded from source changes, builds and runtime imports for this release.

The baseline was the latest published version of every package, fetched from its default branch and cross-checked against the official npm registry. Changes were made in isolated worktrees; unrelated ongoing work in older checkouts was preserved.

## Regression and integration checks

Each changed component completed its existing local build and tests, regression checks and npm pack inspection. Reproduced defects include credential leaks through mail/notification diagnostics, rotating OAuth refresh tokens shared by calendar collections, JSONL records swallowed after an interrupted final line, scan targets traversing outside the workspace, private voice-upload cache reuse across credentials, cancelled operations starting processes or messages, and test-process failures hidden by a passing report.

Official DSH 0.2.2-rc.3 rejected unsupported parameter schema keywords in Voice and Review. Both were fixed while retaining runtime range validation. In the official tool/skill registries, all 17 non-PPT Suite components jointly registered 110 tools and 34 skills; 16 health calls, 18 output checks, skill removal/restoration and both TypeScript/Python PTC SDK renderers passed. Adding the standalone Review plugin produced 121 tools, 17 health calls and 19 output checks.

A separate real Cordis fiber lifecycle check activated nine components using only their available official services: 44 tools and 35 skills. Duplicate-registration guards, removal of plugin fibers and return of both registries to zero passed. Generated TypeScript and Python SDK code passed syntax checks. The broader 17/18-component worker uses its existing controlled fixtures for settings, appReady and subprocess; it does not claim a complete interactive profile launch.

Shared updates 0.2.9 passed 62 tests on each Windows/Linux × Node 22/24 matrix. Independent migration checks verified that old coordinators wait for active work and inherit participant references, dirty/busy client guards, history, update outcome and pending restart state. Preferences, compatibility checks, package allowlists and recovery semantics remain intact.

## Limits

These checks do not assert real external mailbox, calendar provider, database, paid speech, message delivery, desktop automation or browser layout acceptance. Computer-use was built and verified with its safe contract suite; real input/audio integration was not run. Calendar rotating tokens retain the existing in-memory cache contract; cross-process/restart persistence was not added. No new confirmed P0 was established; severity labels are based on demonstrated behavior rather than the number of changes.

Release workflows verify the tested source commit and tarball, publish through npm trusted publishing, and compare official registry integrity. GitHub Releases point to the tested commits. Installing or updating users' active DSH profiles is a separate action and was not performed by this maintenance release.
