import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { UpdateCoordinator } from './coordinator.js'
import { UpdateStore } from './store.js'
import { UpdateRegistry } from './registry.js'
import { NativeInstaller } from './installer.js'
import { boundedBody } from './io.js'
import { PACKAGES, SUITE } from './policy.js'

// Shared host/client protocol version. UI-only package patches retain it.
export const VERSION = '0.1.0'
export const ROUTE = '/api/stardustlc/plugin-updates'
const POOL = Symbol.for('stardustlc.plugin-updates.host.v1')
const HOST_REVISION = 4
function roots() { return globalThis[POOL] ??= new WeakMap() }
const get = (ctx, name) => { try { return ctx.get?.(name) } catch { return undefined } }
const response = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } })

/** Public live-agent and job projections. Unknown states block, rather than imply idle. */
export function hostActivity(ctx) {
  try {
    const agents = get(ctx, 'agents')
    if (typeof agents?.list !== 'function') return { known: false, busy: true, agents: 0, jobs: 0 }
    const list = agents.list()
    if (!Array.isArray(list) || list.some(agent => !['idle', 'running'].includes(agent.status))) return { known: false, busy: true, agents: 0, jobs: 0 }
    const jobs = get(ctx, 'jobs'), views = typeof jobs?.list === 'function' ? jobs.list() : []
    if (!Array.isArray(views) || views.some(job => !['running', 'stopping', 'completed', 'killed', 'failed'].includes(job.status))) return { known: false, busy: true, agents: 0, jobs: 0 }
    const activeAgents = list.filter(agent => agent.status === 'running').length, activeJobs = views.filter(job => ['running', 'stopping'].includes(job.status)).length
    return { known: true, busy: activeAgents + activeJobs > 0, agents: activeAgents, jobs: activeJobs }
  } catch { return { known: false, busy: true, agents: 0, jobs: 0 } }
}

/** Exact Connection routes admit only owner Peers; the transport owns Host/Origin and browser authentication checks. */
export function createHandler(engine, registry) {
  return async request => {
    try {
      if (request.method !== 'POST') return response({ ok: false, code: 'invalid-request' }, 400)
      const signal = AbortSignal.any([request.signal, AbortSignal.timeout(10000)])
      const body = request.body ? await boundedBody(request.body, 16384, signal) : '{}'
      if (request.headers.get('x-stardustlc-updates') !== '1' || !/^application\/json(?:;|$)/i.test(request.headers.get('content-type') ?? '')) return response({ ok: false, code: 'invalid-request' }, 400)
      const input = JSON.parse(body)
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid-request')
      let value
      switch (input.action) {
        case 'state': value = await engine.snapshot(); break
        case 'check': value = await engine.check(true, input.name); break
        case 'preferences': value = await engine.changePreferences(input); break
        case 'ignore': case 'later': value = await engine.choice(input); break
        case 'heartbeat': engine.heartbeat(input); value = true; break
        case 'client-close': engine.closeClient(input.id); value = true; break
        case 'reconfirm-windows': value = await engine.reconfirmWindows(input); break
        case 'install':
          if (input.confirmation !== 'update-installed-plugin') throw new Error('manual-consent-required')
          value = await engine.start(input); break
        case 'cancel': value = await engine.cancel(input.id); break
        case 'notes': {
          const row = engine.rows.find(row => row.name === input.name)
          if (!row?.release || row.release.version !== input.version) throw new Error('check-first')
          value = await registry.notes(input.name, input.version, request.signal); break
        }
        default: throw new Error('invalid-request')
      }
      return response({ ok: true, value })
    } catch (error) {
      const code = /^[a-z][a-z0-9-]{1,55}$/.test(error?.message ?? '') ? error.message : 'operation-failed'
      return response({ ok: false, code }, code === 'preferences-conflict' ? 409 : ['busy', 'page-dirty', 'page-busy', 'page-not-ready', 'activity-unknown'].includes(code) ? 423 : code === 'request-too-large' ? 413 : 400)
    }
  }
}

function scheduleStop(record) {
  if (record.refs.size || record.stopping || record.timer) return
  record.timer = setTimeout(() => {
    record.timer = null
    if (record.refs.size || record.stopping || record.engine?.jobPromise) return
    record.stopping = true
    record.stopPromise = Promise.resolve(record.fiber?.dispose?.()).catch(() => {})
  }, 1000)
  record.timer.unref?.()
}

function createCoordinator(root, profile, refs = new Map(), inherited) {
  const record = { refs, version: VERSION, revision: HOST_REVISION, engine: null, fiber: null, stopping: false, timer: null }
  roots().set(profile, record)
  record.fiber = root.plugin({
    name: 'stardustlc-plugin-update-coordinator',
    inject: ['profileContext', 'connection', 'pluginManager', 'agents', 'loader'],
    async apply(owner) {
      owner.effect(() => async () => {
        record.stopping = true
        await record.engine?.dispose()
        if (roots().get(profile) === record) roots().delete(profile)
      })
      const manager = get(owner, 'pluginManager'), connection = get(owner, 'connection')
      const boot = await get(owner, 'loader').import('@deepseek-ai/dsh-app-boot')
      if (typeof boot.getDshRuntimeVersion !== 'function') return
      const store = new UpdateStore(profile.dir), registry = new UpdateRegistry()
      const installer = new NativeInstaller(manager, {
        getBundle: async name => (await manager.listBundles()).find(bundle => bundle.name === name),
        canProceed: () => engine.ensureIdle({ automatic: engine.job?.mode === 'automatic' }),
      })
      const engine = new UpdateCoordinator({ manager, store, registry, installer, activity: async () => hostActivity(owner), runtimeVersion: boot.getDshRuntimeVersion(), autoReady: rows => {
        const participants = new Set(record.refs.values())
        return participants.size > 0 && rows.every(row => !row.enabled || row.name === SUITE || participants.has(row.name))
      } })
      record.engine = engine
      await engine.initialize()
      if (inherited) Object.assign(engine, inherited)
      owner.on?.('plugin-manager/update-state', ({ requestId, step }) => engine.progress(requestId, step))
      owner.on?.('plugin-manager/install-state', ({ requestId, phase }) => engine.progress(requestId, phase))
      owner.effect(() => connection.fetch.register({ path: ROUTE, methods: ['POST'], requestBody: 'streaming', fetch: createHandler(engine, registry) }))
      let ticking = false
      const tick = async () => {
        if (ticking || record.stopping) return
        if (!record.refs.size) { scheduleStop(record); return }
        ticking = true
        try { await engine.tick() } catch { /* The next manual check can report bounded failures. */ }
        finally { ticking = false }
      }
      owner.effect(() => {
        const timer = setInterval(() => { void tick() }, 30000), start = setTimeout(() => { void tick() }, 10000)
        timer.unref?.(); start.unref?.()
        return () => { clearInterval(timer); clearTimeout(start) }
      })
    },
  })
  void Promise.resolve(record.fiber).catch(() => {
    record.stopping = true
    if (roots().get(profile) === record) roots().delete(profile)
  })
  return record
}

function upgradeCoordinator(root, profile, record) {
  if (record.version !== VERSION || record.revision >= HOST_REVISION || record.upgrade) return
  record.upgrade = Promise.resolve(record.fiber).then(async () => {
    const engine = record.engine
    while (record.refs.size && !record.stopping && (engine?.starting || engine?.jobPromise || engine?.checkGate)) {
      await (engine.jobPromise ?? engine.checkGate ?? delay(50))
    }
    if (!record.refs.size || record.stopping || roots().get(profile) !== record || ['unknown', 'restore-failed'].includes(engine?.job?.state)) return
    record.stopping = true
    record.stopPromise = record.upgrade
    clearTimeout(record.timer)
    const inherited = engine && { clients: engine.clients, job: engine.job, history: engine.history, pendingRestart: engine.pendingRestart }
    if (engine) engine.updaterRestart = true
    await record.fiber.dispose()
    if (roots().get(profile) === record) roots().delete(profile)
    if (!roots().get(profile) && record.refs.size) createCoordinator(root, profile, record.refs, inherited)
  }).catch(() => {})
}

/** Join the profile's update service, with one reference per participating plugin. */
export function registerUpdates(ctx, participant) {
  if (!Object.hasOwn(PACKAGES, participant?.name) || typeof ctx?.inject !== 'function') return
  ctx.inject(['profileContext', 'connection', 'pluginManager', 'agents', 'loader'], host => {
    const root = host.root ?? host, profile = get(host, 'profileContext')
    if (!profile?.dir || get(root, 'profileContext') !== profile || typeof root.plugin !== 'function') return
    const manager = get(host, 'pluginManager'), connection = get(host, 'connection')
    if (typeof connection?.fetch?.register !== 'function' || ['listBundles', 'installBundle', 'removeBundle', 'cancelInstall'].some(name => typeof manager?.[name] !== 'function')) return
    const record = roots().get(profile) ?? createCoordinator(root, profile)
    if (record.stopping) {
      if (!record.stopPromise) return
      let disposed = false
      host.effect(() => () => { disposed = true })
      void Promise.resolve(record.stopPromise).then(() => { if (!disposed && roots().get(profile) !== record) registerUpdates(host, participant) })
      return
    }
    if (record.version !== VERSION && record.engine) { record.engine.pendingRestart = true; record.engine.updaterRestart = true }
    clearTimeout(record.timer)
    record.timer = null
    const ref = randomUUID()
    record.refs.set(ref, participant.name)
    upgradeCoordinator(root, profile, record)
    host.effect(() => () => {
      record.refs.delete(ref)
      const current = roots().get(profile)
      if (current?.refs !== record.refs || current.refs.size || current.stopping) return
      if (current.engine?.jobPromise) void current.engine.jobPromise.finally(() => scheduleStop(current))
      else scheduleStop(current)
    })
  })
}
