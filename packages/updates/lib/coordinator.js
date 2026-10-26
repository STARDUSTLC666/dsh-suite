import { randomUUID } from 'node:crypto'
import semver from 'semver'
import { PACKAGES, CHECK_INTERVAL, PLAN_MAX_AGE, preferences, packagePreferences, targets, releaseOf, eligibleAuto } from './policy.js'

const ERROR_CODES = new Set(['preferences-unreadable', 'preferences-conflict', 'invalid-preferences', 'busy', 'activity-unknown', 'page-not-ready', 'page-dirty', 'page-busy', 'restart-required', 'check-first', 'unknown-package', 'source-not-registry', 'managed-by-suite', 'invalid-release', 'release-changed', 'no-update', 'auto-consent-required', 'invalid-request', 'too-many-requests', 'operation-unconfirmed'])
const containedError = error => ERROR_CODES.has(error?.message) ? error.message : 'operation-failed'
const successful = result => result && !result.error && ['applied', 'restart-required'].includes(result.application)
const safeResult = value => value ? { changed: value.changed === true, application: value.application, ...(typeof value.error?.code === 'string' && /^[a-z0-9-]{1,80}$/.test(value.error.code) ? { error: { code: value.error.code } } : {}), ...(typeof value.packageResult?.kind === 'string' ? { failureKind: value.packageResult.kind } : {}) } : null
function validateHeartbeat(value) {
  if (!value || !/^[0-9a-f-]{36}$/i.test(value.id) || !Number.isSafeInteger(value.idleForMs) || value.idleForMs < 0 || value.idleForMs > 86400000 || typeof value.dirty !== 'boolean' || typeof value.busy !== 'boolean') throw new Error('invalid-request')
}

export class UpdateCoordinator {
  constructor({ manager, store, registry, installer, activity, runtimeVersion, now = Date.now, autoReady = () => true }) {
    Object.assign(this, { manager, store, registry, installer, activity, runtimeVersion, now, autoReady })
    this.rows = []; this.checkedAt = 0; this.checking = false; this.job = null; this.history = []; this.clients = new Map(); this.abort = new AbortController(); this.pendingRestart = false; this.lastManualChecks = new Map(); this.initialized = false; this.automaticAttempts = {}
  }
  async initialize() {
    const cache = await this.store.readCache()
    if (cache) { this.checkedAt = cache.checkedAt; this.rows = cache.rows.filter(row => Object.hasOwn(PACKAGES, row.name)); this.automaticAttempts = Object.fromEntries(Object.entries(cache.automaticAttempts ?? {}).filter(([name, version]) => Object.hasOwn(PACKAGES, name) && semver.valid(version))) }
    this.initialized = true
  }
  async current() {
    const bundles = targets(await this.manager.listBundles())
    this.rows = bundles.map(row => {
      const old = this.rows.find(item => item.name === row.name)
      const release = old?.version === row.version ? old.release : undefined
      return { ...row, ...(old?.version === row.version ? { release, error: old.error, checkedAt: old.checkedAt } : {}), available: !!release?.compatible && !!semver.valid(release.version) && !!semver.valid(row.version) && semver.gt(release.version, row.version) }
    })
    return this.rows
  }
  async clientStates() {
    const now = this.now()
    return [...this.clients.values()].map(client => ({ ...client, fresh: now - client.seenAt <= 45000 }))
  }
  heartbeat(value) {
    validateHeartbeat(value)
    if (!this.clients.has(value.id) && this.clients.size >= 32) throw new Error('too-many-requests')
    const now = this.now()
    this.clients.set(value.id, { id: value.id, seenAt: now, dirty: value.dirty, busy: value.busy, lastInteraction: now - value.idleForMs })
  }
  closeClient(id) { if (typeof id !== 'string') throw new Error('invalid-request'); this.clients.delete(id) }
  async reconfirmWindows(input) {
    validateHeartbeat(input)
    if (input.confirmation !== 'other-stale-windows-are-closed') throw new Error('manual-consent-required')
    const now = this.now()
    for (const [id, value] of this.clients) if (id !== input.id && now - value.seenAt > 45000) this.clients.delete(id)
    this.heartbeat(input)
    return this.snapshot()
  }
  async snapshot() {
    const [state, rows, activity, clients] = await Promise.all([this.store.read(), this.current(), this.activity(), this.clientStates()])
    const prefs = state.value
    return { preferences: prefs, preferenceError: state.error, rows, checkedAt: this.checkedAt, checking: this.checking, checkingNames: [...this.checkNames ?? []], job: this.job ? structuredClone(this.job) : null, history: structuredClone(this.history), automaticAttempts: { ...this.automaticAttempts }, activity, pages: { known: clients.length > 0 && clients.every(c => c.fresh), dirty: clients.some(c => c.dirty), busy: clients.some(c => c.busy), clients: clients.map(({ id, busy, dirty, fresh }) => ({ id, busy, dirty, fresh })) }, pendingRestart: this.pendingRestart, updaterRestart: !!this.updaterRestart, autoReady: this.autoReady(rows), runtimeVersion: this.runtimeVersion }
  }
  async changePreferences(input) {
    if (!input || !Object.hasOwn(PACKAGES, input.name) || !Number.isSafeInteger(input.revision) || !input.changes || typeof input.changes !== 'object' || Array.isArray(input.changes)) throw new Error('invalid-request')
    await this.current()
    if (!this.rows.some(row => row.name === input.name)) throw new Error('source-not-registry')
    const allowed = ['checkEnabled', 'autoInstall']
    if (Object.keys(input.changes).some(key => !allowed.includes(key) || typeof input.changes[key] !== 'boolean')) throw new Error('invalid-request')
    if (input.changes.autoInstall === true && input.consent !== 'enable-idle-patch-updates') throw new Error('auto-consent-required')
    const next = await this.store.change(input.revision, current => {
      const updated = { ...packagePreferences(current, input.name), ...input.changes }
      if (!updated.checkEnabled) updated.autoInstall = false
      return preferences({ ...current, packages: { ...current.packages, [input.name]: updated } })
    })
    const changed = packagePreferences(next, input.name)
    if (!changed.checkEnabled && !this.checkManual && this.checkNames?.has(input.name)) this.checkAbort?.abort(new Error('checks-disabled'))
    if (!changed.autoInstall && this.job?.name === input.name && this.job.mode === 'automatic' && ['waiting', 'verifying', 'installing'].includes(this.job.state)) await this.cancel(this.job.id)
    return next
  }
  async choice(input) {
    if (!input || !Object.hasOwn(PACKAGES, input.name) || !Number.isSafeInteger(input.revision)) throw new Error('invalid-request')
    if (input.action === 'later') return this.store.change(input.revision, current => ({ ...current, packages: { ...current.packages, [input.name]: { ...packagePreferences(current, input.name), deferredUntil: this.now() + 86400000 } } }))
    if (input.action === 'ignore') {
      const row = this.rows.find(row => row.name === input.name)
      if (!row?.release || row.release.version !== input.version || !semver.valid(input.version)) throw new Error('invalid-request')
      return this.store.change(input.revision, current => ({ ...current, packages: { ...current.packages, [input.name]: { ...packagePreferences(current, input.name), ignoredVersion: input.version } } }))
    }
    throw new Error('invalid-request')
  }
  async check(manual = false, name) {
    if (this.checkGate) { await this.checkGate; return this.check(manual, name) }
    let finish
    this.checkGate = new Promise(resolve => { finish = resolve })
    try { return await this.performCheck(manual, name) }
    finally { this.checkGate = null; finish() }
  }
  async performCheck(manual, name) {
    if (name !== undefined && !Object.hasOwn(PACKAGES, name)) throw new Error('unknown-package')
    if (this.checkPromise) await this.checkPromise
    const state = await this.store.read()
    if (state.error) return this.snapshot()
    const rows = await this.current(), names = rows.filter(row => row.sourceKind === 'registry' && !row.bundledBy && (name === undefined || row.name === name) && (manual ? !this.lastManualChecks.has(row.name) || this.now() - this.lastManualChecks.get(row.name) >= 5000 : packagePreferences(state.value, row.name).checkEnabled && this.now() - (row.checkedAt ?? 0) >= CHECK_INTERVAL)).map(row => row.name)
    if (!names.length) return this.snapshot()
    if (manual) for (const name of names) this.lastManualChecks.set(name, this.now())
    this.checkNames = new Set(names)
    this.checking = true
    this.checkManual = manual; this.checkAbort = new AbortController()
    const signal = AbortSignal.any([this.abort.signal, this.checkAbort.signal])
    this.checkPromise = (async () => {
      const next = rows.map(row => ({ ...row }))
      for (let i = 0; i < next.length; i += 2) await Promise.all(next.slice(i, i + 2).map(async row => {
        if (!this.checkNames.has(row.name)) return
        row.release = undefined; row.error = undefined
        try {
          const source = await this.registry.metadata(row.name, signal)
          row.release = { ...releaseOf(row.name, source.document, this.runtimeVersion), registry: source.registry }
        } catch (error) { signal.throwIfAborted(); row.error = 'check-failed' }
        row.checkedAt = this.now()
      }))
      signal.throwIfAborted()
      this.rows = next; this.checkedAt = this.now(); await this.store.saveCache(next, this.checkedAt, this.automaticAttempts)
    })().catch(error => { if (!signal.aborted) throw error }).finally(() => { this.checking = false; this.checkPromise = null; this.checkAbort = null; this.checkNames = null })
    await this.checkPromise
    return this.snapshot()
  }
  async ensureIdle({ automatic = false, allowUnknownPages = false } = {}) {
    if (this.updaterRestart || automatic && this.pendingRestart) throw new Error('restart-required')
    if (automatic && (!this.autoReady(this.rows) || this.rows.some(row => row.enabled && row.loadError))) throw new Error('page-not-ready')
    const activity = await this.activity()
    if (!activity.known) throw new Error('activity-unknown')
    if (activity.busy) throw new Error('busy')
    const clients = await this.clientStates()
    if (clients.some(client => client.dirty)) throw new Error('page-dirty')
    if (clients.some(client => client.busy)) throw new Error('page-busy')
    if (clients.some(client => !client.fresh) || automatic && !clients.length || !allowUnknownPages && !clients.length) throw new Error('page-not-ready')
    return { activity, clients }
  }
  async start(input, mode = 'manual') {
    if (this.starting) throw new Error('busy')
    this.starting = true
    try { return await this.begin(input, mode) } finally { this.starting = false }
  }
  async begin(input, mode) {
    if (!input || !Object.hasOwn(PACKAGES, input.name) || !semver.valid(input.version)) throw new Error('invalid-request')
    if (this.job && ['verifying', 'installing', 'cancelling', 'unknown', 'restore-failed'].includes(this.job.state)) throw new Error(['unknown', 'restore-failed'].includes(this.job.state) ? 'operation-unconfirmed' : 'busy')
    await this.current()
    const row = this.rows.find(row => row.name === input.name)
    if (!row || row.sourceKind !== 'registry') throw new Error('source-not-registry')
    if (row.bundledBy) throw new Error('managed-by-suite')
    if (!row.release || row.release.version !== input.version || this.now() - (row.checkedAt ?? 0) > PLAN_MAX_AGE) throw new Error('check-first')
    if (!row.release.compatible || !semver.gt(input.version, row.version)) throw new Error('no-update')
    const idle = await this.ensureIdle({ automatic: mode === 'automatic' })
    if (mode === 'automatic') {
      const state = await this.store.read()
      if (state.error || !eligibleAuto(row, packagePreferences(state.value, row.name), this.now(), idle.activity, idle.clients, this.pendingRestart)) return null
    }
    const controller = new AbortController(), job = { id: randomUUID(), name: row.name, from: row.version, to: input.version, mode, state: 'verifying', startedAt: this.now(), outcome: null }
    if (mode === 'automatic') {
      if (this.automaticAttempts[row.name] === row.release.version) return null
      this.automaticAttempts[row.name] = row.release.version
      await this.store.saveCache(this.rows, this.checkedAt, this.automaticAttempts)
    }
    this.job = job; this.jobAbort = controller
    this.jobPromise = this.run(row, job, controller).catch(() => {}).finally(() => { this.jobPromise = null })
    return structuredClone(job)
  }
  async run(row, job, controller) {
    const signal = AbortSignal.any([controller.signal, this.abort.signal])
    try {
      const source = await this.registry.metadata(row.name, signal), release = { ...releaseOf(row.name, source.document, this.runtimeVersion), registry: source.registry }
      if (!release.compatible || release.version !== job.to || release.integrity !== row.release.integrity) throw new Error('release-changed')
      await this.ensureIdle({ automatic: job.mode === 'automatic' })
      if (job.mode === 'automatic') {
        const prefs = await this.store.read(), activity = await this.activity(), clients = await this.clientStates()
        if (prefs.error || !eligibleAuto(row, packagePreferences(prefs.value, row.name), this.now(), activity, clients, this.pendingRestart)) { job.state = 'cancelled'; job.reason = 'automatic-disabled'; return }
      }
      signal.throwIfAborted(); job.state = 'installing'
      const outcome = await this.installer.install(row, release, job.id, signal)
      job.outcome = { native: outcome.native === true, step: outcome.step, result: safeResult(outcome.result), restore: safeResult(outcome.restore) }
      const result = outcome.result
      if (successful(result)) {
        job.state = result.application === 'restart-required' ? 'restart-required' : 'complete'
        if (result.application === 'restart-required') this.pendingRestart = true
      } else if (outcome.restore && successful(outcome.restore)) {
        job.state = 'restored'
        if (outcome.restore.application === 'restart-required') this.pendingRestart = true
      } else if (outcome.restore) job.state = 'restore-failed'
      else job.state = result?.application === 'cancelled' ? 'cancelled' : 'failed'
    } catch (error) {
      job.state = job.state === 'installing' ? 'unknown' : signal.aborted ? 'cancelled' : 'failed'
      job.reason = containedError(error)
    } finally {
      job.finishedAt = this.now(); this.history.unshift(structuredClone(job)); this.history = this.history.slice(0, 10)
      await this.current().catch(() => {})
    }
  }
  async cancel(id) {
    if (!this.job || this.job.id !== id || !['verifying', 'installing', 'cancelling'].includes(this.job.state)) return { status: 'not-running' }
    const wasInstalling = this.job.state !== 'verifying'
    this.jobAbort?.abort(new Error('cancelled'))
    if (wasInstalling) {
      this.job.state = 'cancelling'
      const result = await this.installer.cancel(id)
      return result
    }
    return { status: 'cancelled' }
  }
  async tick() {
    if (!this.initialized || this.abort.signal.aborted || this.jobPromise || ['unknown', 'restore-failed'].includes(this.job?.state)) return
    const state = await this.store.read()
    if (state.error) return
    const rows = await this.current()
    const due = rows.filter(row => row.sourceKind === 'registry' && !row.bundledBy && packagePreferences(state.value, row.name).checkEnabled && this.now() - (row.checkedAt ?? 0) >= CHECK_INTERVAL).sort((a, b) => (a.checkedAt ?? 0) - (b.checkedAt ?? 0))[0]
    if (due) await this.check(false, due.name)
    if (!this.rows.some(row => packagePreferences(state.value, row.name).autoInstall)) return
    const [activity, clients] = await Promise.all([this.activity(), this.clientStates()])
    const prefs = await this.store.read()
    if (prefs.error) return
    if (!this.autoReady(this.rows) || this.rows.some(row => row.enabled && row.loadError)) return
    const row = this.rows.find(row => this.automaticAttempts[row.name] !== row.release?.version && eligibleAuto(row, packagePreferences(prefs.value, row.name), this.now(), activity, clients, this.pendingRestart))
    if (row) await this.start({ name: row.name, version: row.release.version }, 'automatic')
  }
  async dispose() { this.abort.abort(); if (this.job && ['verifying', 'installing', 'cancelling'].includes(this.job.state)) await this.cancel(this.job.id).catch(() => {}); await Promise.allSettled([this.jobPromise, this.checkPromise].filter(Boolean)) }
}
