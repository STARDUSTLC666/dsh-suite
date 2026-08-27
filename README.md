[English](README.en.md)

# dsh-suite

> **STARDUSTLC 插件全家桶**：一条命令，装入 18 个 DSH 插件。

![license](https://img.shields.io/npm/l/dsh-suite) ![stars](https://img.shields.io/github/stars/STARDUSTLC666/dsh-suite?style=social)

把办公流、媒体工坊、DevOps、记忆（做梦）四条产品线一次装进你的 DeepSeek Harness。组合补丁中每行的默认配置与组件自带 `cordis.patch.yml` 完全一致，装完即可按需覆盖。

## 兼容性

在 `@deepseek-ai/dsh@0.1.1-rc.2` 上验证（2026-08-27）：18 个组件同载真实启动，HTTP 200，零报错。

## 安装

```bash
dsh plugin --profile web add github:STARDUSTLC666/dsh-suite
```

安装后重启 Web 服务。想单独装某个组件时，直接装对应仓库即可（如 `github:STARDUSTLC666/dsh-rss`）。

## 卸载

```bash
dsh plugin --profile web remove dsh-suite
```

## 桶内 18 件

| 产品线 | 组件 | 能力 |
| :-- | :-- | :-- |
| 📨 办公流 | dsh-email | IMAP/SMTP 收发/搜索/附件，八大服务商预设，发信审批门 |
| | dsh-calendar | CalDAV 日程查建改删搜（Google/iCloud/Nextcloud） |
| | dsh-rss | RSS/Atom 订阅 + 跨订阅搜索 + 增量抓取 |
| | dsh-cite | Crossref 文献检索 + 四种引文格式 + BibTeX |
| | dsh-dream | 会话回放 → 反思 → 梦境日记 → 桥接 AGENTS.md（含隐私脱敏） |
| 🎬 媒体工坊 | dsh-ffmpeg | 探测/剪辑/拼接/转码/字幕/批量抽帧/GIF |
| | dsh-voice | edge-tts 合成 + ASR 转写 + 音色试听 |
| | dsh-ppt | 一句话生成 HTML 放映 + PPTX 导出 |
| | dsh-hyperframes | HyperFrames by HeyGen 视频五件套技能 |
| | dsh-remotion | Remotion React 编程式视频技能 |
| 🔧 DevOps | dsh-docker | 容器五工具 + exec 审批门（@stardustlc/dsh-docker） |
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
