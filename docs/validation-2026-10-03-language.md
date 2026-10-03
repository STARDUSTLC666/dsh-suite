# 0.2.16：中英文工作台与恢复引导

2026-10-03，Windows / Node 24.16.0。七个独立插件先完成修复、验证和发布；Suite 固定对应的公开版本。用户资料、账号、密钥、原生桌面窗口和 VPN 保持原状。

| 组件 | 版本 | Windows 测试 | 本轮可见 Web 操作 |
| --- | --- | --- | --- |
| Dream | 0.7.1 | 281 通过、1 项可选压力测试跳过 | 日记展开与搜索，经验采纳与来源检查，规则预览 / 应用 / 回滚，中英共用经验库、390px |
| PPT | 0.8.1 | 114 通过 | 中英文分别编辑和保存，英文质量提醒，当前 PPTX 三页官方渲染预览、390px |
| Calendar | 0.10.1 | 192 通过 | ICS 浮动时间预览与时区选择、连接引导，日期 / 星期 / 重复详情，独立悬浮按钮语言切换 |
| Email | 0.15.2 | 331 通过 | 新建、保存和重新读取同一中文草稿，无账号预览被拒绝并给出对应语言引导；没有发信 |
| RSS | 0.5.2 | 107 通过 | 无效 OPML 恢复说明、混合协议跳过原因、导入一条合成订阅，中英读取相同名称 |
| HyperFrames | 0.5.1 | 39 通过 | 英文超长标题错误与输入保留、中文工程保存、中英读取同一修订 |
| Remotion | 0.4.1 | 39 通过 | 英文超长标题错误与输入保留、中文工程保存、中英读取同一修订 |

共 1103 项通过、1 项可选测试跳过。独立组件的 GitHub CI 与可信发布流程另核对相同提交、测试 tarball 和公开 registry 摘要；Suite 依赖以清单和锁文件为准。

## 宿主和安装

实际操作使用无密钥、合成资料的独立官方 DSH 0.2.1-alpha.1 Web profile。官方 RC2 源码（639ed015）和 alpha SDK 均检查 18 组件共同注册，110 工具、35 插件技能、19 输出样例通过 schema。未配置账号的健康结果不能等同于真实连接。

Suite 清单与锁文件测试、官方 CLI 全新安装、Web 启动、真实极简 PTC agent 挂载、鉴权和退出在发布验收中分别核对。alpha 属于预发布频道；此次隔离检查未更新或重启用户原生桌面版。

## 语言与资料边界

界面跟随「设置 → 通用设置 → 语言」，已保存资料由中英文共用。日记、经验、邮件、日程、订阅标题、媒体工程及 PPT 成品内容保留原文。翻译覆盖工作台和恢复引导，系统文件选择控件跟随 Windows / 浏览器语言；原始引擎日志及未知技术诊断保留原文。

Dream 技能通过助手的工具调用提交和取回经验，未新增后台持续学习。候选提交、经验采纳与规则应用是独立操作。

本轮没有重新执行真实邮箱投递、真实 CalDAV 导入、RSS 外部网络矩阵或视频 MP4 渲染；这些范围保留之前版本的验收记录。可见 Web 操作不代表原生桌面窗口内的新功能已逐项通过，也不证明任意用户内容的最终排版。

## English scope

Seven components passed 1103 Windows tests, with one optional stress test skipped. Visible Chinese/English interactions use an isolated official alpha Web profile and shared original data. RC2 and alpha SDK co-load/schema checks cover 18 components, 110 tools, 35 plugin skills and 19 fixtures. Release artifacts, pinned public dependencies and official CLI installs are checked separately.

UI translation preserves user content; native file controls follow the OS/browser locale and original engine diagnostics remain intact. Dream uses assistant tool calls rather than continuous background learning. This round does not certify native desktop interaction, real mailbox delivery, real calendar imports or new MP4 renders.
