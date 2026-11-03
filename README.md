# dsh-suite

[English](README.en.md)

![dsh-suite 鲸鱼娘插件封面](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

一次安装 18 个独立 DSH 插件，覆盖邮件、日历、记忆、媒体创作与开发运维，并组合它们的默认配置。各组件仍可单独安装；Review 与 Computer Use 另行提供。

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-total-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

[下载统计说明](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/README.md)

欢迎使用，遇到问题或有改进建议，请提交 [issues](https://github.com/STARDUSTLC666/dsh-suite/issues) 和 [PR](https://github.com/STARDUSTLC666/dsh-suite/pulls)。

0.9.1 为组合包和 18 个插件加入专门生成的鲸鱼娘图标，带独立功能符号与透明留白，显示在 DSH 原生列表与详情中。日历已包含空闲时段建议，见[使用说明](docs/calendar-availability-2026-10-30.md)。

## 功能

- 覆盖邮件、日历、记忆、媒体创作、开发运维与消息通知。
- 固定组件版本，便于复现安装与共同加载检查。
- 各组件也可以单独安装与配置。

## 包含哪些组件

| 产品线 | 组件（各自拥有独立仓库与版本） |
|---|---|
| 📨 办公流 | [邮件](https://github.com/STARDUSTLC666/dsh-email) · [日历](https://github.com/STARDUSTLC666/dsh-calendar) · [RSS](https://github.com/STARDUSTLC666/dsh-rss) · [文献库](https://github.com/STARDUSTLC666/dsh-cite) · [Dream 记忆](https://github.com/STARDUSTLC666/dsh-dream) |
| 🎬 媒体工坊 | [FFmpeg](https://github.com/STARDUSTLC666/dsh-ffmpeg) · [语音](https://github.com/STARDUSTLC666/dsh-voice) · [演示文稿](https://github.com/STARDUSTLC666/dsh-ppt) · [HyperFrames](https://github.com/STARDUSTLC666/dsh-hyperframes) · [Remotion](https://github.com/STARDUSTLC666/dsh-remotion) |
| 🔧 DevOps | [Docker](https://github.com/STARDUSTLC666/dsh-docker) · [SQL](https://github.com/STARDUSTLC666/dsh-sql) · [Flakefinder](https://github.com/STARDUSTLC666/dsh-flakefinder) · [代码安全](https://github.com/STARDUSTLC666/dsh-code-security) · [Codex 移植](https://github.com/STARDUSTLC666/dsh-codex-port) |
| 💬 通知与预设 | [钉钉](https://github.com/STARDUSTLC666/dsh-dingtalk) · [Slack](https://github.com/STARDUSTLC666/dsh-slack) · [极简 PTC](https://github.com/STARDUSTLC666/dsh-minimal-ptc) |

九个组件有原生主区工作台（日历、文献库、代码安全、Dream、邮件、HyperFrames、演示文稿、Remotion、RSS），其余在各自设置项或对话工具里使用。每个组件的能力、工具参数与自检见[使用说明 · 组件清单](docs/USAGE.md#组件清单)。

[@stardustlc/dsh-review](https://github.com/STARDUSTLC666/dsh-review)（Git 改动审阅）与 [deepseek-computer-use](https://github.com/STARDUSTLC666/deepseek-computer-use)（Windows 桌面操作）是配套插件，**不在**这 18 个组件里，需要单独安装。

## 安装

桌面版可在「插件」面板按包名 `@stardustlc/dsh-suite` 安装。已配置 dsh 命令时也可使用：

```bash
dsh plugin --profile desktop add @stardustlc/dsh-suite
```

网页版把命令中的 `desktop` 改为 `web`。安装后重启 DSH。

## 开始使用

1. 把 @stardustlc/dsh-suite 安装到实际使用的 desktop 或 web profile，完成后重启该 profile。
2. 在插件管理中检查 Suite 与组件加载情况；本包包含 18 个组件，Review 与 Computer Use 另外安装。
3. 只配置要使用的组件：邮件和日历需要自己的账号，媒体工具需要对应本机环境。
4. 从左侧栏工作台或对话工具开始一个具体任务，按各组件说明核对实际结果。
5. 在组件页面底部检查更新；Suite 安装的组件通过整包更新，是否安装及何时重启由你决定。

## 依赖与配置

profile 只启用 Suite 这一层，由它加载组件。组件的账号、外部程序与网络要求仍各自适用。

本版同步全部 18 个组件的独立更新入口。九个原生工作台保留中英文、深浅色、窄屏和未保存保护；其余组件在自己的设置项中提供更新操作。独立插件仍可分别安装。

同时包含 PPT 0.20.0，在演示文稿工作台按需要下载「分享成品包」或「完整工程包」。分享包附当前讲稿，工程包保留 JSON；下载无需 AI 预审。功能版本升级由用户确认，自动安装默认关闭。

需要官方 DSH **0.2.1-rc.3 或更新版本**；本轮在 **0.2.1-rc.4** 复查。设计与维护见[工作台说明](docs/WORKBENCH_UI.md)，实际操作边界见[本轮验收](docs/validation-2026-10-28-boundaries.md)。Review 与 Computer Use 继续作为独立插件提供，不计入本包的 18 个组件。

### 兼容性与混合安装

- 需要官方 DSH 0.2.1-rc.3 或更新版本。宿主更旧时组件仍会加载，但页面底部的更新入口不会出现——先升级 DSH，再回到插件详情页查看。
- Suite 锁定组件版本，整包一起更新：在任一组件页面底部操作的都是 Suite 整包。
- 组件也可以独立安装并单独更新。但不要同时用两种方式安装同一个组件：profile 会出现重复的 loader 条目（`duplicate loader entry id`），处理见[迁移步骤](docs/USAGE.md#从旧版全家桶迁移)。
- 新版本与当前环境不匹配时（例如要求更新的 DSH 或 Node.js），页面底部会写明原因，并保留当前版本继续使用；升级环境后再检查即可。

详细配置、工具参数与排错见[使用说明](docs/USAGE.md)。从源码独立开发时，Node 要求以 [package.json](package.json) 为准。

## 插件更新

需要 DSH 0.2.1-rc.3 或更新版本。更新控件直接位于原有工作台内容末尾；没有工作台的插件，位于原生插件详情页底部。检查、更新记录和偏好在原地展开，不增加独立更新页面或设置菜单。自动检查默认开启；**自动安装默认关闭**，明确授权后才会在空闲且没有未保存修改时安装兼容的稳定补丁。开关按插件独立保存，可关闭、推迟或忽略提醒；不会强制重启 DSH、升级 DSH 本体或替换本地源码安装。Suite 组件在当前页面底部明确说明并操作 Suite 整包更新。

旧版用户需要先在官方插件管理中手动更新 Suite 一次，之后才会获得这些入口。

## 文档

- [使用与排错](docs/USAGE.md)
- [更新记录](CHANGELOG.md)
- [验证范围与历史记录](docs/VALIDATION.md)
- [问题反馈与功能建议](https://github.com/STARDUSTLC666/dsh-suite/issues)

## License

[MIT](LICENSE)
