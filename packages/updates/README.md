# DSH plugin updates

Shared update controls used by STARDUSTLC's DSH plugins. This is an internal library, not another plugin to enable. Supported hosts provide the public `profileContext`, `connection`, `pluginManager`, `agents` and Loader services. Validated against the official Windows DSH 0.2.1-rc.3 runtime.

## 使用者 / Users

- 每个插件在自己的页面或设置项提供更新入口，显示版本与更新记录。没有新增统一更新总页。检查、安装授权、推迟提醒和忽略版本按包独立保存。
- 自动检查默认开启，每个插件每天最多一次；可分别关闭，手动检查始终可用。
- **自动安装默认关闭。** 手动安装先确认版本。只有用户明确启用后，兼容的稳定补丁更新才会在空闲时安装；次版本、主版本与预发布版本不会自动安装。
- 有运行任务、未保存修改、页面状态未知、旧版插件尚未提供状态保护或等待重启时，自动安装暂停。更新不会自动重启 DSH，也不会更新 DSH 本体。
- 可推迟提醒和自动安装 24 小时，或忽略某个版本的提醒；仍可手动安装。关闭自动安装会请求取消尚在执行的自动操作，已落盘的结果以官方包管理器回执为准。
- Suite 组件统一通过 Suite 更新。停用状态保留；本地路径、Git、压缩包与别名安装保持原来的更新方式。
- 发布新版不会直接替换旧用户的安装。旧版用户先通过官方插件管理更新一次，才会获得这个更新入口。

Each plugin exposes its own controls on its workbench or settings page. Consent, checks, deferral and ignored releases are independent; there is no global update page. Automatic checks are on by default; **automatic installation is off by default**. Manual updates require confirmation. Explicitly enabled automatic updates only install compatible stable patches while the profile is idle and protected browser state is known. No forced restart, DSH upgrade, local-source replacement, disabled-plugin enablement or Suite component duplication occurs. Older plugin releases need one manual update to acquire these controls.

## Integration

Host entry:

```js
import { registerUpdates } from '@stardustlc/dsh-updates'
export function apply(ctx) {
  registerUpdates(ctx, { name: 'dsh-cite' })
  // Existing plugin setup.
}
```

After generating the ordinary browser client, call `buildClient(root, 'lib/client.js')` from `@stardustlc/dsh-updates/build`. It adds an update button to that plugin's existing workbench header. For a host-only plugin, `buildClient(root)` generates `lib/update-client.js` and contributes that plugin's own settings item. Declare a Web client with the standard settings/layout/sidebar module dependencies. The original client permissions and return value are retained; controls attach through a separate optional owner-only injection. Shared root fibers coordinate transport and installation without adding a global page. Current public DSH APIs are required; unsupported service shapes skip registration.

Existing editable workbenches call `__stardustUpdatesGuard(React, id, { dirty, busy, retainOnClose })` from their source component. Set `retainOnClose` only for drafts/jobs cached across panel mounts. Reports contain booleans and identifiers, never form values, account settings or credentials. Legacy participants pause automatic installation until manually upgraded. Custom third-party plugin draft state is outside this library's guard contract.

## Native installation and recovery

The library uses the host's `updateBundle` when available. RC.3 uses its public remove/install/cancel methods, preserving the exact previous version and enabled selection for recovery. Startup-owned packages are installed without a forced restart and report that a manual restart is needed. Interrupted or unconfirmed operations block retries; inspect and repair the package in official plugin management, then restart manually. Turning an option off cannot undo a package-manager write already completed.

Preferences and metadata cache live in the active profile as `stardustlc-plugin-updates.json` and `stardustlc-plugin-update-cache.json`. Each package has its own preference record. Writes use a revision check and file lock. An unreadable preference file fails closed and is preserved for repair. Stale windows block installation; the owner can explicitly confirm that disconnected windows are closed, without clearing responsive windows' guards. Exact Connection POST routes admit only owner Peers; there is no model-facing installation tool. Registry checks are restricted to the owned package allowlist, use npm with explicit npmmirror fallback, and compare stable versions, compatibility and integrity metadata before installation. Changelog excerpts are displayed as text.

Real account actions, paid model calls and operating-system restarts are not needed to check updates. Run regression tests with `npm test` in this directory. The public package contains runtime/build sources and the license, without test output or temporary environments.
