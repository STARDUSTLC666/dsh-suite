# 0.2.15：独立工作台同步与官方新版兼容

这是 0.2.15 发布时的记录；后续语言修复与新版验证见 [0.2.16](validation-2026-10-03-language.md)。

2026-10-03，Windows / Node 24.16.0。先完成独立插件验收，再同步 Suite 的精确版本依赖。用户的账号、密钥与资料未迁移，VPN 保持开启。

| 本次更新组件 | 版本 | 独立验收范围 |
| --- | --- | --- |
| Dream | 0.7.0 | 浏览器中的经验审阅、来源检查、规则预览 / 应用 / 回滚 |
| PPT | 0.8.0 | 113 项测试、可见轻量编辑与冲突恢复、三种下载、官方 Kit 的五页实际渲染、390px 布局 |
| Calendar | 0.10.0 | 191 项测试、ICS 文件 / 粘贴预览、部分失败重试、重复跳过与连接切换拦截 |
| Email | 0.15.1 | 330 项测试、工具 schema 修复、可见本地草稿保存；此前完成编辑 / 附件 / 可信规则 / 确认操作 |
| HyperFrames | 0.5.0 | 39 项测试、实际模板与素材操作、Studio、含中文 / 图片 / 音频 / 背景视频的 MP4 播放与下载 |
| Remotion | 0.4.0 | 39 项测试、实际模板与素材操作、Studio、含中文 / 图片 / 音频 / 背景视频的 MP4 播放与下载 |
| Cite | 0.4.1 | 41 项测试、文件导入与去重、真实 Crossref 补全 / 保留差异、中英切换、四种基本引文格式、三种下载与实际文件再导入 |

其余 11 个组件保留已有版本。各独立包已通过 Windows 测试和 GitHub CI；组件的 npm 验证采用公开 registry 的摘要、GitHub 测试产物与全新安装检查。

## 宿主范围

官方 RC2 标签源码（639ed015）及公开 `@deepseek-ai/dsh@0.2.1-alpha.1` 均在 E 盘隔离环境测试，18 个独立插件共同注册 110 个工具、35 个插件技能，19 个只读输出样例通过 schema。未配置真实账号的健康检查不代表真实账号连接通过。

实际 Web 启动另检查完整工具与技能目录、媒体技能健康状态、极简 PTC 的真实 agent 挂载、`run_code` 模型入口、插件工具继承，以及 Web 鉴权和进程退出。alpha 的启动目录另含一个宿主技能，不能将其与 35 个插件技能混为一谈。精确依赖的官方 CLI 安装与 Suite 发布包核对由本轮发布验收完成。

官方 alpha 仍为预发布，默认 npm latest / next 仍指向 RC2。本次隔离验证没有更新或重启用户原生桌面版。插件窗口内的新工作台仍需原生桌面可见操作验收；真实邮箱投递和真实日历账号导入也未在本批执行。

## 界面语言

Cite 的正常按钮、重复提示及失败信息已在官方中文 / English 切换中实际验证，两种界面共用同一文献库。文献标题、作者、文件名、工程名等用户资料保留原文。

0.2.15 发布时的语言支持随组件而异：当时 Dream 与 PPT 的设置页仍以中文为主；部分其他界面的后台错误信息也有中文回退。主要按钮支持切换不能等同于所有状态和错误提示已完成翻译。本版没有宣称整套插件完成双语化。

媒体渲染依赖采用各引擎固定版本并需用户显式准备；Cite 使用四种基本引文模板，不宣称覆盖各期刊全部规范。用户界面与业务流程的验证记录见各组件的 `docs/VALIDATION.md`。

## English scope

This release pins seven independently tested workbenches. Official RC2 and public alpha checks cover 18 components, 110 tools, 35 plugin skills and 19 read-only schema fixtures. Web startup additionally checks authentication, media skills, a real Minimal PTC agent and clean process termination. Public tarball integrity and official CLI installation are checked separately during release.

Visible browser tests do not establish native desktop interaction or real mailbox delivery/calendar imports. At the time of 0.2.15, localization was partial across the suite: Cite's Chinese/English UI uses one library, while Dream/PPT remain primarily Chinese and some other backend errors still fall back to Chinese. User-created content retains its original language.
