# dsh-suite 验证记录

[0.2.34 / PPT 0.15.0](validation-2026-10-23-ppt-data.md)：数字溯源与现场推演、来源更新确认、离线参数回存及最终 PPTX 检查。

[0.2.33 / PPT 0.14.0](validation-2026-10-22-ppt.md)：可选 AI 预审与模拟答辩、18 组件共同加载、公开依赖与原生模拟模型的验收边界。

本页整理原 README 的历史验证说明，保留当时的版本、日期与范围。自动测试、启动检查、浏览器操作和真实服务验收分别记录，不能相互替代。更详细的版本验收文件仍保留在仓库中。

## DSH 0.2.1-rc.1 复查（2026-10-17）

对现有已发布组件复查官方 rc.1。与 alpha.5 的完整源码差异只包含版本号更新；没有为宿主版本号变化给独立插件增加空版本。公开安装、预设执行、浏览器操作及未测试范围见 [rc.1 记录](validation-2026-10-17-rc1.md)。

## 0.2.27（2026-10-17）

同步日历、邮件及 RSS 的实际操作修复，并补齐 15 个插件在官方 DSH 0.2.1-alpha.5 的基础交互记录；同一已保存会话内的技能启停无需刷新页面。浏览器、合成工具选择、本机 CalDAV/SMTP、真实账号与原生桌面的不同范围见 [逐插件记录](validation-2026-10-17-human.md)。

## 0.2.26（2026-10-17）

核对官方 DSH 0.2.1-alpha.5，修复极简 PTC 的模型提示词丢失工具 SDK，并同步独立组件与组合预设。18 个组件 1,751 项测试通过、5 项跳过；共同加载新增 SDK 可见性检查。真实执行、公开安装及浏览器操作的范围见 [本次记录](validation-2026-10-17-alpha5.md)。

## 0.2.25（2026-10-15）

Code Security 0.4.1 的发布与工作台验收见 [安全记录](validation-2026-10-15-security.md)。追加核对官方 DSH 0.2.1-alpha.4：公开 npm 全新安装后，18 插件、111 工具、36 技能和极简 PTC 预设通过；官方兼容性预检覆盖全部 19 个包，并验证不兼容的组件或组合包会被拒绝。安全 14 项、PPT 21 项浏览器操作通过，原生桌面与真实模型未在本轮重测。详见 [alpha.4 记录](validation-2026-10-15-alpha4.md)。

## 0.2.24（2026-10-15）

官方 DSH 0.2.1-alpha.3 下共同加载 18 个插件、111 个工具和 36 个技能；极简 PTC 新旧宿主兼容、PPT 中英文与窄屏操作、最终 PPTX 渲染，以及 FFmpeg/RSS 真实功能检查见 [本次记录](validation-2026-10-15.md)。

## 0.2.22（2026-10-08）

同步邮件会话附件修复，实际预览下载与本机 SMTP 收到的附件一致；中英文确认边界说明经过可见操作核对。详见[继续复查记录](validation-2026-10-08-followup.md)。

## 0.2.21（2026-10-05）

17 个插件完成源码审查，16 个组件改进；Windows 测试、官方 RC2 / alpha 加载、可见操作及真实服务的不同范围见[逐插件记录](validation-2026-10-05-audit.md)。钉钉暂缓，原生桌面未操作。

## 0.2.17（2026-10-04）

Dream 自动候选整理、浏览器采纳及新任务回用在官方 RC2 / alpha 宿主中通过；中英文开关、390px 窄窗、持久化预算与热重载已核对。脚本模型与原生桌面验收边界见[本次记录](validation-2026-10-04-dream-auto.md)。

## 0.2.16（2026-10-03）

七个组件的中文 / English 工作台与恢复引导已实际核对，原始内容保留；日期、来源与导航切换遗漏已修正。测试、共同加载、原生桌面和真实服务边界见[本次记录](validation-2026-10-03-language.md)。

## 0.2.15（2026-10-03）

同步七个已经独立验收的工作台组件，官方 RC2 / alpha 的共同加载及 SDK 检查通过。精确版本、可见浏览器操作、实际渲染、下载、原生桌面与真实账号服务的不同边界见[本次记录](validation-2026-10-03-workbenches.md)。语言支持仍随组件而异，没有宣称整套设置页完全双语化。

## 原中文记录

验证宿主：官方发布标签源码构建的 Harness `0.2.0-rc.2`（commit `639ed01539`）+ Windows / Node `24.16.0`。18 个组件共同加载，注册 104 个工具、35 个插件技能，工具 schema 与健康检查契约通过。套件另有 11 项清单、锁文件与离线环境测试。

0.2.14 同步下载量前三的独立组件：PPT 0.7.0 增加放映翻页、页码跳转、质量提示定位和直接下载；Calendar 0.9.4 更新网络依赖并验证代理请求；Email 0.14.7 更新邮件依赖、修复服务器摘要显示及空 IMAP 响应。测试、浏览器操作与真实服务的边界见 [本批验收记录](validation-2026-10-02-top-downloads.md)。钉钉本次保持原版本。

此前的 [RSS VPN](validation-2026-10-02-rss-vpn.md)、[订阅面板](validation-2026-10-02-rss.md)、[Email PR #18](validation-2026-10-02-email.md)、[PPT 放映与渲染](validation-2026-10-01-ppt.md)、[Calendar/RSS](validation-2026-10-01-calendar-rss.md) 和 [Dream/Email/Slack](validation-2026-10-01.md) 验收记录继续保留原有范围。

## Original English record

Validation host: Harness `0.2.0-rc.2` built from its official release tag (commit `639ed01539`), Windows and Node `24.16.0`. All 18 components mount together with 104 tools and 35 plugin skills; tool schemas and health contracts pass. The suite also has 11 manifest, lockfile and offline-environment tests.

Version 0.2.14 pins the three most downloaded independent components: PPT 0.7.0 adds slideshow navigation, page-number input, issue links and direct downloads; Calendar 0.9.4 updates its network dependency and verifies proxy requests; Email 0.14.7 refreshes mail dependencies and fixes effective-server display and empty IMAP responses. See the [batch acceptance record](validation-2026-10-02-top-downloads.md) for test, browser and production-service boundaries. DingTalk retains its existing version.

Earlier [RSS VPN](validation-2026-10-02-rss-vpn.md), [subscription panel](validation-2026-10-02-rss.md), [Email PR #18](validation-2026-10-02-email.md), [PPT slideshow/rendering](validation-2026-10-01-ppt.md), [Calendar/RSS](validation-2026-10-01-calendar-rss.md) and [Dream/Email/Slack](validation-2026-10-01.md) records retain their original scope.
