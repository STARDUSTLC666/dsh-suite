# 更新记录

[返回简介](README.md) · [使用说明](docs/USAGE.md) · [验证记录](docs/VALIDATION.md)

## 0.2.23 (2026-10-08)

- 同步 Email 0.16.2：Windows OAuth2 令牌使用当前用户 DPAPI 加密，有效旧数据原位迁移；加密不可用或数据损坏时保留原文件，提供中英文恢复提示。
- 其他组件保持已验证版本；Windows 原生加密及隔离网页账号交互见 [继续复查记录](docs/validation-2026-10-08-oauth2.md)。

## 0.2.22 (2026-10-08)

- 同步 Email 0.16.1：发信与草稿的相对附件使用当前会话工作区，避免误读启动目录同名文件；中英文说明区分可信跳过、禁止规则与 Full Access 确认边界。
- 仓库简介和双语 README 邀请使用者提交 issues 与 PR，其余组件功能版本保持。详见 [继续复查记录](docs/validation-2026-10-08-followup.md)。

## 0.2.21 (2026-10-05)

- 同步 16 个独立插件：成品 ZIP、禁止收件人、媒体工程可恢复归档、增量订阅不漏条目、技能迁移预览、精确容器参数与会话工作区解析。Dream 0.9.0 与钉钉 0.2.2 保持原版本。
- 修复取消、并发状态保存、真实日期、64 位整数和同名列；极简 PTC 按宿主能力启用定时工具。详见 [逐插件审查记录](docs/validation-2026-10-05-audit.md)。
- 真实界面操作补修日历悬浮按钮遮挡发送、浮层裁切，以及极简 PTC 定时服务并行启动导致的预设加载失败。

## 0.2.20 (2026-10-05)

- 同步 Dream 0.9.0：安静后合并整理、持久化延后队列、聊天独立使用/贡献控制、分组原子审阅与事实到期复核。
- 自动候选保留核对过的脱敏原话；取回与使用反馈不冒充重新核验，缓存按完整内容和到期时间失效。详见 [Dream 验收](https://github.com/STARDUSTLC666/dsh-dream/blob/master/docs/validation/0.9.0.md)。

## 0.2.19 (2026-10-04)

- 同步 Email 0.15.3 的持久化新邮件弹窗开关和 RSS 0.6.0 的五类推荐源目录、文章预览与订阅入口，其余 16 个插件保持原版本。
- 独立插件的 Windows 回归、官方宿主浏览器操作与真实 RSS 抓取通过；原生桌面本轮未操作。详见 [邮件通知开关验收](https://github.com/STARDUSTLC666/dsh-email/blob/main/docs/validation/0.15.3.md) 与 [RSS 推荐源验收](https://github.com/STARDUSTLC666/dsh-rss/blob/master/docs/validation-0.6.0.md)。

## 0.2.18 (2026-10-04)

- 同步 Dream 0.8.1：辅助整理对明确支持关闭推理的模型使用短 JSON 提取，修复真实 DeepSeek 因推理耗尽预算而丢失候选的问题；主任务设置与其余 17 个插件版本不变。
- 真实模型检查使用隔离的演示资料，本地已有密钥未复制到测试目录；原生桌面窗口最小化，未抢占前台操作。详见 [Dream 0.8.1 验收](https://github.com/STARDUSTLC666/dsh-dream/blob/master/docs/validation/0.8.1.md)。

## 0.2.17 (2026-10-04)

- 同步 Dream 0.8.0：符合条件的任务收尾自动提取带来源的候选；人工采纳后，在相关新任务自动回用。默认每日最多 4 次辅助调用、间隔 10 分钟，新输入可取消，独立开关控制。
- 沿用其余 17 个公开组件版本；自动候选不写日记、不自动采纳或修改规则。官方 RC2 / alpha 的完整会话流程及 18 插件同载检查通过，详见 [验收边界](docs/validation-2026-10-04-dream-auto.md)。

## 0.2.16 (2026-10-03)

- 同步 Dream 0.7.1、PPT 0.8.1、Calendar 0.10.1、Email 0.15.2、RSS 0.5.2、HyperFrames 0.5.1 与 Remotion 0.4.1，固定公开组件版本。
- 补齐 Dream / PPT 工作台英文界面和后台恢复引导；修复邮件 / 日历 / RSS 的菜单切换滞后，以及日历悬浮按钮、日期和重复详情。用户资料保留原文。
- 七个组件 1103 项 Windows 测试通过、1 项可选压力测试跳过；官方 RC2 / alpha 的 110 工具、35 插件技能、19 输出样例检查通过。浏览器操作与桌面 / 真实服务边界见 [验收记录](docs/validation-2026-10-03-language.md)。

## 0.2.15 (2026-10-03)

- 同步独立组件：Dream 0.7.0、PPT 0.8.0、Calendar 0.10.0、Email 0.15.1、HyperFrames 0.5.0、Remotion 0.4.0、Cite 0.4.1。
- 包含经验审阅 / 规则回滚、PPT 轻量编辑、ICS 导入、邮件草稿和可信收件人预览、媒体模板渲染，以及中英文文献工作台。各功能先在独立组件完成验收，行为变化见对应更新记录。
- 兼容验证覆盖官方 DSH 0.2.0-rc.2 与 0.2.1-alpha.1；alpha 仍为预发布频道。各设置页的双语完成度不一，Dream 与 PPT 尚以中文为主。

## 0.2.14 (2026-10-02)

- 同步独立组件：`dsh-calendar@0.9.4`、`dsh-email@0.14.7`、`dsh-ppt@0.7.0`。
- 组件版本固定在依赖清单中；详细行为变化见各组件更新记录。

## 0.2.13 (2026-10-02)

- 同步独立组件：`dsh-rss@0.5.1`。
- 组件版本固定在依赖清单中；详细行为变化见各组件更新记录。

## 0.2.12 (2026-10-02)

- 同步独立组件：`dsh-rss@0.5.0`。
- 组件版本固定在依赖清单中；详细行为变化见各组件更新记录。

## 0.2.11 (2026-10-02)

- 同步独立组件：`dsh-email@0.14.6`。
- 组件版本固定在依赖清单中；详细行为变化见各组件更新记录。

## 0.2.10 (2026-10-01)

- 同步独立组件：`dsh-ppt@0.6.0`。
- 组件版本固定在依赖清单中；详细行为变化见各组件更新记录。

## 0.2.9 (2026-10-01)

- 同步独立组件：`dsh-calendar@0.9.3`、`dsh-rss@0.4.3`。
- 组件版本固定在依赖清单中；详细行为变化见各组件更新记录。

## 0.2.8 (2026-10-01)

- 同步独立组件：`@stardustlc/dsh-dream@0.6.0`、`dsh-email@0.14.5`、`dsh-hyperframes@0.4.2`、`dsh-slack@0.3.3`。
- 组件版本固定在依赖清单中；详细行为变化见各组件更新记录。

## 0.2.7 (2026-09-29)

- 依赖 pin 跟随 `@stardustlc/dsh-dream` **0.5.1**：修复日记 BOM 读空与心境键原型污染；检索纪律（候选/无证据默认不注入、版本判定需包名上下文、预算按排名整条装入）；证据纪律 R2′（read→可用、claimed→候选）；存储可诊断（`orphanEvents`/`unsupportedVersions`/checkpoint）与锁心跳。
- 已知限制：知识库很大时读/写仍随历史线性增长，本版不承诺大库性能（见该组件 CHANGELOG 0.5.1）。
- 其余 17 个组件版本未变；`minimumReleaseAgeExclude` 与 pin 逐条对齐。

## 0.2.6 (2026-09-29)

- 依赖 pin 跟随 `@stardustlc/dsh-dream` **0.5.0**（M1：有来源的经验——新增 `dream_learn` / `dream_context` / `dream_review`，新数据目录 `<journalDir>/knowledge/`，只读经验面板）。
- 工具契约计数随之从 96 → **99**（18 个组件同载复验通过）；旧日记与既有六工具行为不变、无迁移。
- 其余 17 个组件版本未变；`minimumReleaseAgeExclude` 与 pin 保持逐条对齐。

## 0.2.5 (2026-09-29)

- 依赖 pin 跟随 `@stardustlc/dsh-dream` **0.4.1**：修复 Desktop 启动失败（前端模块注册 ID 与 scoped 包名不一致导致 `duplicate factory registration`）。0.4.0 的日记面板功能不受影响，本版只是让 Desktop 能正常激活该入口。
- 其余 17 个组件版本未变；`minimumReleaseAgeExclude` 与 pin 保持逐条对齐。

## 0.2.4 (2026-09-29)

- 依赖 pin 跟随今天发布的三个组件：`@stardustlc/dsh-dream` **0.4.0**（新增只读「梦境日记」可视化面板）、`dsh-calendar` **0.9.2**（OAuth 刷新失败按错误码给可操作指引且不回显响应正文）、`dsh-email` **0.14.4**（SMTP 每次发送独占连接，取消真正生效）。
- `minimumReleaseAgeExclude` 放行名单改为**与 18 个 pin 逐条对齐**（此前名单比 pin 还旧，新版本可能被 pnpm 的发布龄门槛挡住）。
- 其余 15 个组件版本未变，仍为线上最新。

## 0.2.3 (2026-09-28)

- 兼容验证更新到 Harness 0.2.0-rc.1：18 个组件在同一宿主共同加载，注册 96 个工具、35 个技能，契约检查通过（`tools` / `skills` / 健康检查 / 输出检查 / 注册丢失检查）。
- 新增 `scripts/verify-compat.mjs`（`pnpm run verify:compat --harness-root <检出>`）：对着任意构建好的 Harness 检出重跑整套离线验证并产出 JSON 报告。
- 依赖 pin 同步到本次发布的组件版本（含 `dsh-code-security` 0.3.6、`dsh-email` 0.14.3、`dsh-hyperframes` 0.4.1、`dsh-remotion` 0.3.4 等 18 个组件）。
- 修正 README 安装命令块被行内注释污染的问题（测试守护）。

## 0.2.2 (2026-09-28)

- 跟随 @stardustlc/dsh-dream 0.3.4：修复 [#2](https://github.com/STARDUSTLC666/dsh-dream/issues/2)（`dream_digest` 摘要此前丢弃全部梦原料，模型只看到标题与轮数；现在实际输出用户原话、助手回应与工具足迹）、支持 Harness v4 会话文件并过滤推理块与自动注入上下文、跳过空会话、标题/目录/工具名一并脱敏。
- 合同测试增强：在真实宿主里以当前 `SESSION_FORMAT_VERSION` 写入一条会话，断言 `dream_digest` 经宿主工具调度可读、可渲染出人类内容；`secure_scan` 补充模型可见输出与规范结果的一致性断言。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 @stardustlc/dsh-dream@0.3.4；其余 17 个组件线上仍是最新，版本未变。

## 0.1.10 (2026-09-20)

- 跟随 dsh-calendar 0.8.2：修**主题色误用**（宿主遮罩 token `--dsw-alias-bg-mask-3` 在 DSH 0.1.6-alpha.2 里实测是 48% 黑，之前被当淡色 hover/底纹用，导致周视图「今天」列、月视图格子 hover、骨架屏、详情 tag 发深灰）与 **Esc 关错层**（打开详情/表单时按 Esc 会连整个日历浮层面板一起关；现在只关最上面一层，并处理宿主 Modal 让行、输入法组合、多面板层序）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.8.2；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.9 (2026-09-20)

- 跟随 dsh-calendar 0.8.1：新增**真 DOM 行为测试层**（jsdom + 真 React，7 条），并修它抓到的三个问题 —— ①同一批次内拖动不提交（提交前的落点判断读了过期的 React state）；②`requestAnimationFrame` 显式走 `window.*`；③四处 React key 警告。功能上无行为变化（拖拽改期仍是 0.8.0 的能力）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.8.1；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.8 (2026-09-19)

- 跟随 dsh-calendar 0.8.0：周视图**拖拽改期**（上下改时间、左右换天、15 分钟吸附、拖底部改时长、rAF 边缘自动滚动、键盘微调、乐观更新 + 失败回滚 + 5 秒撤销）。该版经过**两轮独立评审**：修掉「面板渲染即崩（TDZ）」「点事件同时弹新建」「浮层面板里横向换天失效」「卸载后残留监听器可能替用户提交改期」等硬伤；**重复日程与超过 24 小时的日程暂不支持拖动改期**（CalDAV 里整个系列是一个对象，拖动会重锚系列起点）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.8.0；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.7 (2026-09-19)

- 跟随 dsh-calendar 0.7.0：面板**记住上次用的视图**（月/周/议程）、周视图**默认落在 07:00**（不裁剪事件，仍可上滚）、**窄容器适配**（设置页那种窄面板里芯片显示标题而非只剩「10:00 …」）；另修月视图格子 `button` → `div role=button`（按钮不能嵌套按钮）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.7.0；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.6 (2026-09-19)

- 跟随 dsh-calendar 0.6.0：设置页新增**月 / 周 / 议程**日历面板（点日程开详情、可直接增删改、保存前冲突检测），以及**面板内连接配置**（Google / iCloud / Nextcloud / 自建，先「测试连接」再保存，密钥不回填前端）；另新增 `scripts/google-oauth.mjs`，一条命令换 Google refresh token。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.6.0；其余 17 个组件线上仍是最新，版本未变。
- 双语文档表格补上面板与面板内配置说明；组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.5 (2026-09-19)

- 跟随 dsh-email 0.13.1：该版本内置一份社区公共客户端注册（贡献者 [gurio-wine](https://github.com/gurio-wine) 注册并授权项目内置使用），Outlook / Exchange Online 的 OAuth2 登录开箱即用，不再要求每个用户自己注册 Azure 应用；用户仍可在设置页卡片里填自己的 `clientId` 覆盖，卡片会显示当前生效的应用 ID。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-email@0.13.1；其余 17 个组件线上仍是最新，版本未变。
- 双语文档表格补上「OAuth2 开箱即用」；组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.4 (2026-09-19)

- 依赖对齐 npm latest（2026-09-19 用 `npm view <pkg> version --registry https://registry.npmjs.org/` 逐个核对 18 个组件）：dsh-email 0.10.7 → 0.13.0、dsh-voice 0.3.3 → 0.3.4、dsh-ppt 0.4.2 → 0.4.3、dsh-ffmpeg 0.4.2 → 0.4.3、dsh-calendar 0.5.3 → 0.5.4、dsh-minimal-ptc 0.4.5 → 0.4.7；其余 12 个组件线上即已是最新，版本未变。
- 同步 pnpm-lock.yaml 与 `minimumReleaseAgeExclude` 放行名单（含今天新发布的 5 个版本与 dsh-minimal-ptc 0.4.7）。
- 组合补丁 `cordis.patch.yml` 的配置内容未变，本版仅依赖与锁文件更新。

## 0.1.3 (2026-09-15)

- 适配并验证官方 Harness 0.1.5-rc.1：整套同载、工具/技能契约与 Web 鉴权检查通过。
- Node 要求与宿主统一为 `^22.19.0 || >=24.0.0`；更新中英文兼容性说明。
- 修复套件与组件同时作为 profile 层启用时的重复 id 启动失败：套件使用 npm 依赖自动安装已验证的 18 个组件，用户只需安装套件；补充旧安装方式的迁移命令。
- 启动验收实际挂载极简 PTC agent，校验 `run_code` 入口与插件工具继承；支持通过官方 CLI 安装真实发布 tarball，覆盖依赖解析与组合层启用。

## 0.1.2 (2026-09-08)

- 在官方 `@deepseek-ai/dsh@0.1.3-alpha.2` 上复验：18 个组件同载，96 个工具、34 个技能；隔离 Web 启动、token 鉴权（303/401/200）与进程退出全部通过；
- 同步更新中英文 README 的兼容性说明；
- 本次为文档与兼容性声明补丁，组合补丁内容未变。

## 0.1.0 (2026-08-27)

- 组合补丁一次注入 18 个组件的默认配置，各行与组件自带 `cordis.patch.yml` 一致；
- 扁平化设计：移除 git 子依赖（pnpm `blockExoticSubdeps`），套件与组件经一条 `dsh plugin add` 命令直装；
- 五条产品线：办公流（含做梦记忆）/ 媒体工坊 / DevOps / 通知 / 预设；
- 一致性测试：补丁结构与 18 组件包名对应、字段约束、README 安装命令与组件清单互验（7 测试）；
- 在 `@deepseek-ai/dsh@0.1.1-rc.2` 上验证：18 组件同载启动，HTTP 200，零报错。
- 2026-08-31：在 `@deepseek-ai/dsh@0.1.2-alpha.2` 上复验：18 组件同载启动，token 鉴权正常，零报错；补丁无需改动。

## 更早的改动

完整历史可查阅 [GitHub 提交记录](https://github.com/STARDUSTLC666/dsh-suite/commits/master)。
