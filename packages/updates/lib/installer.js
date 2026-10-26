/** The adapter only invokes the host's package manager. It never spawns npm, changes launcher files or restarts DSH. */
export class NativeInstaller {
  constructor(manager, { getBundle, canProceed } = {}) { this.manager = manager; this.getBundle = getBundle; this.canProceed = canProceed }
  async install(row, release, requestId, signal) {
    signal?.throwIfAborted()
    await this.canProceed?.()
    if (typeof this.manager.updateBundle === 'function') {
      const result = await this.manager.updateBundle(row.name, release.version, { registry: release.registry, requestId })
      return { native: true, result: result.result, restore: result.restore ?? null, step: result.step }
    }
    // RC.3 exposes the same official removal/install operations used by its own UI.
    // A startup-owned bundle refuses removal with stop-profile, so install over it and ask for a restart.
    const previous = { name: row.name, version: row.version, enabled: row.enabled, registry: row.installedRegistry ?? release.registry }
    let removed = false
    const removal = await this.manager.removeBundle(row.name)
    if (removal.error?.code === 'stop-profile') {
      signal?.throwIfAborted(); await this.canProceed?.()
      const result = await this.manager.installBundle(row.name + '@' + release.version, { enabled: previous.enabled, saveExact: true, registry: release.registry, requestId })
      return { native: false, result, restore: null, step: 'install' }
    }
    if (removal.error || removal.application === 'failed') return { native: false, result: removal, restore: null, step: 'remove' }
    removed = true
    let result
    try {
      signal?.throwIfAborted(); await this.canProceed?.()
      result = await this.manager.installBundle(row.name + '@' + release.version, { enabled: previous.enabled, saveExact: true, registry: release.registry, requestId })
      if (!result.error && ['applied', 'restart-required'].includes(result.application)) return { native: false, result, restore: null, step: 'install' }
    } catch (error) {
      const code = ['busy', 'activity-unknown', 'page-dirty', 'page-busy', 'page-not-ready', 'restart-required'].includes(error?.message) ? error.message : 'operation-error'
      result = { changed: removed, application: signal?.aborted ? 'cancelled' : 'failed', stage: 'install', target: row.name, error: { code: signal?.aborted ? 'cancelled' : code } }
    }
    // Restore even after cancellation. Reusing the cancelled request id would cancel the recovery too.
    let restore
    try {
      const existing = await this.getBundle?.(row.name)
      if (existing?.installed && existing.version === previous.version && existing.enabled === previous.enabled && !existing.error) return { native: false, result, restore: { changed: false, application: 'applied' }, step: 'restore' }
      if (existing?.installed && existing.version !== previous.version) {
        const removeTarget = await this.manager.removeBundle(row.name)
        if (removeTarget.error && removeTarget.error.code !== 'stop-profile') return { native: false, result, restore: { application: 'failed', error: removeTarget.error }, step: 'restore' }
      }
      restore = await this.manager.installBundle(previous.name + '@' + previous.version, { enabled: previous.enabled, saveExact: true, registry: previous.registry })
    } catch { restore = { changed: false, application: 'failed', error: { code: 'recovery-failed' } } }
    return { native: false, result, restore, step: 'restore' }
  }
  async cancel(requestId) { return this.manager.cancelInstall(requestId) }
}
