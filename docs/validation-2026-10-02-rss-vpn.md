# Suite 0.2.13: RSS VPN compatibility

Suite 0.2.13 pins `dsh-rss@0.5.1`. The other 17 component pins and both loader patches retain their 0.2.12 versions. RSS's published tarball integrity is `sha512-nyIIAhm+c7DPAijcT9As5IbonN35IhcOKv2ItVXYS2seZ/JoAW96w4ShrYXht21iHzcZWe0J7vLWuRCBO9dnEw==`.

RSS now honors the enabled manual Windows proxy and resolves VPN Fake-IP answers through HTTPS DNS. Requests connect to validated public addresses while preserving the original Host and TLS verification. Each redirect is revalidated and request-owned connections are released. VPN settings are not modified; default private-network restrictions remain enabled.

RSS acceptance used Windows, Node 24.16.0 and official-source Harness `0.2.0-rc.2` (`639ed015397290b3745d163aafe02ffee4aa3f84`). The VPN remained enabled with the same process IDs and configuration hash throughout. All 106 plugin tests, 34 fresh-tarball regressions and GitHub CI passed. Production plugin calls, without DNS or fetch injection, passed check/add/fetch/search/persisted incremental deduplication for SSPAI, Python Insider, NASA and GitHub Atom. The legacy Python URL remained readable.

In the shared browser settings UI, all four real public feeds were added and showed the expected entry counts. Manual Atom checking passed. Private-address addition was blocked with input retained and the existing list intact. No console errors were recorded. No personal profile, keys or subscriptions were used for that acceptance; native desktop-window interaction remains separately unverified.

Suite frozen-lockfile, tests, contracts, npm artifact installation and official CLI startup are verified separately before publication. The earlier [RSS panel](validation-2026-10-02-rss.md), [Email PR #18](validation-2026-10-02-email.md), [PPT](validation-2026-10-01-ppt.md), [Calendar/RSS](validation-2026-10-01-calendar-rss.md) and [Dream/Email/Slack](validation-2026-10-01.md) records retain their original scope.
