# DSH plugin updates

Shared update controls for STARDUSTLC's DSH plugins. Supported hosts provide the public `profileContext`, `connection`, `pluginManager`, `agents` and Loader services. Windows Desktop 0.2.2-rc.3 was used to verify hot loading and rollback in an isolated profile.

0.1.4: existing settings pages can show their own packaged WebP icon through DSH alpha.3's optional `settings.section.icon` slot. Older hosts keep their default icon. Embedded workbenches inherit the host surface, inputs use the host input token, and empty states keep a readable width. Update consent and installation defaults are unchanged.

## 使用者 / Users

- 原生「插件」详情页已内置官方版本列表与检查/更新按钮，底部补充区不再重复渲染版本号与立即更新按钮，仅保留精简的「自动更新与提醒」偏好开关、内联更新记录（Changelog）与反馈链接（Suite 子项详情页仍保留跳转 Suite 整包更新入口）；侧边栏工作台平时零打扰隐藏，仅在检测到兼容新版本或正在执行更新时浮现单行提示条；普通对话页检测到新版本时，右下角浮现带「一键热更新 / 更新记录 / 明天提醒」的轻量卡片（当前已打开含更新栏的页面时自动避让）。检查、安装授权、推迟提醒和忽略版本按包独立保存。
- 自动检查默认开启，每个安装包每 6 小时最多检查一次；可分别关闭，手动检查始终可用。
- **自动安装默认关闭。** 手动安装先确认版本，完成后若尚未开启自动更新会提供一键开启入口。只有用户明确启用后，通过当前 DSH 与 Node 兼容性校验的稳定版本（含功能小版本与补丁）才会在空闲时安装；跨主版本（如 `0.x → 1.0.0`）与预发布版本不会自动安装。
- 有运行任务、未保存修改、页面状态未知、旧版插件尚未提供状态保护或等待重启时，自动安装暂停。宿主支持 `updateBundle` 热更新时原地重新加载，不会自动重启 DSH，也不会更新 DSH 本体。
- 可推迟提醒和自动安装 24 小时，或忽略某个版本的提醒；仍可手动安装。关闭自动安装会请求取消尚在执行的自动操作，已落盘的结果以官方包管理器回执为准。
- Suite 组件统一通过 Suite 整包更新。停用状态保留；本地路径、Git、压缩包与别名安装保持原来的更新方式。
- 新版本与当前环境不匹配时，页面写明是 DSH 本版、Node.js、弃用还是非插件包，而不是只说“不兼容”；当前版本继续可用。
- 单个组件也可以独立安装并单独热更新，但不要同一个组件既交给 Suite 又直接安装，否则 profile 会出现重复的 loader 条目。
- 发布新版不会直接替换旧用户的安装。旧版用户先通过官方插件管理更新一次，才会获得这个更新入口。

An incompatible release names the environment that must change (DSH version, Node.js version, deprecated release or a non-bundle package) instead of only reporting that it is incompatible, and the current version keeps working. Installing one component both through Suite and directly creates a duplicate loader entry, so keep exactly one ownership. Each plugin exposes its controls at the bottom of its existing workbench or native plugin detail page, and an actionable shell reminder card surfaces in chat views when no update footer is visible on screen. Release notes and options expand in place without extra navigation or settings entries. Consent, checks, deferral and ignored releases are independent; there is no global update page. Automatic checks are on by default (at most every 6 hours); **automatic installation is off by default**. Manual updates require confirmation, hot-reload in place when the host supports `updateBundle`, and offer an optional one-click prompt to enable idle automatic updates afterwards. Explicitly enabled automatic updates install compatible stable releases (minor and patch, excluding major jumps) while the profile is idle and protected browser state is known. Suite components update through the whole Suite bundle. No forced restart, DSH upgrade, local-source replacement, disabled-plugin enablement or Suite component duplication occurs. Older plugin releases need one manual update to acquire these controls.

## Integration

Host entry:

```js
import { registerUpdates } from '@stardustlc/dsh-updates'
export function apply(ctx) {
  registerUpdates(ctx, { name: 'dsh-cite' })
  // Existing plugin setup.
}
```

After generating the browser client, call `buildClient(root, 'lib/client.js')` from `@stardustlc/dsh-updates/build`. It appends the footer to a `W.Page` or uses an explicit `__stardustUpdatesFooter(React, packageName)` in workbenches with a different layout. For a host-only plugin, `buildClient(root)` generates `lib/update-client.js` for the Web client entry. The updater contributes to the official `plugins.detail.section` slot when present. Workbenches declare the dependencies they use. Update-only clients can omit the settings, layout and sidebar prerequisites.

Existing editable workbenches call `__stardustUpdatesGuard(React, id, { dirty, busy, retainOnClose })` from their source component. Set `retainOnClose` only for drafts/jobs cached across panel mounts. Reports contain booleans and identifiers, never form values, account settings or credentials. Legacy participants pause automatic installation until manually upgraded. Custom third-party plugin draft state is outside this library's guard contract.

## Native installation and recovery

The library uses the host's `updateBundle` when available and displays the Host's unload, install, load and rollback phases. Older hosts use the public remove/install/cancel methods. The updater verifies the installed version and enabled state against native inventory. A host result that requires a restart is shown in the plugin's update area. The updater records an automatic attempt for an exact version so a registry or build-policy refusal leaves a manual retry.

Preferences and metadata cache live in the active profile as `stardustlc-plugin-updates.json` and `stardustlc-plugin-update-cache.json`. Each package has its own preference record. Writes use a revision check and file lock. An unreadable preference file fails closed and is preserved for repair. Stale windows block installation; the owner can explicitly confirm that disconnected windows are closed, without clearing responsive windows' guards. Exact Connection POST routes admit only owner Peers; there is no model-facing installation tool. Registry checks are restricted to the owned package allowlist, use npm with explicit npmmirror fallback, and compare stable versions, compatibility and integrity metadata before installation. Changelog excerpts are displayed as text.

Real account actions, paid model calls and operating-system restarts are not needed to check updates. Run regression tests with `npm test` in this directory. The public package contains runtime/build sources and the license, without test output or temporary environments.
