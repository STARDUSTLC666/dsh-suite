**简体中文** · [English](README.en.md)

# dsh-suite

> **DeepSeek Harness 生态插件组合包：一次安装 18 个官方插件，统一管理默认配置、工作台体验与版本升级。**

覆盖办公流、媒体工坊、研发运维与消息通知四大产品线，适配 DeepSeek Harness `>=0.2.2-rc.3`；所有组件均可在组合包内一键启用，也可按需单独安装。

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-total-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

**[包含组件](#包含哪些组件) · [核心特性](#核心特性) · [安装](#安装) · [开始使用](#开始使用) · [下载统计](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/README.md)**

![dsh-suite 鲸鱼娘插件封面](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

## 包含哪些组件

| 产品线 | 包含插件（各自拥有独立仓库与版本） |
| :--- | :--- |
| 📨 办公流 | [邮件](https://github.com/STARDUSTLC666/dsh-email) · [日历](https://github.com/STARDUSTLC666/dsh-calendar) · [RSS](https://github.com/STARDUSTLC666/dsh-rss) · [文献库](https://github.com/STARDUSTLC666/dsh-cite) · [Dream 记忆](https://github.com/STARDUSTLC666/dsh-dream) |
| 🎬 媒体工坊 | [FFmpeg](https://github.com/STARDUSTLC666/dsh-ffmpeg) · [语音](https://github.com/STARDUSTLC666/dsh-voice) · [演示文稿](https://github.com/STARDUSTLC666/dsh-ppt) · [HyperFrames](https://github.com/STARDUSTLC666/dsh-hyperframes) · [Remotion](https://github.com/STARDUSTLC666/dsh-remotion) |
| 🔧 DevOps | [Docker](https://github.com/STARDUSTLC666/dsh-docker) · [SQL](https://github.com/STARDUSTLC666/dsh-sql) · [Flakefinder](https://github.com/STARDUSTLC666/dsh-flakefinder) · [代码安全](https://github.com/STARDUSTLC666/dsh-code-security) · [Codex 移植](https://github.com/STARDUSTLC666/dsh-codex-port) |
| 💬 通知与预设 | [钉钉](https://github.com/STARDUSTLC666/dsh-dingtalk) · [Slack](https://github.com/STARDUSTLC666/dsh-slack) · [极简 PTC](https://github.com/STARDUSTLC666/dsh-minimal-ptc) |

- **10 个原生主区工作台**：日历、文献库、代码安全、Dream、邮件、HyperFrames、演示文稿、Remotion、RSS、语音；其余 8 个通过插件设置页与对话工具使用。
- **独立配套插件**：[@stardustlc/dsh-review](https://github.com/STARDUSTLC666/dsh-review)（Git 改动审阅）与 [deepseek-computer-use](https://github.com/STARDUSTLC666/deepseek-computer-use)（Windows 桌面操作）**不在**以上 18 个组件内，按需单独安装。
- 完整能力与参数速查见 [使用说明 · 组件清单](docs/USAGE.md#组件清单)；日历空闲时段建议见 [空闲时段指南](docs/calendar-availability-2026-10-30.md)。

## 核心特性

| 维度 | 组合包提供的统一体验 |
| :--- | :--- |
| **10 大原生工作台** | 9 大专属非换皮交互界面（叠卡审阅、航空信桌、引文星图、画报阅读、安全仪器台、导演台、灯箱排片桌等）+ Voice Studio，并支持一键切回经典列表/表单视图 |
| **统一视觉与引导** | 13 套明亮风格主题、8 套中英字体搭配、交互式 `? 引导`、中英文切换、窄屏适配与未保存保护 |
| **定制鲸鱼娘图标** | 0.9.1 起为组合包及 18 个组件配备独立功能符号与透明留白图标，清晰展示在 DSH 列表与详情页 |
| **版本锁定与热重载** | 固定 18 个组件兼容版本，补充双语元数据与 Cordis `ctx.effect` 热重载资源清理，便于复现安装与共同加载 |
| **按需分包交付** | 演示文稿工作台支持直接下载「分享成品包」（附讲稿）或「完整工程包」（含 JSON），下载无需 AI 预审 |

## 安装

桌面版可在 DSH「插件」面板按包名 `@stardustlc/dsh-suite` 安装；已配置命令行时也可执行：

```bash
dsh plugin --profile desktop add @stardustlc/dsh-suite
```

网页版将 `desktop` 改为 `web`；安装后重启对应 DSH profile。宿主要求官方 DSH **`>=0.2.2-rc.3`**。

## 开始使用

1. 在实际使用的 `desktop` 或 `web` profile 安装 `@stardustlc/dsh-suite`，完成后重启该 profile。
2. 在插件管理中确认 Suite 与 18 个组件已加载（Review 与 Computer Use 需另行安装）。
3. 仅配置自己会用到的组件：邮件与日历需连接账号，媒体类工具需准备对应本机运行环境。
4. 从左侧栏工作台或对话工具发起第一个任务，并按组件说明核对实际产出。
5. 在任意组件页面底部检查整包更新；支持热更新时原地重载，需重启时由你决定时机。

<a id="依赖与配置"></a>
## 依赖与兼容性

- **独立配置仍生效**：profile 只需启用 Suite，各组件所需的账号凭据、外部程序（如 FFmpeg、Docker）与网络环境仍各自适用。
- **DSH 版本要求**：需官方 DSH `0.2.2-rc.3` 或更新版本。旧版宿主虽可加载组件，但不会显示底部的更新入口——升级 DSH 后重新打开即可。
- **避免重复安装**：Suite 内的组件可单独安装，但**切勿同时通过 Suite 与独立包安装同一个组件**，否则会触发 `duplicate loader entry id`，处理方法见 [迁移步骤](docs/USAGE.md#从旧版全家桶迁移)。
- **环境不匹配保护**：若新版本要求更高的 DSH 或 Node.js，底部区域会说明原因并保留当前版本继续运行；源码开发的 Node 要求以 [package.json](package.json) 为准。
- **验证边界参考**：本轮 `0.2.2-rc.3` 适配级复查（加载、契约与离线测试）见 [rc3 验证记录](docs/validation-2026-11-14-rc3.md)，工作台设计与此前完整操作边界见 [工作台说明](docs/WORKBENCH_UI.md) 与 [2026-10-28 验收](docs/validation-2026-10-28-boundaries.md)。

## 插件更新

- **统一入口**：工作台底部（无工作台插件在原生插件详情页底部）原地展开版本检查、更新日志与偏好；任意组件底部操作均作用于整个 Suite。
- **安全默认策略**：自动检查默认开启（每 6 小时最多一次），**自动安装默认关闭**；仅在显式开启且空闲、无未保存修改时热更新兼容稳定版（含小版本与补丁，不跨主版本）。
- **原地热重载**：对话页右下角提供一键热更新卡片，加载失败自动回滚，不强制重启宿主；本地源码安装不受影响。
- **旧版迁移**：旧版 Suite 用户需先在官方插件管理中手动更新一次 Suite，之后即可获得内置更新入口。

## 文档与反馈

- [使用说明与排错](docs/USAGE.md) · [工作台设计](docs/WORKBENCH_UI.md) · [更新记录](CHANGELOG.md) · [验证范围与历史](docs/VALIDATION.md)
- 欢迎通过 [Issues](https://github.com/STARDUSTLC666/dsh-suite/issues) 反馈问题或建议。

## License

[MIT](LICENSE)
