# 0.2.10 validation / 验收记录

## Changes

The suite pins `dsh-ppt@0.6.0` in its manifest and frozen lockfile. Its other 17 component pins remain unchanged from 0.2.9.

PPT adds image, image-left, image-right and chart layouts to its seven existing layouts. Local PNG/JPEG assets are embedded for offline use. Column, bar, line and pie charts export as native editable PowerPoint charts with their data. Individual slides can be edited and undone without replacing the rest of the deck. Stable slide IDs, revision checks, bounded history and transactional output protect concurrent edits and failed writes.

Weekly reports, thesis defenses, project reports and pitches have scenario outlines with a shared brand, logo and footer. Unfilled outline slots are explicitly draft content. The agent supplies the actual material; the plugin creates HTML, PPTX and an editable deck record. A static quality report gives page-specific warnings for missing content, image resolution, density, contrast and overflow. It does not certify visual acceptance.

The seven tools are `ppt_themes`, `ppt_templates`, `ppt_create`, `ppt_edit`, `ppt_undo`, `ppt_check` and `ppt_render`. Rendering lazily loads the optional official `@deepseek-ai/libreoffice-kit@0.1.3`. Without it, normal generation still works and the render tool returns an installation hint. The plugin and Office Kit PPTX dependency are MIT; LibreOffice Kit and its engine have their own MPL-2.0 license and notices.

## Windows and artifact validation

PPT passes 100 tests, including 14 renderer regression cases. A fresh installation of the final npm tarball loads all seven tools and its skill, generates an editable chart and handles an absent renderer. This ordinary consumer installs three packages and does not install the optional engine. Package inspection verifies the tested lib and skill scripts are shipped and excludes temporary artifacts and account configuration.

The final 11-slide sample covers the existing text/table layouts, all three new image layouts and all four chart types, with Chinese text, branding and speaker notes. Windows PowerPoint opens it read-only, exports every slide and exposes the native chart series and values. The official LibreOffice Kit native backend also exports 11 PNG pages and an 11-page PDF, with no reported missing fonts. Each PDF page contains selectable text. Every rendered sample page was visually inspected, with independent review of the LibreOffice output.

An additional five-theme matrix renders three pages per theme, checks the PDF text and visually reviews all 15 pages. These Windows defaults report no missing fonts after the CSS-stack/PPTX-font separation and explicit East Asian font fixes. A deliberately unavailable custom font produces a missing-font warning and is retained as a negative case.

Browser acceptance exercises image/chart display, the accessible chart data table, slide selection from the overview, notes, the result of a page edit and restoration after undo. Overview checks cover 1280px and narrow 411px widths. The overview overlap discovered during acceptance was repaired.

Rendering records the source PPTX SHA-256 and the hashes of the PNG/PDF outputs. `ppt_check` rejects an outdated or altered receipt. A current receipt confirms rendering of those bytes; its visual status remains `not-verified` until a human or agent actually reviews the pages. Missing-font guidance asks for replacement, regeneration and renewed inspection. Rendering never resaves the source PPTX.

## Host and release gates

Official-source Harness `0.2.0-rc.2`, commit `639ed01539`, registers all 18 components with 104 plugin tools and 35 plugin skills. The full schema and health contracts pass. PPT compiles union input definitions into the host-supported `oneOf` form; the original array-valued `type` would fail host startup.

The release is gated on the suite's 11 manifest, lockfile and offline-environment tests and official-CLI installation with all 18 components resolved from npm. Installation checks exact dependency versions and tarball integrity, the single suite profile layer, the complete tool/skill inventory, minimal-PTC mounting and Web authentication. The runtime has 36 skills because it also includes one host skill. GitHub CI runs the suite checks on Node 22 and 24.

## Limits

The Windows native backends and generated artifacts described above were exercised. Linux/macOS native rendering, Electron startup and all native desktop UI flows are separate acceptance scopes. CI on Ubuntu checks the package build and unit tests, rather than native office rendering. Browser presenter-popup controls were not independently accepted in this round.

The existing user profile, credentials and foreground windows are preserved. Other plugins' production external services were not retested during this PPT release. Previous desktop and live-service limits remain documented in the earlier validation records.
