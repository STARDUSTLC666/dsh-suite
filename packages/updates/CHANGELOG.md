# Changelog

## 0.2.9 (2026-11-20)

- Advance the host coordinator revision so a running 0.2.7/0.2.8 coordinator safely hands over to the cancellation fixes after active installation/check work settles. Preserve participants, client guards, recent outcome and pending restart state.
- Extend the existing migration regression to cover the immediately preceding host revision as well as older coordinators. Includes all 0.2.8 cancellation and response cleanup fixes.

## 0.2.8 (2026-11-20)

- Recheck cancellation after asynchronous idle checks and before entering native update or fallback removal/installation. If a fallback already removed the old version, cancellation still restores it.
- Observe already-started transport promises on pre-aborted operations so late transport failures cannot become unhandled rejections. Pre-aborted registry and changelog requests do not start a fetch.
- Cancel unread error responses before registry fallback or returning unavailable notes.
- Preserve public update controls, opt-in preferences, package allowlists, compatibility checks and recovery behavior. Six new regressions cover the cancellation and cleanup paths.
