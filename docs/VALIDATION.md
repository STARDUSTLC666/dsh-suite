# dsh-suite 验证记录

本页整理原 README 的历史验证说明，保留当时的版本、日期与范围。自动测试、启动检查、浏览器操作和真实服务验收分别记录，不能相互替代。更详细的版本验收文件仍保留在仓库中。

## 原中文记录

验证宿主：官方发布标签源码构建的 Harness `0.2.0-rc.2`（commit `639ed01539`）+ Windows / Node `24.16.0`。18 个组件共同加载，注册 104 个工具、35 个插件技能，工具 schema 与健康检查契约通过。套件另有 11 项清单、锁文件与离线环境测试。

0.2.14 同步下载量前三的独立组件：PPT 0.7.0 增加放映翻页、页码跳转、质量提示定位和直接下载；Calendar 0.9.4 更新网络依赖并验证代理请求；Email 0.14.7 更新邮件依赖、修复服务器摘要显示及空 IMAP 响应。测试、浏览器操作与真实服务的边界见 [本批验收记录](validation-2026-10-02-top-downloads.md)。钉钉本次保持原版本。

此前的 [RSS VPN](validation-2026-10-02-rss-vpn.md)、[订阅面板](validation-2026-10-02-rss.md)、[Email PR #18](validation-2026-10-02-email.md)、[PPT 放映与渲染](validation-2026-10-01-ppt.md)、[Calendar/RSS](validation-2026-10-01-calendar-rss.md) 和 [Dream/Email/Slack](validation-2026-10-01.md) 验收记录继续保留原有范围。

## Original English record

Validation host: Harness `0.2.0-rc.2` built from its official release tag (commit `639ed01539`), Windows and Node `24.16.0`. All 18 components mount together with 104 tools and 35 plugin skills; tool schemas and health contracts pass. The suite also has 11 manifest, lockfile and offline-environment tests.

Version 0.2.14 pins the three most downloaded independent components: PPT 0.7.0 adds slideshow navigation, page-number input, issue links and direct downloads; Calendar 0.9.4 updates its network dependency and verifies proxy requests; Email 0.14.7 refreshes mail dependencies and fixes effective-server display and empty IMAP responses. See the [batch acceptance record](validation-2026-10-02-top-downloads.md) for test, browser and production-service boundaries. DingTalk retains its existing version.

Earlier [RSS VPN](validation-2026-10-02-rss-vpn.md), [subscription panel](validation-2026-10-02-rss.md), [Email PR #18](validation-2026-10-02-email.md), [PPT slideshow/rendering](validation-2026-10-01-ppt.md), [Calendar/RSS](validation-2026-10-01-calendar-rss.md) and [Dream/Email/Slack](validation-2026-10-01.md) records retain their original scope.
