# 插件工作台界面

本套件包含 **10 个 DSH 原生主区工作台**（9 个基于 `_dsh-design-system` 演进至 v3/v4 的专属非换皮工作台：`dsh-calendar`、`dsh-cite`、`dsh-code-security`、`@stardustlc/dsh-dream`、`dsh-email`、`dsh-hyperframes`、`dsh-ppt`、`dsh-remotion`、`dsh-rss`，以及 `dsh-voice` 的 Voice Studio），原设置页继续保留。另外 `dsh-sql`（v0.9+）提供原生可视化 SQL 设置面板（注册在 `settings.*` / `plugins.bundle.config` 槽位，不占主区工作台位）；其余工具插件沿用宿主配置界面。侧栏排序、固定、工作区和账号仍由 DSH 管理。

## 成熟产品参考

- [Linear Triage](https://linear.app/docs/triage)：列表与详情、明确的审阅状态。
- [Outlook 阅读窗格](https://support.microsoft.com/en-us/outlook/mail/change-how-the-message-list-is-displayed-in-outlook)：文件夹、邮件列表、阅读和回复草稿的分工。
- [Figma UI3](https://www.figma.com/blog/behind-our-redesign-ui3/)：画布优先，内容与属性分组。
- [Google Calendar](https://workspace.google.com/products/calendar/)：日期导航、视图切换和日程详情。
- [Zotero](https://www.zotero.org/support/quick_start_guide)：文献条目、元数据和来源核对。
- [Feedly](https://docs.feedly.com/article/801-how-to-navigate-through-feedly)：发现来源、分类与主动订阅分开。

仅参考信息组织与交互方式，不复制第三方品牌或未实现功能。没有文献 DOI、来源、视频或检查回执时，界面显示真实缺失状态。

## 一致性

9 大工作台已升级至基于 `_dsh-design-system` 的 v3/v4 专属交互界面（提供 13 套明亮风格主题、8 套中英字体搭配与一键切回经典视图），颜色、字体与中英文跟随宿主，用户内容不翻译。

列表与导出勾选分开，窄屏选择条目后进入详情并提供返回。编辑器按可用宽度重排；本地草稿、PPT 数据推演和预览连接在切页时保留。危险操作有确认，旧修订成品明确标记，不暗示未保存修改已导出。

## 维护边界（更新底栏 vs 独立工作台）

- **共享更新底栏套件**：`ui/workbench-ui.js` 现在**仅**作为共享更新底栏 `packages/updates/lib/ui-kit.js` 的规范源（用于在各插件页面与原生详情页底部渲染更新检查、发布说明与偏好控件）。
- **同步脚本安全默认**：`node scripts/sync-workbench-ui.mjs` 默认以只读 `--check` 模式校验 `ui/workbench-ui.js` 与 `packages/updates/lib/ui-kit.js` 的一致性；显式传入 `--write` 时也仅同步 `packages/updates/lib/ui-kit.js`，并拒绝覆盖各插件仓库已演进至 v3/v4 的 `templates/workbench-ui.js`。
- **各插件独立工作台**：上述 10 个原生工作台插件各自维护独立的 `templates/workbench-ui.js`、`templates/client.js`、领域面板与构建脚本（基于 `_dsh-design-system`），运行各自仓库的 `pnpm run build` 生成发布的 `lib/client.js`，不依赖安装 Suite。

主区工作台使用 RC.3 的 `main` / `key` 与 `sidebar.panellist` / `id`，通过各自槽位就绪回调注册；保留 `settings.section`。主区遵守宿主窗口留白变量。文件预览通过公开 `uiWorkspace.openSession` 和 `sidebarRight.openResource` 联动。

验收边界和真实路径见 [2026-10-25 验收记录](validation-2026-10-25-workbenches.md)。

## 共享更新底栏套件（`ui/workbench-ui.js`）演进说明

- `Empty` / `Dialog` / `Status` 自带 `<style>` 与 `.dshw` 主题作用域，放在 `Page` 外（如原生插件详情页底部更新栏）也不会变成裸控件。
- `Status` 支持 `warn` 色调（`tone="warn"`），用于“需注意但非错误”的提示。
- 导出 `Styles`，供自定义浮层显式注入同一份样式。
