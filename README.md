[English](README.en.md)

# dsh-suite

> **STARDUSTLC 插件全家桶**：一条命令，装入 18 个 DSH 插件。

![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite) ![downloads](https://img.shields.io/npm/dm/@stardustlc/dsh-suite) ![license](https://img.shields.io/github/license/STARDUSTLC666/dsh-suite) ![stars](https://img.shields.io/github/stars/STARDUSTLC666/dsh-suite?style=social)

把办公流（含做梦记忆）、媒体工坊、DevOps、通知与预设五条产品线一次装进你的 DeepSeek Harness。本仓库提供组合补丁（18 行默认配置，与组件自带 `cordis.patch.yml` 一致）；组件本身经上方一条命令直装。

## 兼容性

在 `@deepseek-ai/dsh@0.1.2-alpha.2` 上验证（2026-08-31）：18 个组件同载真实启动，token 鉴权正常，零报错（含适配 PTC 改名的 dsh-minimal-ptc 0.4.2）。

## 安装

套件本体可走 npm（预构建，免 build 授权）：

```bash
dsh plugin --profile web add @stardustlc/dsh-suite
```

一条命令（套件 + 18 个组件一起装，pnpm 不允许 git 子依赖，所以组件必须作为直接依赖）：

```bash
dsh plugin --profile web add github:STARDUSTLC666/dsh-suite github:STARDUSTLC666/dsh-calendar github:STARDUSTLC666/dsh-cite github:STARDUSTLC666/dsh-code-security github:STARDUSTLC666/dsh-codex-port github:STARDUSTLC666/dsh-dingtalk github:STARDUSTLC666/dsh-docker github:STARDUSTLC666/dsh-dream github:STARDUSTLC666/dsh-email github:STARDUSTLC666/dsh-ffmpeg github:STARDUSTLC666/dsh-flakefinder github:STARDUSTLC666/dsh-hyperframes github:STARDUSTLC666/dsh-minimal-ptc github:STARDUSTLC666/dsh-ppt github:STARDUSTLC666/dsh-remotion github:STARDUSTLC666/dsh-rss github:STARDUSTLC666/dsh-slack github:STARDUSTLC666/dsh-sql github:STARDUSTLC666/dsh-voice
```

安装后重启 Web 服务。只想装个别组件？直接装对应仓库即可（如 `github:STARDUSTLC666/dsh-rss`），不需要本套件。

## 卸载

```bash
dsh plugin --profile web remove @stardustlc/dsh-suite
```

## 桶内 18 件

| 产品线 | 组件 | 能力 |
| :-- | :-- | :-- |
| 📨 办公流 | dsh-email | IMAP/SMTP 十工具：收发/搜索/附件/增量新邮件监视/标记整理/回复转发，八大服务商预设，发信审批门 |
| | dsh-calendar | CalDAV 日程查建改删搜（Google/iCloud/Nextcloud） |
| | dsh-rss | RSS/Atom 订阅 + 跨订阅搜索 + 增量抓取 |
| | dsh-cite | Crossref 文献检索 + 四种引文格式 + BibTeX |
| | dsh-dream | 会话回放 → 反思 → 梦境日记 → 桥接 AGENTS.md（含隐私脱敏） |
| 🎬 媒体工坊 | dsh-ffmpeg | 探测/剪辑/拼接/转码/字幕/批量抽帧/GIF |
| | dsh-voice | edge-tts 合成 + ASR 转写 + 音色试听 |
| | dsh-ppt | 一句话生成 HTML 放映 + PPTX 导出 |
| | dsh-hyperframes | HyperFrames by HeyGen 官方视频技能（20 个上游技能） |
| | dsh-remotion | Remotion React 编程式视频技能 |
| 🔧 DevOps | dsh-docker | 容器七工具（含 health 自检）+ exec 审批门（@stardustlc/dsh-docker） |
| | dsh-sql | SQLite/MySQL/PostgreSQL + 只读保护 + 审批门 + 统计/CSV |
| | dsh-flakefinder | flaky 测试识别 + 隔离清单 |
| | dsh-code-security | 40+ 规则代码安全审查 + SARIF |
| | dsh-codex-port | Codex 官方插件一键移植为 DSH 技能 |
| 💬 通知 | dsh-dingtalk | 钉钉群机器人（加签） |
| | dsh-slack | Slack 双向消息（Socket Mode） |
| 🧠 预设 | dsh-minimal-ptc | 极简 PTC 模式 Agent 预设 |

全部组件自带 `*_health` 自检工具——装完先跑一遍 health，心里有底。

## 配置

在 profile 的 `cordis.patch.yml` 里按组件 id 覆盖即可，例如：

```yaml
- id: sql
  config:
    maxRows: 500
- id: slack
  config:
    token: ''   # 或走环境变量 DSH_SLACK_TOKEN
```

## 排错

- 启动失败：逐个运行组件的 `*_health` 定位；或临时在 profile 补丁里 `disabled: true` 关掉可疑组件；
- 依赖拉取慢：组件走 GitHub 源，网络不佳时配置代理后重试。

## 开发

```bash
pnpm install
pnpm test   # 5 个测试：组合补丁 YAML 合法性、18 条目完整性、id 唯一、依赖对应、文档齐备
```

## License

MIT（各组件许可证以各自仓库为准，均为 MIT）
