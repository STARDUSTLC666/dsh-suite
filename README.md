[English](README.en.md)

# dsh-suite

> **STARDUSTLC 插件全家桶**：一条命令，装入 18 个 DSH 插件。

![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite) ![downloads](https://img.shields.io/npm/dm/@stardustlc/dsh-suite) ![license](https://img.shields.io/github/license/STARDUSTLC666/dsh-suite) ![stars](https://img.shields.io/github/stars/STARDUSTLC666/dsh-suite?style=social)

把办公流（含做梦记忆）、媒体工坊、DevOps、通知与预设五条产品线一次装进你的 DeepSeek Harness。本仓库提供组合补丁（18 行默认配置，与组件自带 `cordis.patch.yml` 一致）；组件本身经上方一条命令直装。

## 兼容性

已在 `@deepseek-ai/dsh@0.1.3-alpha.1`（2026-09-05）验证：18 个组件同载，96 个工具、34 个技能；工具参数与输出符合官方 JSON Schema 子集，TypeScript / Python PTC SDK 均可生成。隔离 Web 启动与 token 鉴权也已通过。下方脚本可对本地源码重复验收。

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
| 🎬 媒体工坊 | dsh-ffmpeg | 探测/剪辑/拼接/转码/字幕/抽帧/GIF/调整（变速·音量·静音·旋转）十工具 |
| | dsh-voice | edge-tts 合成 + ASR 转写 + 音色试听 |
| | dsh-ppt | 一句话生成 HTML 放映 + PPTX 导出：7 页型（金句/表格）+ 演讲者备注 |
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

16 个组件提供 `*_health` 自检工具；PPT 可先运行只读的 `ppt_themes`，minimal-ptc 则检查预设是否出现在选择器中。部分 health 会访问外部服务或调用本地 CLI。

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
pnpm test   # 套件清单、文档和离线执行环境的测试
```

本地 18 个组件仓库应与 `dsh-suite` 放在同一个父目录，组件开发依赖与 Harness 构建产物需预先就绪。验证器从 `cordis.patch.yml` 自动发现组件，通过本地 TypeScript 编译器重建，再运行各组件 `test/` 下的单元测试；不执行安装命令。

```bash
node scripts/verify-local.mjs --harness-root C:/path/to/deepseek-harness --report ../.harness-validation/offline-report.json
node scripts/verify-local.mjs --harness-root C:/path/to/deepseek-harness --contracts-only --json
node scripts/smoke-harness.mjs --harness-root C:/path/to/deepseek-harness --contract-report ../.harness-validation/offline-report.json --report ../.harness-validation/smoke-report.json
```

`--workspace-root` 可指定组件父目录；`--report` 保存 JSON，`--json` 让标准输出只包含 JSON。任何构建、测试或契约失败均返回非零退出码。`--contracts-only` 跳过重建与单元测试，检查当前 `lib/` 产物。

契约检查使用指定 Harness 的真实 `ToolRuntime` 和 `SkillRegistry`：逐个校验服务注入声明、全部工具参数与输出 schema、技能注册和重名冲突，生成两种 PTC SDK，再通过宿主执行链运行 16 个 health 与 `ppt_themes` 输出样例。minimal-ptc 会物化到隔离目录，并校验预设引用的 Harness 模块可解析。这里只覆盖这些只读样例的返回值；发信、合成、渲染等业务流程由组件测试中的模拟依赖验证。

HyperFrames 与 Remotion 另有真实注册表回归：卸载一个已注册技能，确认 health 报告异常，再恢复相同注册并确认 health 恢复正常。启动验收也会执行这两个 health，要求全部随包技能实际生效。

子进程只继承启动所需环境变量，HOME / DSH_HOME / CODEX_HOME 与临时目录位于工作区 `.harness-validation/`。测试入口预加载 Node 网络拦截器，允许 loopback 模拟服务器，拒绝外部 fetch / TCP / UDP；它用于防止可信测试意外联网，不是操作系统沙箱。`integration` / `live` / `e2e` 测试默认排除并在报告列出，语音真实合成须在对应仓库显式运行 `pnpm test:integration`。契约中的 Crossref 和版本探测使用固定模拟响应，health 的 `fixtureOk` 仅表示模拟配置结果，不代表真实外部服务状态。

验收目录和报告会保留以供复核；`smoke-harness.mjs` 负责真实 CLI、全插件同载、Web HTTP 与鉴权检查，并按 `--contract-report` 逐项核对工具与技能目录。可加 `--extra-plugin C:/path/to/modlens` 验证额外安装的 Modlens。开发脚本在源码仓库中使用，不随组合补丁的 npm 包分发。

## License

MIT（各组件许可证以各自仓库为准，均为 MIT）
