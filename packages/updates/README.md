# DSH plugin updates

Shared update controls for STARDUSTLC's DSH plugins. Supported hosts provide the public `profileContext`, `connection`, `pluginManager`, `agents` and Loader services. Windows Desktop 0.2.2-rc.3 was used to verify hot loading, rollback and Suite conversion in an isolated profile.

0.1.4: existing settings pages can show their own packaged WebP icon through DSH alpha.3's optional `settings.section.icon` slot. Older hosts keep their default icon. Embedded workbenches inherit the host surface, inputs use the host input token, and empty states keep a readable width. Update consent and installation defaults are unchanged.

## 使用者 / Users

- 更新区位于原有工作台内容末尾；没有工作台的插件，位于原生插件详情页底部。更新记录和选项原地展开，不增加更新设置菜单或单独页面。检查、安装授权、推迟提醒和忽略版本按包独立保存。
- 自动检查默认开启，每个插件约 15 分钟检查一次。打开更新区时补查到期的版本，按钮可手动刷新。
- **自动安装默认关闭。** 手动安装先确认版本。只有用户明确启用后，兼容的稳定补丁更新才会在空闲时安装；次版本、主版本与预发布版本不会自动安装。
- 有运行任务、未保存修改、页面状态未知、旧版插件尚未提供状态保护或等待重启时，自动安装暂停。更新不会自动重启 DSH，也不会更新 DSH 本体。
- 可推迟提醒和自动安装 24 小时，或忽略某个版本的提醒；仍可手动安装。关闭自动安装会请求取消尚在执行的自动操作，已落盘的结果以官方包管理器回执为准。
- Suite 用户可在更新区确认一次「切换为独立安装」。Harness 按 Suite 锁定的版本登记各组件，沿用原 Loader ID、配置和启用状态。组件在切换期间会暂时卸载。如果更新区提示重启，Harness 会在下次启动时核对独立插件的加载状态。
- 检查 npm `latest` 发布渠道里的稳定版本，选择当前 DSH 和 Node.js 能装的最高版本。若还有更高的不兼容版本，同时显示其要求。
- 本地路径、Git、压缩包和别名安装继续使用各自的安装方式。旧版本先通过原生插件管理升级一次，即可获得新入口。

Each plugin has its own update control in its workbench or native details. Checks run about every 15 minutes by default and can be refreshed manually. The updater selects the highest compatible stable version in the npm `latest` channel and displays any newer version's compatibility requirements. **Automatic installation is off by default.** Enable it per package for compatible stable patches when the profile is idle and drafts are saved. A Suite installation can be converted once to independent bundles at its pinned versions through the same footer. Loader IDs, profile overrides and selection state carry over. Update older releases through native plugin management to get the new controls.

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

Suite conversion uses the individual registry specs at the Suite's pinned versions. It checks that the independent bundles declare the same rows before removing the old Suite and activating the new owners. When the Host saves the new selections but needs a fresh process to load them, the update area asks for a restart. It verifies the new owners and their runtime state after restart. Other conversion failures restore Suite. The recovery record stores the versions and row states needed to resume recovery if Desktop exits during the conversion. The **Recover Suite** action is available from an active plugin's update area.

Preferences and metadata cache live in the active profile as `stardustlc-plugin-updates.json` and `stardustlc-plugin-update-cache.json`. Each package has its own preference record. Writes use a revision check and file lock. An unreadable preference file fails closed and is preserved for repair. Stale windows block installation; the owner can explicitly confirm that disconnected windows are closed, without clearing responsive windows' guards. Exact Connection POST routes admit only owner Peers; there is no model-facing installation tool. Registry checks are restricted to the owned package allowlist, use npm with explicit npmmirror fallback, and compare stable versions, compatibility and integrity metadata before installation. Changelog excerpts are displayed as text.

Real account actions, paid model calls and operating-system restarts are not needed to check updates. Run regression tests with `npm test` in this directory. The public package contains runtime/build sources and the license, without test output or temporary environments.
