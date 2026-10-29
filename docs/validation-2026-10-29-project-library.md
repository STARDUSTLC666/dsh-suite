# 工程检索与视频总览图验收 / Project libraries and video contact sheets

- 版本：PPT 0.20.0、Remotion 0.10.0、HyperFrames 0.11.0、FFmpeg 0.7.1；Suite 18 个组件，Review 与 Computer Use 独立安装。
- Windows 本地测试：423 项，422 通过、1 项跳过。新增总览图覆盖取消、失败、无画面、参数范围与重名文件保护。
- 官方 DSH 0.2.1-rc.4 与 0.2.2-alpha.2 的隔离 Web profile：20 个插件均 active。受控模型与合成工程，不使用用户账号或实际邮件。
- 两个宿主均通过中英文检索、全角 / 大小写关键词、自然标题排序、空结果、返回保留筛选条件，以及 1536×1000 / 390×844 操作；两个视频插件的当前 / 归档工程分别筛选。
- 通过真实宿主 subprocess 生成六格 PNG 总览图，核对采样索引且源文件 SHA-256 不变。取消与失败路径为本地受控测试；均匀采样不是镜头检测，目标秒数不是精确帧时间码。
- HyperFrames 官方 0.8.214：核对 npm SHA-512 与发布 Git commit，包含完整规范资源及 CLI 生成的辅助文件，保留 Apache-2.0 许可。使用插件管理的真实后端导出 6 秒 H.264 MP4，并检查画面。Remotion 当前官方版本仍为 4.0.539。
- 本轮不修改 PPTX 生成 / 版式引擎；未复测 Electron 原生窗口、真实邮箱 / Slack / 钉钉账号或 Docker 引擎。自动安装默认关闭。

English: local tests, controlled native-host/browser fixtures and actual media execution are separate evidence categories. Both official Web runtimes loaded all 20 plugins. Search/sort was exercised in Chinese and English at desktop and narrow widths; uniform contact-sheet extraction preserved the source. Actual HyperFrames 0.8.214 export passed. These checks do not claim real-account, Electron-window or model-autonomous acceptance.
