import semver from 'semver'
import { SUITE, SUITE_COMPONENTS, installationKind } from './policy.js'

const key = row => JSON.stringify([row.rowId, row.moduleName])
const applied = result => !result?.error && result?.application === 'applied'
const installed = (bundles, name) => bundles.find(bundle => bundle.name === name && bundle.installed)
const stable = version => !!semver.valid(version) && !semver.prerelease(version)

function canRetryAtStartup(result) {
  if (result?.application === 'restart-required' && !result.error) return true
  return result?.application === 'failed' && result.error?.code === 'operation-error'
    && /failed to import:/.test(result.error.diagnostic ?? '')
}

function exact(bundle, version, enabled) {
  return bundle?.version === version && bundle?.enabled === enabled
    && !bundle?.error && installationKind(bundle) === 'registry'
}

export class SuiteMigration {
  constructor(manager, readManifest, hasHmr, journal) {
    this.manager = manager
    this.readManifest = readManifest
    this.hasHmr = hasHmr
    this.journal = journal
  }

  async recoveryPlan() {
    const plan = await this.journal?.readSuiteRecovery()
    if (plan == null) return null
    if (!stable(plan.suite?.version) || !Array.isArray(plan.members) || !plan.members.length || plan.members.length > SUITE_COMPONENTS.size
      || plan.members.some(member => !SUITE_COMPONENTS.has(member?.name) || !stable(member.version) || typeof member.existing !== 'boolean')
      || new Set(plan.members.map(member => member.name)).size !== plan.members.length
      || !Array.isArray(plan.rows) || !plan.rows.length || plan.rows.length > 128
      || plan.rows.some(row => !Array.isArray(row) || row.length !== 2 || typeof row[0] !== 'string' || typeof row[1] !== 'boolean')
      || (plan.restartPid !== undefined && (!Number.isSafeInteger(plan.restartPid) || plan.restartPid < 1))) {
      throw new Error('suite-recovery-unreadable')
    }
    const rows = new Map(plan.rows)
    if (plan.activeRows !== undefined && (!Array.isArray(plan.activeRows) || plan.activeRows.length > rows.size
      || plan.activeRows.some(id => rows.get(id) !== true))) throw new Error('suite-recovery-unreadable')
    return { ...plan, rows, activeRows: new Set(plan.activeRows) }
  }

  async plan() {
    if (!this.hasHmr()) throw new Error('suite-hmr-required')
    const bundles = await this.manager.listBundles()
    const suite = installed(bundles, SUITE)
    if (!suite?.enabled || suite.error || installationKind(suite) !== 'registry' || !suite.rows?.length) {
      throw new Error('suite-inventory-changed')
    }
    const manifest = await this.readManifest()
    const pins = Object.entries(manifest.dependencies ?? {})
    if (manifest.name !== SUITE || manifest.version !== suite.version || !pins.length
      || pins.some(([name, version]) => !SUITE_COMPONENTS.has(name) || !semver.valid(version) || semver.prerelease(version))) {
      throw new Error('suite-inventory-changed')
    }
    const plugins = new Map((await this.manager.listPlugins()).map(plugin => [plugin.entryId, plugin]))
    const rows = new Map(suite.rows.map(row => [key(row), plugins.get(row.entryId)?.enabled]))
    if (rows.size !== suite.rows.length || [...rows.values()].some(enabled => typeof enabled !== 'boolean')) {
      throw new Error('suite-inventory-changed')
    }
    const members = pins.map(([name, version]) => {
      const existing = installed(bundles, name)
      if (existing && !exact(existing, version, false)) throw new Error('suite-inventory-changed')
      return { name, version, existing: !!existing }
    })
    const activeRows = new Set(suite.rows.filter(row => rows.get(key(row)) && plugins.get(row.entryId)?.fiberPhase === 'active').map(key))
    return { suite, members, rows, activeRows }
  }

  async verifyRows(bundles, plan, enabled, verifyRuntime = enabled) {
    const rows = new Set()
    const plugins = verifyRuntime ? new Map((await this.manager.listPlugins()).map(plugin => [plugin.entryId, plugin])) : null
    for (const member of plan.members) {
      const bundle = installed(bundles, member.name)
      if (!exact(bundle, member.version, enabled) || !bundle.rows?.length) throw new Error('suite-inventory-changed')
      for (const row of bundle.rows) {
        const id = key(row)
        if (rows.has(id) || !plan.rows.has(id)) throw new Error('suite-inventory-changed')
        if (plugins) {
          const plugin = plugins.get(row.entryId)
          if (!plugin || plugin.enabled !== plan.rows.get(id) || plugin.fiberPhase === 'failed'
            || (plan.activeRows.has(id) && plugin.fiberPhase !== 'active')) throw new Error('suite-inventory-changed')
        }
        rows.add(id)
      }
    }
    if (rows.size !== plan.rows.size) throw new Error('suite-inventory-changed')
  }

  async confirmCompleted(plan, bundles) {
    if (plan.restartPid === process.pid) return false
    const current = bundles ?? await this.manager.listBundles()
    if (installed(current, SUITE)) return false
    if (!await this.verifyRows(current, plan, true).then(() => true, () => false)) return false
    await this.journal.saveSuiteRecovery(null)
    return true
  }

  async run({ requestId, signal, beforeSwitch, progress }) {
    if (await this.recoveryPlan()) throw new Error('suite-recovery-required')
    const plan = await this.plan()
    const recovery = { suite: { version: plan.suite.version }, members: plan.members,
      rows: [...plan.rows], activeRows: [...plan.activeRows] }
    const added = []
    const switched = []
    let suiteDisabled = false
    let suiteRemovalStarted = false
    let journaled = false
    try {
      const registries = new Map()
      progress('checking', 0, plan.members.length)
      for (const [index, member] of plan.members.entries()) {
        signal.throwIfAborted()
        if (!member.existing) {
          const inspection = await this.manager.inspect(member.name + '@' + member.version, undefined, signal)
          if (inspection.status !== 'accepted' || inspection.name !== member.name || inspection.version !== member.version || inspection.bundle !== true) {
            throw new Error('suite-stage-failed')
          }
          registries.set(member.name, inspection.registry)
        }
        progress('checking', index + 1, plan.members.length)
      }
      await beforeSwitch()
      signal.throwIfAborted()
      if (!exact(installed(await this.manager.listBundles(), SUITE), plan.suite.version, true)) throw new Error('suite-inventory-changed')
      await this.journal?.saveSuiteRecovery(recovery)
      journaled = true
      // A direct install can change the runtime resolution of a transitive
      // package. Unload the Suite layer before adding standalone dependencies.
      suiteDisabled = true
      if (!applied(await this.manager.setBundleEnabled(SUITE, false))) throw new Error('suite-stage-failed')
      progress('installing', 0, plan.members.length)
      for (const [index, member] of plan.members.entries()) {
        signal.throwIfAborted()
        if (!member.existing) {
          const current = await this.manager.listBundles()
          if (!exact(installed(current, SUITE), plan.suite.version, false) || installed(current, member.name)) throw new Error('suite-inventory-changed')
          added.push(member)
          const result = await this.manager.installBundle(member.name + '@' + member.version, {
            enabled: false, saveExact: true, requestId, registry: registries.get(member.name),
            expected: { name: member.name, version: member.version },
          })
          if (!applied(result)) throw new Error(result?.pendingBuilds?.length ? 'build-blocked' : 'suite-stage-failed')
        }
        progress('installing', index + 1, plan.members.length)
      }
      signal.throwIfAborted()
      const staged = await this.manager.listBundles()
      if (!exact(installed(staged, SUITE), plan.suite.version, false)) throw new Error('suite-inventory-changed')
      await this.verifyRows(staged, plan, false)
      progress('applying', 0, plan.members.length)
      // The Host refuses to remove a bundle while any of its declared IDs
      // is live. At this point both owners are disabled and the IDs are free.
      suiteRemovalStarted = true
      if (!applied(await this.manager.removeBundle(SUITE))) throw new Error('suite-stage-failed')
      let restartRequired = false
      for (const [index, member] of plan.members.entries()) {
        signal.throwIfAborted()
        const current = await this.manager.listBundles()
        if (installed(current, SUITE) || !exact(installed(current, member.name), member.version, false)) {
          throw new Error('suite-inventory-changed')
        }
        switched.push(member)
        const selection = await this.manager.setBundleEnabled(member.name, true)
        if (!applied(selection)) {
          // The Host persists the bundle selection before applying it to the current Loader.
          if (!this.journal || !canRetryAtStartup(selection)
            || !exact(installed(await this.manager.listBundles(), member.name), member.version, true)) throw new Error('suite-stage-failed')
          restartRequired = true
        }
        progress('applying', index + 1, plan.members.length)
      }
      await this.verifyRows(await this.manager.listBundles(), plan, true, !restartRequired)
      if (restartRequired) {
        await this.journal.saveSuiteRecovery({ ...recovery, restartPid: process.pid })
        return { state: 'restart-required' }
      }
      await this.journal?.saveSuiteRecovery(null).catch(() => {})
      return { state: 'complete' }
    } catch (error) {
      progress('restoring')
      const restored = await this.restore(plan, switched, added, suiteDisabled, suiteRemovalStarted).catch(() => false)
      if (restored && journaled) await this.journal?.saveSuiteRecovery(null).catch(() => {})
      return { state: restored ? signal.aborted ? 'cancelled' : 'restored' : 'restore-failed', reason: error.message }
    }
  }

  async recover({ beforeSwitch, progress }) {
    if (!this.hasHmr()) throw new Error('suite-hmr-required')
    const plan = await this.recoveryPlan()
    if (!plan) throw new Error('suite-inventory-changed')
    if (plan.restartPid === process.pid) return { state: 'restart-required' }
    const bundles = await this.manager.listBundles()
    const suite = installed(bundles, SUITE)
    if (await this.confirmCompleted(plan, bundles)) return { state: 'complete' }
    if (suite && !exact(suite, plan.suite.version, suite.enabled)) throw new Error('suite-inventory-changed')

    const switched = plan.members.filter(member => installed(bundles, member.name)?.enabled)
    if (suite?.enabled && switched.length) throw new Error('suite-inventory-changed')
    await beforeSwitch()
    progress('restoring')
    const restored = await this.restore(plan, switched, plan.members.filter(member => !member.existing), true, !suite).catch(() => false)
    if (restored) await this.journal.saveSuiteRecovery(null)
    return restored ? { state: 'restored' } : { state: 'restore-failed', reason: 'suite-inventory-changed' }
  }

  async restore(plan, switched, added, suiteDisabled, suiteRemovalStarted) {
    if (suiteDisabled) {
      for (const member of switched.reverse()) {
        const bundle = installed(await this.manager.listBundles(), member.name)
        if (exact(bundle, member.version, false)) continue
        if (!exact(bundle, member.version, true) || !applied(await this.manager.setBundleEnabled(member.name, false))) return false
      }
    }
    let removed = true
    for (const member of added.reverse()) {
      const bundle = installed(await this.manager.listBundles(), member.name)
      if (!bundle) continue
      if (!exact(bundle, member.version, false) || !applied(await this.manager.removeBundle(member.name))) removed = false
    }
    if (suiteDisabled) {
      const suite = installed(await this.manager.listBundles(), SUITE)
      if (!suite && suiteRemovalStarted) {
        const version = plan.suite.version
        const result = await this.manager.installBundle(SUITE + '@' + version, {
          enabled: true, saveExact: true, expected: { name: SUITE, version },
        })
        if (!applied(result)) return false
      } else if (!exact(suite, plan.suite.version, true)
        && (!exact(suite, plan.suite.version, false) || !applied(await this.manager.setBundleEnabled(SUITE, true)))) return false
    }
    return removed && exact(installed(await this.manager.listBundles(), SUITE), plan.suite.version, true)
  }
}
