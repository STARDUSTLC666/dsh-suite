# 更新记录

## 0.9.0 (2026-10-30)

- 同步 Calendar 0.14.1：新增只读空闲时段查询、工作时间与缓冲条件、明确的时区和范围；选择候选只填写新建草稿，并保留夏令时重复钟点的绝对时间。
- 透明及取消日程不再产生冲突提示；其余 17 个组件版本不变，自动安装仍默认关闭。
- Include Calendar availability suggestions, exact draft instants and consistent conflict checks.


## 0.8.0 (2026-10-30)

- 同步 Email 0.21.0：新增可选 POP3 收信、稳定 UIDL、本地检索范围和附件，继续使用 SMTP 草稿确认；其余 17 个组件版本不变。
- 说明 POP3 的只读收件箱与协议限制；不提供虚假的服务器未读、星标或已发送文件夹。自动安装仍默认关闭。
- Include opt-in POP3 receiving and preserve the existing SMTP confirmation flow.


## 0.7.1 (2026-10-29)

- Pin all 18 component documentation releases; Review and Computer Use remain independently installable.

- 补齐中英文使用流程：准备、入口、具体操作与结果核对；新增累计 npm 下载徽章并保留月统计。
- Add practical getting-started workflows and lifetime npm download badges alongside monthly counts.

## 0.7.0 (2026-10-29)

- 同步 PPT 0.20.0、Remotion 0.10.0、HyperFrames 0.11.0、FFmpeg 0.7.1。
- 三个创作工作台支持工程检索与排序；新增视频总览图，HyperFrames 技能与渲染器同步官方 0.8.214。
- 保留原文件、未保存修改保护与用户选择更新；自动安装仍默认关闭。
- Sync searchable project libraries, bounded video contact sheets and official HyperFrames 0.8.214.

## 0.6.3 (2026-10-29)

- 同步仓库与 npm 的简明介绍、中英文 README 和反馈入口；本次为文档与包元数据更新。
- Sync npm descriptions and both README guides with the repository, including issue and pull-request links.
- Pin all 18 component documentation patches; Review and Computer Use remain separate packages.

## 0.6.2 (2026-10-28)

- 同步 Voice 0.5.0、CodeSecurity 0.7.4、SQL 0.5.5、RSS 0.9.4、Flakefinder 0.4.4、HyperFrames 0.10.1、Remotion 0.9.1。
- 跟进 Edge 在线语音 v2 协议、Git 属性隔离、写操作确认提示，以及官方 HyperFrames 0.8.211 技能与渲染环境；自动安装仍默认关闭。
- 20 个独立插件和 Suite 的本轮审查范围见验证记录；Review 和 Computer Use 继续独立安装，不计入 Suite 的 18 组件。未配置账号或 Docker 引擎不记为实测通过。

## 0.6.1 (2026-10-28)

- 同步 SQL 0.5.4：MySQL / PostgreSQL 查询逐次使用独立只读事务，完成或报错后回滚；取消和截流销毁连接。
- PostgreSQL 以扩展协议拒绝同一请求内的多条命令，修复修改会话默认设置后通过写函数绕过只读保护的问题。
- 自动安装仍默认关闭，用户可在原有页面底部检查并选择更新。

## 0.6.0 (2026-10-28)

- 同步 HyperFrames 0.10.0 与 Remotion 0.9.0：素材页支持直接调整图片顺序，保留旧成品，重新导出后生效。
- HyperFrames 技能与渲染器同步官方 0.8.209，补齐发布资源完整性校验。
- 自动安装仍默认关闭，功能版本升级由用户选择。

## 0.5.0 (2026-10-28)

- 同步 PPT 0.19.0：在原工作台选择分享成品包或完整工程包，分享包附当前逐页讲稿；普通下载无需 AI 预审。
- 下载徽章使用明确的 UTC 完整日期窗口，拒绝 npm 相对日期接口返回的过期零值，补齐 Review 与 Computer Use。
- 自动安装继续默认关闭。PPT 是功能版本升级，由用户确认是否安装。

## 0.4.1 (2026-10-27)

- 同步 18 个组件的底部更新区：在原有工作台或原生详情页操作，记录与选项原地展开，不再增加更新设置菜单。
- 组件底部直接说明 Suite 整包范围；自动安装默认关闭，保留确认、任务与未保存修改保护。

## 0.4.0（2026-10-27）

- 同步全部 18 个组件的独立更新入口，保留组件各自页面与设置，不新增总更新页。Suite 组件明确通过整包更新。
- 自动安装默认关闭，需明确开启；只在空闲且没有未保存修改时安装兼容稳定补丁，保留稍后、忽略与取消。
- 通过官方 DSH 包管理接口安装与恢复，不强制重启、不替换本地源码安装；首次获取入口仍需手动更新一次。
- 要求 DSH 0.2.1-rc.3 或更新版本。验收范围见[本次记录](docs/validation-2026-10-27-updates.md)。

## 0.3.1（2026-10-26）

- 同步 Docker、Slack、钉钉、极简 PTC、Cite、Code Security、FFmpeg 和 Codex Port 的问题修复，保持 18 个组件与现有启用方式。
- 组合内的 PTC 预设同步官方提示词组合修复；锁定组件的精确版本与 registry 完整性。
- 验收范围见[本次记录](docs/validation-2026-10-26.md)。

## 0.3.0（2026-10-25）

- 更新九个独立插件的原生工作台：Calendar 0.12.0、Cite 0.6.0、Code Security 0.6.0、Dream 0.12.0、Email 0.19.0、HyperFrames 0.8.0、PPT 0.17.0、Remotion 0.7.0、RSS 0.8.0。
- 主区操作与配置分工更清楚，统一中英、深浅色、窄屏、键盘焦点和未保存保护；原设置入口继续可用。
- 新增共享工作台组件规范与显式同步脚本，各组件仍可独立构建和安装。其余九个组件版本不变。
- 本轮真实操作与模拟账号边界见 [验收记录](docs/validation-2026-10-25-workbenches.md)。

## 0.2.37（2026-10-25）

- 同步 Dream 0.11.0：模型只建议采纳，用户在面板确认后回用；全局经验明确确认范围，规则桥接默认只读预览。
- 同步 Email 0.18.1：修复数字字符串 UID 的读信、标记、附件与回复操作；AgentMail 标识保持原样。
- 同步 RSS 0.7.1：异常正文不再因反复扫描而卡住宿主。其余 15 个组件版本未变，继续适配官方 DSH 0.2.1-rc.3。

## 0.2.36（2026-10-24）

- 同步 PPT 0.16.1，适配 DSH 0.2.1-rc.3 的动态模型目录：视觉检查、AI 预审与模拟答辩按提供方和模型 ID 保留选择。
- 模型下线后要求重新选择；目录刷新和重排不再自动切换到其他模型。其余 17 个组件版本未变。

## 0.2.35（2026-10-23）

- 同步 PPT 0.16.0：可选实际 PPTX 图片检查、受限排版修复、新副本与重新渲染复查，支持前后画面和问题区域对比。
- 保留原文、数值与数据绑定，提供停止、调用上限、未解决问题与本地检查记录；默认生成不调用视觉模型。
- 其余 17 个组件版本未变。PPT 的 Windows、真实 DSH Web、真实模型样例和原生渲染范围详见验证记录，桌面原生窗口另行验收。

## 0.2.34（2026-10-23）

- 同步 PPT 0.15.0：按需启用数字来源与公式追溯、现场假设推演，以及来源更新的页面差异预览和确认保存。
- HTML 保留交互，PPTX 保存确认后的静态结果，备注附来源、公式和假设；支持离线参数导回、保存副本与撤销。
- 其余 17 个组件版本未变。PPT 已完成真实 DSH Web、离线浏览器和四页最终 PPTX 官方引擎渲染检查；桌面原生窗口逐项操作另行验收。

## 0.2.33（2026-10-22）

- 同步 PPT 0.14.0：成品区新增可选 AI 预审与模拟答辩，默认关闭，复用 DSH 模型并限制调用次数。
- 支持查看原文与表达改稿、将所选建议和备用问答页另存可撤销副本、导出问答与待补充材料；修复工作台深色主题。
- 其余 17 个组件版本未变。PPT 的真实 Web 操作使用原生模拟模型验收，不代表真实模型效果或桌面原生窗口已经通过。

## 0.2.32（2026-10-21）

- 同步邮件 0.18.0：新增 AgentMail US/EU 邮箱与 API Key 账号，提供收件箱/已发送、分页搜索、正文与附件、已读/星标和回复草稿界面；人工预览确认后发送并保留回复线程。
- 明确 API 邮箱与 IMAP 的 UID、搜索和附件限制，保留禁止收件人与不自动重发保护。AgentMail 目前按无真实账号的要求完成模拟协议及官方 Web 宿主操作验收，真实服务投递尚未验证。

[返回简介](README.md) · [使用说明](docs/USAGE.md) · [验证记录](docs/VALIDATION.md)

## 0.2.31（2026-10-21）

- 同步邮件 0.17.3：修复服务端搜索静默返回空时的漏搜，默认分批扫描最近 5000 封信封，可继续更早窗口，并返回实际覆盖范围；信封命中不下载正文或附件（Email #25）。
- 其余 17 个组件保持原版本。

## 0.2.30（2026-10-21）

- 同步 PPT 0.13.0：逐页 Markdown 讲稿、图片读取取消、外部成品覆盖保护与另存副本，以及键盘保存、未保存提醒和错误重试。
- 同步日历 0.11.2：空字段清除、TZID / 夏令时保留、复杂重复系列保护与明确的整系列操作范围；PPT 与日历引导跟随宿主语言。
- 同步邮件 0.17.2：阻止无 MOVE / UIDPLUS 服务器上可能误删其他邮件的移动操作，包含 0.17.1 的账号与发信策略修复。
- 同步安全检查 0.5.1、SQL 0.4.6 与语音 0.3.7：包含 Git 命令钩子防护、数据库只读校验与语音地址 / 工作区边界修复；其余 12 个组件保持原版本。

## 0.2.29（2026-10-17）

- 跟随 9 个组件的「首次使用分步引导」版本：`dsh-email 0.17.0`、`dsh-calendar 0.11.0`、`@stardustlc/dsh-dream 0.10.0`、`dsh-rss 0.7.0`、`dsh-ppt 0.11.0`、`dsh-code-security 0.5.0`、`dsh-hyperframes 0.7.0`、`dsh-remotion 0.6.0`、`dsh-cite 0.5.0`。
- 锁文件同步；其余 9 个组件版本未变。
## 0.2.28（2026-10-17）

- 依赖 pin 跟随 `@stardustlc/dsh-dream` **0.9.1**（派生索引紧凑序列化，−32% 体积）与 `@stardustlc/dsh-docker` **0.4.2**（补 `publishConfig.access`）。
- 其余 16 个组件版本未变；`minimumReleaseAgeExclude` 与 pin 逐条对齐。
## 0.2.27 (2026-10-17)

- 同步日历 0.10.4、邮件 0.16.3 与 RSS 0.6.3：修复标签与输入框关联、快速打开空连接表单、服务商提示误脱敏及英文窄窗口布局。
- 在官方 DSH 0.2.1-alpha.5 补齐 15 个插件的基础操作记录与同一会话的技能启停检查；Docker、Slack、钉钉业务操作暂缓，其他组件版本保持不变。验收边界见 [逐插件记录](docs/validation-2026-10-17-human.md)。

## 0.2.26 (2026-10-17)

- 同步极简 PTC 0.5.6 及套件预设：修复完整提示词覆盖工具 SDK，保留极简身份与必要的官方工具声明，按作用域和运行格式生成。
- 适配核对官方 DSH 0.2.1-alpha.5；共同加载验收新增“模型提示词必须包含当前工具 SDK”检查，避免仅凭工具注册成功判定可用。其余 17 个组件保持原版本，详见 [本次记录](docs/validation-2026-10-17-alpha5.md)。

## 0.2.25 (2026-10-15)

- 同步 Code Security 0.4.1：中英文设置工作台、可选 Betterleaks / Semgrep CE / OSV、统一脱敏和 Python 依赖解析，以及默认关闭的逐轮改动检查。
- 复查保留范围和引擎，失败不会被记为修复完成；本地规则与增强引擎共用明确的覆盖状态。其余组件固定为上一版已发布版本，详见 [本次验收](docs/validation-2026-10-15-security.md)。

## 0.2.24 (2026-10-15)

- PPT 0.10.0：工作台和工具支持复制/删除页面，保留图文、图表与备注，结构修改可撤销；保护最后一页与未保存输入。
- FFmpeg 0.5.0：修复 GIF 截取选项及调色板生成，统一拼接素材尺寸、帧率和像素比例；有声/无声混合时补静音，保留原有声音。
- RSS 0.6.2：请求独立管理直连、代理隧道及 TLS 套接字错误；更新 Undici，增加 Windows/Linux、Node 22/24 检查。
- 极简 PTC 0.5.5：移除新版已停用的 toolFilter，使用官方调度服务的子代理限制；提供可选持久 Node 补丁，默认仍为逐次运行。
- 同步 Code Security 0.3.8，修复此前组合包仍锁旧版的问题。详见 [验证记录](docs/validation-2026-10-15.md)。

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
