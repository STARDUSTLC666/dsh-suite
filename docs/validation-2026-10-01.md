# 0.2.8 validation / 验收记录

## Host and component scope

Harness was built on Windows from the official `dsh-v0.2.0-rc.2` tag, commit `639ed01539`, using the frozen lockfile. The built CLI reports `0.2.0-rc.2`. Validation uses an isolated home on E: and excludes the user's service credentials.

All 18 components load together: 99 tools, 35 skills, TypeScript/Python PTC catalogs, 19 output-schema checks and two skill-registry loss/recovery checks pass. Health fixtures validate responses; they do not establish real external-service readiness.

The 18-component offline baseline passed 1,406 tests, with two default skips. Email's ten new regression tests bring the combined results from the component runs to 1,416 passes and two skips. Email 0.14.5 itself passes 295 tests. These are results from component runs, not a claim that every real service or native UI was exercised.

This release pins Dream 0.6.0, Email 0.14.5, HyperFrames 0.4.2 and Slack 0.3.3. The suite's nine manifest/lockfile tests and two offline-environment tests all pass. The outdated lockfile reproduced `ERR_PNPM_OUTDATED_LOCKFILE`; a regression now checks every component's declared version, resolved version and registry integrity. Frozen source installation passes with pnpm 11.7.0. Both npm installation and source installation use the same component pins.

The workspace's release-age exceptions name the 18 first-party components and three reviewed, exact versions from the new Slack SDK release (`@slack/socket-mode@3.1.0`, `@slack/types@3.2.0`, `@slack/web-api@8.2.0`). Component-name exclusions work in the tested pnpm 11.7 frozen installation; version-qualified exclusions rejected the newly published Dream and Email packages in that check. All other third-party dependencies retain the package manager's release-age policy, and all component versions remain exact manifest/lockfile pins.

The built official CLI also started an isolated profile with all 18 local components. Every expected tool and skill was present, both media skill health checks passed, and the minimal-PTC preset mounted into an actual agent with `run_code` as its model tool. The launch token exchanged for a cookie (303), the unauthenticated index returned 401 and the authenticated index returned HTML (200). The fixture process then closed. The host additionally supplies one Windows sandbox skill, giving 36 skills in that startup profile.

The release artifact is also gated on installation through the official CLI with all 18 components resolved from npm. That check compares registry tarball integrity, exact installed versions, the full tool/skill inventory, preset mounting and web authentication. Components must be transitive dependencies of the suite without duplicate direct profile layers.

The installation review also found an unmet peer: Socket Mode SDK 3.0.1 requires Undici 7, but the combined dependency graph selected Undici 8. Slack 0.3.3 requires the official SDK 3.1 or newer, which supports Undici 7/8, and explicitly declares the matching transport dependency. Its package acceptance fixture installs a host Undici 8 alongside the plugin and checks that the installed SDK supports and resolves that transport, constructs a Socket Mode client and exports the plugin entry. Both README languages ship in the npm artifact. This check does not connect to a real Slack workspace.

## Open feedback checked on 2026-10-01

Twenty active `STARDUSTLC666/dsh-*` repositories were checked through GitHub. Only Email had open issues or pull requests at the check time.

| Feedback | Evaluation and disposition |
| --- | --- |
| [Email #20](https://github.com/STARDUSTLC666/dsh-email/issues/20) | Reproduced. Fixed in 0.14.5: a named provider uses its own endpoints; card saves do not persist resolved default-card endpoints as shared settings. Explicit account endpoints, shared transport budgets and legacy inheritance remain supported. |
| [Email #16](https://github.com/STARDUSTLC666/dsh-email/issues/16) | The newer SettingsForms API is already supported. Registration is optional; current tests cover modern settings and startup. |
| [Email #17](https://github.com/STARDUSTLC666/dsh-email/issues/17) | Saved blank-host placeholders were already normalized in 0.14.2, including migration. Explicit custom ports and TLS choices are covered by regression tests. |
| [Email PR #18](https://github.com/STARDUSTLC666/dsh-email/pull/18) | Targets the older settings implementation. The released fix covers both old and modern paths, so this PR is not applied over the newer implementation. |
| [Email #19](https://github.com/STARDUSTLC666/dsh-email/issues/19) | Feature consultation. The explicit `sendApproval: false` option already exists. Recipient allow/deny lists need a separate policy covering multiple recipients, reply/forward behavior and host approval precedence. This maintenance release keeps existing approval behavior. |

No public comments were posted and no issues or contributor PRs were closed as part of this audit.

## Human operation and limits

Dream 0.6.0 was tested in the actual Harness web UI with isolated data: tabs, filtering, long-content expansion, source/conflict review forms, generated commands and rollback preservation. Light and dark themes were inspected at wide and narrow viewports. The installed native desktop's Dream settings page also renders.

Email's native Windows settings were exercised for adding a temporary card, Outlook/Gmail provider changes, automatic saving and deleting the temporary card. The original desktop configuration bytes were restored. These operations exposed the empty-address test and stale application-ID hint bugs; the final fixes have component behavior regressions but have not been retested in the native UI. A separate browser fixture was blocked by the browser's access policy and is not counted as successful UI verification.

Successful real Outlook authorization, mailbox login, sending, Slack/DingTalk delivery, CalDAV mutations and production media rendering were not verified. Native human-operation checks for every one of the 18 components remain a separate validation scope.
