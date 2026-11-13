# Suite 0.11.5 / DSH 0.2.2-rc.3 适配记录

日期：2026-11-14。平台：Windows x64、Node 24.16.0。宿主：已安装的官方 DSH 桌面运行时 **0.2.2-rc.3**（`resources/app.asar/dsh`）。

本轮是**适配级复查**，不是完整的 Web 逐项操作验收；没有重新做浏览器点击、真实账号或真实模型验收。

## 变更

- 三个 ptc-minimal 预设副本（插件 patch、插件 preset 模板、Suite patch）同步 DSH 0.2.2 的委派配置：删除已下线的 `@deepseek-ai/dsh-tool-subagent-control/list-agents` 行，`tool-subagent` 改用 `modelSelection` / `modelDiscovery`，删除 0.2.1-alpha.1 起已移除的 `backgroundMode`，并按官方内置预设给 `tool-subagent-control` 设置 `interrupt: false`。
- `scripts/smoke-harness.mjs` 的定时工具断言改为官方 0.2.2 的 `schedule_create` / `schedule_list` / `schedule_view` / `schedule_edit`（`schedule_update`、`schedule_delete` 已移除）。
- 组件固定到本轮版本；最低 Harness 声明提升到 `>=0.2.2-rc.3`。

## 已核对

- 21 个自有包逐个对照 DSH 0.2.1-rc.4 → 0.2.2-rc.1 的 49 条升级指南：没有会让插件在 Windows / Web 上中断的破坏性变更；命中的面只有本文件的预设与定时工具断言，以及 PPT 渲染器版本门（见 dsh-ppt 的 0.20.6 记录）。
- 与 0.2.2-rc.3 运行时逐项核对：`dsh-tool-subagent` 的 Config 键为 `provider` / `toolName` / `modelSelection` / `modelDiscovery` / `agentOptions` / `agentPreset` / `allowedAgentPresets` / `maxDepth`；`dsh-tool-schedule` 只注册 create/list/view/edit；`dsh-tool-subagent-control/list-agents` 子路径已移除；预设引用的 `dsh-agent-tool-presentation`、`dsh-tool-executor-ptc`、`dsh-tool-office`、`dsh-terminal-bash`、`dsh-tool-pwsh-persistent`、`dsh-tool-ralph` 包均存在于 0.2.2-rc.3。
- 18 个组件的本地构建与离线测试：全部通过（Suite 自身测试另跑）。极简 PTC 预设的配置契约测试同步更新并通过。
- 已安装桌面 profile 的 18 个组件在 0.2.2-rc.3 上均为 active（`plugin_manager` 列表核对的旧版本基线）；`ppt_render` 用宿主内置 `@deepseek-ai/libreoffice-kit@0.2.3` 实际渲染 PNG + PDF 成功（3 页，收据可复核）。

## 未验证

- 没有在 0.2.2-rc.3 上重新做九个工作台的中英文、窄屏、浅深色逐项浏览器操作；该范围以 [2026-10-28 边界记录](validation-2026-10-28-boundaries.md) 为最后一次完整记录。
- 没有重新安装公开 npm 包做全新 profile 的官方 CLI 安装验收（本轮改动只涉及声明、预设与冒烟脚本）。
- Docker 引擎、真实 Slack / 钉钉账号、真实日历与模型未在本轮重新操作。
