# DSH 0.2.1-alpha.5 与 Suite 0.2.26 验证

2026-10-17，Windows / Node 24.16.0。使用官方 npm `@deepseek-ai/dsh@0.2.1-alpha.5`，对应[源码标签](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-alpha.5) `1517a4dbca0a2789ff1d41ba439600f8547d23fa`。alpha 是预览频道，核对时 npm 默认频道仍为 `0.2.0-rc.2`。

## 适配结果

官方这次调整了 PTC 的函数体/REPL 指引、技能菜单的插件变更刷新、终端查询、Page Up 布局，并增加模型选择器名称 Slot。现有 18 个组件没有使用新增 Slot 的旧接口；本轮发现并修复的是极简 PTC 的提示词组合问题。

旧版的固定完整身份句覆盖了宿主生成的工具 SDK：虽然工具注册和脚本执行成功，模型却看不到工具参数及返回值声明。PTC 0.5.6 保留极简身份，并通过宿主公开 Loader、工具清单和官方生成器动态生成 SDK，跟随当前作用域与执行模式。SDK 比纯一句话提示词更大，大小取决于启用的工具。

套件内复制的声明式 PTC 预设也同步引用新入口，避免独立安装已修好、组合安装仍覆盖 SDK。共同加载脚本增加了 SDK 必须存在、必须包含当前可见工具的检查。未修改其余 17 个组件实现。

## 已完成的检查

| 层次 | 结果与范围 |
| --- | --- |
| 全组件回归 | 18 个组件共 1,751 项通过，5 项跳过；跳过项为 3 项可选原生引擎单测、Dream 可选压力测试及 PTC 的 POSIX 执行测试。 |
| 契约与预检 | 全部 19 个包通过官方兼容预检；工具/技能注册、16 项健康结果、19 项输出和 2 项技能注册丢失恢复检查通过。 |
| 共同加载 | 18 插件、111 工具、36 技能；极简 PTC 挂载并只暴露 `run_code` 为模型入口；SDK 包含当前可见工具。网页鉴权与正常退出通过。 |
| PTC 回归 | 25 项 Windows 测试通过、1 项平台跳过；Windows/Linux × Node 22/24 CI 通过。 |
| 默认 PTC | 真实桥接执行 TypeScript 类型标注、嵌套工具、打印和返回值，得到 42；下一次执行不保留局部变量。 |
| 持久 PTC | 真实桥接得到 41 → 42，其他 owner 隔离，释放后清空；官方 SDK 使用当前执行格式的文案。 |
| 旧版宿主 | alpha.4 的默认和持久 PTC 复测通过；使用该宿主自己的 SDK 生成器。 |
| 独立安装 | 本地发布包和公开 npm 的 PTC 0.5.6 均经官方 CLI 全新安装，并分别完成两种执行模式的实际桥接。公开文件摘要及字节与发布 CI 产物一致。 |
| 浏览器 | 安全工作台 14 项、PPT 21 项操作通过，页面/控制台错误为 0；检查中英文、空态/失败、取消/复查/导出、复制/删除/撤销和 390px 布局。 |
| 模式与技能入口 | 实际模式菜单可选极简 PTC；在已有输入框的 `/` 菜单能找到 `dsh-ppt` 技能。 |

安全工作台还在真实宿主中完成了三个 Windows 引擎的调用和自动检查事件重放；OSV 使用合成漏洞库，验证接线与界面，不代表完整公共漏洞审计。

## PR / Issues

核对时无开放 PR，仍是 RSS #2、HyperFrames #2、Email #19 三条历史反馈，没有新反馈。RSS 的修复已包含在 0.6.2；本轮不把 Windows 未自然复现当作原 Linux 故障已复现。HyperFrames 的官方 CLI 安装正常，第三方市场启动器缺失路径的问题仍需其自身修正。Email 的收件人规则已具备，咨询状态保留。

## 证据边界

浏览器为隔离、无密钥的官方 Web profile，使用合成项目；没有 Browser 插件，使用 headless 系统 Chrome 与 Playwright。SDK/桥接执行与模型自主选择工具分别记录，本轮没有调用真实模型。PTC 执行使用合成会话的 Full 模式，没有改变用户权限；默认 Windows 沙箱与全部账号业务未重测。

本轮没有操作原生桌面窗口，也没有将两个工作台的交互检查写成每个插件的完整业务验收。原始测试、公开安装、CI 与最终发布包结果分别核对。

技能菜单已验证列表入口和技能显示；同一已保存会话中的启停刷新未完成端到端验收。本机 Desktop 的 PTC 链接到新版源码，Web profile 的旧 0.5.4 已通过官方 CLI 更新到 0.5.6，其他依赖和 profile 设置保持不变。

The upgrade check covers all component regressions and package preflight, joint loading, actual PTC execution, standalone registry installation, and Security/PPT browser interactions. It does not claim native Desktop or live-model acceptance.
