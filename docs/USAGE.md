# dsh-suite 使用说明

[返回简介](../README.md) · [更新记录](../CHANGELOG.md) · [验证记录](VALIDATION.md)

## 界面语言

在 DSH「设置 → 通用设置 → 语言」切换中文或 English。已保存的经验、草稿、订阅、日程和工程由两种界面共用，不会为切换语言复制或翻译用户资料。文件选择控件跟随 Windows / 浏览器语言，原始引擎诊断保留原文。Dream 由助手调用工具记录经验，不会后台持续学习；候选、采纳与规则应用是不同操作。

## 安装

安装套件会自动拉取已验证版本的 18 个组件；profile 只启用套件这一层，组件由套件统一加载：

```bash
dsh plugin --profile web add @stardustlc/dsh-suite
```

也可以从 GitHub 安装套件源码，组件仍从 npm 安装：

```bash
dsh plugin --profile web add github:STARDUSTLC666/dsh-suite
```

安装后重启 Web 服务。只想装个别组件？直接装对应仓库即可（如 `github:STARDUSTLC666/dsh-rss`），不需要本套件。

### 从旧版全家桶迁移

如果之前按旧命令把套件和全部组件一起直装，先执行上方命令升级套件到 0.1.3 或以上，再移除组件的直接安装记录。组件仍保留为套件依赖；这样可避免 `duplicate loader entry id` 启动错误：

```bash
dsh plugin --profile web remove @stardustlc/dsh-docker @stardustlc/dsh-dream dsh-calendar dsh-cite dsh-code-security dsh-codex-port dsh-dingtalk dsh-email dsh-ffmpeg dsh-flakefinder dsh-hyperframes dsh-minimal-ptc dsh-ppt dsh-remotion dsh-rss dsh-slack dsh-sql dsh-voice
```

保留自己 profile 的 `cordis.patch.yml` 配置覆盖，随后重启 Web 服务。

## 卸载

```bash
dsh plugin --profile web remove @stardustlc/dsh-suite
```

## 组件清单

| 产品线 | 组件 | 能力 |
| :-- | :-- | :-- |
| 📨 办公流 | dsh-email | IMAP/SMTP 与本地草稿，共 11 工具；可编辑草稿与附件预览、按账号的可信收件人策略、Outlook OAuth2 登录、中英双语多账号设置和发信审批 |
| | dsh-calendar | CalDAV 日程查建改删搜；月/周/议程面板与拖动改期；ICS 文件/文本导入预览、重复与冲突检查、连接和授权引导 |
| | dsh-rss | RSS/Atom 订阅 + 跨订阅搜索 + 增量抓取；中英双语订阅管理面板、分类筛选、可用性检查与 OPML 导入预览/导出 |
| | dsh-cite | 中英文文献库：DOI / BibTeX 批量导入、去重、显式 Crossref 补全、四种基本引文格式及原始来源备份 |
| | dsh-dream | 会话回放 → 来源核验 → 经验审阅 → 项目规则预览、写入与回滚（含隐私脱敏） |
| 🎬 媒体工坊 | dsh-ffmpeg | 探测/剪辑/拼接/转码/字幕/抽帧/GIF/调整（变速·音量·静音·旋转）十工具 |
| | dsh-voice | edge-tts 合成 + ASR 转写 + 音色试听 |
| | dsh-ppt | HTML 放映 + 可编辑 PPTX：11 页型（含图片与图表）、逐页编辑/撤销、质量报告、四种场景提纲、品牌配置与演讲者备注；可选官方 LibreOffice Kit 导出 PNG/PDF |
| | dsh-hyperframes | HyperFrames by HeyGen 的 21 个视频技能；中英文模板工作台、素材、Studio 预览、MP4 与源码下载 |
| | dsh-remotion | Remotion React 视频技能；中英文模板工作台、素材、Studio 预览、MP4 与源码下载 |
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
- 依赖拉取慢：优先使用上方 npm 安装命令；网络不佳时配置代理后重试。

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
node scripts/smoke-harness.mjs --harness-root C:/path/to/deepseek-harness --install-tarballs ../.harness-validation/tarballs.json --contract-report ../.harness-validation/offline-report.json --report ../.harness-validation/install-report.json
node scripts/smoke-harness.mjs --harness-root C:/path/to/deepseek-harness --install-tarballs ../.harness-validation/tarballs.json --registry-components --registry-suite --contract-report ../.harness-validation/offline-report.json --report ../.harness-validation/registry-report.json
```

`--workspace-root` 可指定组件父目录；`--report` 保存 JSON，`--json` 让标准输出只包含 JSON。任何构建、测试或契约失败均返回非零退出码。`--contracts-only` 跳过重建与单元测试，检查当前 `lib/` 产物。

发布前使用 `--install-tarballs` 验证真实安装：报告格式为 `{ "ok": true, "packages": [{ "name", "version", "tarball", "integrity" }] }`，须包含套件和 18 个组件，`integrity` 为 `sha512-...`。验证器只在临时 profile 中将指定版本映射到本地 tarball，经官方 CLI 安装套件，要求组件为传递依赖且不重复启用 profile 层，再检查实际启动、完整目录和 PTC 挂载。开发依赖可能访问 npm；这个安装模式不属于离线测试。

契约检查使用指定 Harness 的真实 `ToolRuntime` 和 `SkillRegistry`：逐个校验服务注入声明、全部工具参数与输出 schema、技能注册和重名冲突，生成两种 PTC SDK，再通过宿主执行链运行 16 个 health 与 `ppt_themes` 输出样例。旧宿主兼容测试会校验旧目录预设；0.1.7 启动验收检查声明式预设注册与模块解析，启动验收还会创建真实 agent 挂载预设，确认模型入口为 `run_code` 且保留插件工具与 Shell。这里只覆盖这些只读样例的返回值；发信、合成、渲染等业务流程由组件测试中的模拟依赖验证。

HyperFrames 与 Remotion 另有真实注册表回归：卸载一个已注册技能，确认 health 报告异常，再恢复相同注册并确认 health 恢复正常。启动验收也会执行这两个 health，要求全部随包技能实际生效。

子进程只继承启动所需环境变量，HOME / DSH_HOME / CODEX_HOME 与临时目录位于工作区 `.harness-validation/`。测试入口预加载 Node 网络拦截器，允许 loopback 模拟服务器，拒绝外部 fetch / TCP / UDP；它用于防止可信测试意外联网，不是操作系统沙箱。`integration` / `live` / `e2e` 测试默认排除并在报告列出，语音真实合成须在对应仓库显式运行 `pnpm test:integration`。契约中的 Crossref 和版本探测使用固定模拟响应，health 的 `fixtureOk` 仅表示模拟配置结果，不代表真实外部服务状态。

验收目录和报告会保留以供复核；`smoke-harness.mjs` 负责真实 CLI、全插件同载、Web HTTP 与鉴权检查，并按 `--contract-report` 逐项核对工具与技能目录。可加 `--extra-plugin C:/path/to/modlens` 验证额外安装的 Modlens。开发脚本在源码仓库中使用，不随组合补丁的 npm 包分发。

## License

MIT（各组件许可证以各自仓库为准，均为 MIT）。PPT 的可选 LibreOffice Kit 使用 MPL-2.0；启用或再分发该渲染器时请保留其许可证和第三方声明，详见 [PPT 的集成说明](https://github.com/STARDUSTLC666/dsh-ppt/blob/master/docs/LIBREOFFICE-INTEGRATION-2026-10-01.md)。
