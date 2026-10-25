# 插件工作台界面

本轮把九个实际带前端的插件整理为 DSH 原生主区域工作台，原设置页继续保留。其余工具插件沿用宿主配置界面。侧栏排序、固定、工作区和账号仍由 DSH 管理。

## 成熟产品参考

- [Linear Triage](https://linear.app/docs/triage)：列表与详情、明确的审阅状态。
- [Outlook 阅读窗格](https://support.microsoft.com/en-us/outlook/mail/change-how-the-message-list-is-displayed-in-outlook)：文件夹、邮件列表、阅读和回复草稿的分工。
- [Figma UI3](https://www.figma.com/blog/behind-our-redesign-ui3/)：画布优先，内容与属性分组。
- [Google Calendar](https://workspace.google.com/products/calendar/)：日期导航、视图切换和日程详情。
- [Zotero](https://www.zotero.org/support/quick_start_guide)：文献条目、元数据和来源核对。
- [Feedly](https://docs.feedly.com/article/801-how-to-navigate-through-feedly)：发现来源、分类与主动订阅分开。

仅参考信息组织与交互方式，不复制第三方品牌或未实现功能。没有文献 DOI、来源、视频或检查回执时，界面显示真实缺失状态。

## 一致性

标题 30px（窄屏 24px），正文与控件 14px，元信息 12px；8px 控件圆角，细分割线、冷灰辅助色、克制的蓝色选中和焦点。颜色、字体与中英文跟随宿主，用户内容不翻译。

列表与导出勾选分开，窄屏选择条目后进入详情并提供返回。编辑器按可用宽度重排；本地草稿、PPT 数据推演和预览连接在切页时保留。危险操作有确认，旧修订成品明确标记，不暗示未保存修改已导出。

## 维护

规范源为 `ui/workbench-ui.js`。`node scripts/sync-workbench-ui.mjs` 显式同步到九个仓库的 `templates/workbench-ui.js`，`--check` 检查一致性。每个仓库拥有自己的 `templates/client.js`、领域面板和 `scripts/build-client.mjs`；`pnpm run build` 生成发布的 `lib/client.js`，不依赖安装 Suite。

使用 RC.3 的 `main` / `key` 与 `sidebar.panellist` / `id`，通过各自槽位就绪回调注册；保留 `settings.section`。主区遵守宿主窗口留白变量。文件预览通过公开 `uiWorkspace.openSession` 和 `sidebarRight.openResource` 联动。

验收边界和真实路径见 [2026-10-25 验收记录](validation-2026-10-25-workbenches.md)。
