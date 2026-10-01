# 0.2.9 validation / 验收记录

## Changes

Calendar 0.9.3 fixes three connection-form defects: switching from Google to a Basic-auth provider no longer inherits OAuth, environment credentials report their presence without exposing their values, and editing a connection draft clears the previous test result. RSS 0.4.3 preserves case-sensitive URL paths and query parameters during add, remove, OPML import and search while normalizing schemes, hosts and default ports.

The suite pins both versions in its manifest and frozen lockfile. The other 16 component pins remain unchanged from 0.2.8.

## Windows and host validation

Calendar passes 178 tests and RSS passes 81. Four new regression cases in each component reproduced failures before the fixes. Fresh tarball installation checks verify every shipped lib file against the tested source artifact and pass 32 Calendar backend tests and four RSS URL tests.

Official-source Harness 0.2.0-rc.2, commit `639ed01539`, mounts all 18 components. The full tool and skill contracts pass with 99 plugin tools and 35 plugin skills. The suite's 11 manifest, lockfile and offline-environment checks verify the component pins and registry integrity.

Calendar browser acceptance uses an isolated E: profile with synthetic credentials and a local CalDAV HTTP fixture. It exercises Google-to-iCloud provider switching, connection testing, saving, event editing, clearing an outdated test result, discarding an edited connection draft, and month/week/agenda views. Visual checks cover 1280px and 900px windows. The fixture records authenticated REPORT/PUT requests and verifies that the environment password is not persisted in the profile. This establishes the shared plugin interface and protocol workflow, rather than authentication against a production provider.

The release artifact is gated on official-CLI installation of the suite with all 18 components resolved from npm. This checks exact versions, tarball integrity, component loading, the full tool/skill inventory, minimal-PTC preset mounting and web authentication. The suite stays the single profile layer, avoiding duplicate direct component entries.

## Feedback and limits

The current audit covers 20 active dsh-* repositories. Open feedback remains in Email: issues #16, #17 and #20 are covered by existing releases; PR #18 conflicts with current code and its goal is already implemented. Issue #19 is a feature consultation about recipient policies, not a reported defect. This round does not merge the conflicting PR or post or close feedback.

RSS subscription management UI, Email recipient policies and Dream experience-review feedback are feature proposals and are not shipped in this release.

The earlier Email browser resource remains blocked and was not retested through another port or tool. This round does not establish production Google/iCloud, mail or Slack account success. Shared Web tests can support desktop plugin compatibility, but they do not establish Electron startup, native integration or all desktop UI flows. Native desktop acceptance remains separate.

A separate read-only desktop check after the user opened the app finds the main process and its backend running, with a loopback listening port and no new startup crash log. The desktop profile links all 18 current component sources, including Calendar 0.9.3 and RSS 0.4.3. These checks do not inspect the desktop's complete runtime tool inventory or exercise native UI flows, and do not alter the foreground window or account configuration.
