import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { UpdateCoordinator } from '../lib/coordinator.js'
import { UpdateStore } from '../lib/store.js'
import { NativeInstaller } from '../lib/installer.js'
import { DEFAULT_PREFERENCES, CHECK_INTERVAL, PLAN_MAX_AGE, packagePreferences, targets, releaseOf, eligibleAuto, SUITE } from '../lib/policy.js'

const integrity = 'sha512-' + Buffer.alloc(64, 7).toString('base64')
const version = (name, value = '0.6.2') => ({ 'dist-tags': { latest: value }, versions: { [value]: { name, version: value, dsh: { bundle: { patch: './cordis.patch.yml' } }, dist: { integrity }, engines: { node: '>=22', dsh: '>=0.2.1-rc.3' } } } })
const bundle = (name = 'dsh-cite', extra = {}) => ({ name, version: '0.6.1', source: name + '@0.6.1', installed: true, availability: 'profile', enabled: true, ...extra })

test('Blender Studio stays independently updatable alongside Suite', () => {
  const row = targets([bundle(SUITE), bundle('dsh-blender-studio')]).find(item => item.name === 'dsh-blender-studio')
  assert.ok(row)
  assert.equal(row.bundledBy, null)
  assert.equal(releaseOf(row.name, version(row.name), '0.2.2').compatible, true)
})
const fresh = now => ({ id: '00000000-0000-4000-8000-000000000001', seenAt: now, dirty: false, busy: false, lastInteraction: now - 180000 })

async function fixture(t, { bundles = [bundle()], busy = false } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'stardust-update-test-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const store = new UpdateStore(directory), calls = [], state = { now: 1_000_000_000, busy, bundles }, registry = { async metadata(name) { return { document: version(name), registry: 'https://registry.npmjs.org' } } }
  const manager = { async listBundles() { return state.bundles.map(b => ({ ...b })) } }
  const installer = { async install(row, release) { calls.push({ row, release }); state.bundles = state.bundles.map(b => b.name === row.name ? { ...b, version: release.version } : b); return { result: { application: 'applied', changed: true } } }, async cancel() { return { status: 'cancelled' } } }
  const coordinator = new UpdateCoordinator({ manager, store, registry, installer, activity: async () => ({ known: true, busy: state.busy }), runtimeVersion: '0.2.1-rc.3', now: () => state.now })
  await coordinator.initialize(); coordinator.clients.set(fresh(state.now).id, fresh(state.now))
  return { coordinator, calls, state, registry, store, installer, directory }
}
async function optIn(f) { return f.coordinator.changePreferences({ name: 'dsh-cite', revision: (await f.store.read()).value.revision, changes: { autoInstall: true }, consent: 'enable-idle-patch-updates' }) }

test('each plugin has independent defaults, consent, checks, deferral and ignored versions', async t => {
  const f = await fixture(t, { bundles: [bundle(), bundle('dsh-ppt')] })
  await f.coordinator.check(true)
  assert.equal(packagePreferences((await f.store.read()).value, 'dsh-ppt').autoInstall, false)
  await optIn(f)
  const state = (await f.store.read()).value
  assert.equal(packagePreferences(state, 'dsh-cite').autoInstall, true)
  assert.equal(packagePreferences(state, 'dsh-ppt').autoInstall, false)
  await f.coordinator.choice({ action: 'later', name: 'dsh-ppt', revision: 1 })
  await f.coordinator.choice({ action: 'ignore', name: 'dsh-ppt', version: '0.6.2', revision: 2 })
  const next = (await f.store.read()).value
  assert.equal(packagePreferences(next, 'dsh-cite').deferredUntil, 0)
  assert.equal(packagePreferences(next, 'dsh-cite').ignoredVersion, null)
  assert.equal(packagePreferences(next, 'dsh-ppt').ignoredVersion, '0.6.2')
  await f.coordinator.tick(); await f.coordinator.jobPromise
  assert.deepEqual(f.calls.map(call => call.row.name), ['dsh-cite'])
})

test('a manual check fetches only the selected plugin; simultaneous checks remain distinct', async t => {
  const f = await fixture(t, { bundles: [bundle(), bundle('dsh-ppt')] }), names = []
  f.registry.metadata = async name => { names.push(name); await new Promise(resolve => setImmediate(resolve)); return { document: version(name), registry: 'https://registry.npmjs.org' } }
  await Promise.all([f.coordinator.check(true, 'dsh-ppt'), f.coordinator.check(true, 'dsh-cite')])
  assert.deepEqual(names.sort(), ['dsh-cite', 'dsh-ppt'])
  assert.ok(f.coordinator.rows.every(row => row.release && row.checkedAt))
  await f.coordinator.changePreferences({ name: 'dsh-ppt', revision: 0, changes: { checkEnabled: false } })
  assert.equal(packagePreferences((await f.store.read()).value, 'dsh-cite').checkEnabled, true)
  assert.equal(packagePreferences((await f.store.read()).value, 'dsh-ppt').checkEnabled, false)
})

test('disconnected window protection can only be cleared by explicit owner confirmation, preserving responsive drafts', async t => {
  const f = await fixture(t), own = fresh(f.state.now), stale = { ...fresh(f.state.now), id: '00000000-0000-4000-8000-000000000002', seenAt: f.state.now - 60000, dirty: true }, responsive = { ...fresh(f.state.now), id: '00000000-0000-4000-8000-000000000003', dirty: true }
  f.coordinator.clients.set(stale.id, stale); f.coordinator.clients.set(responsive.id, responsive)
  const input = { id: own.id, idleForMs: 0, dirty: false, busy: false }
  await assert.rejects(f.coordinator.reconfirmWindows(input), /manual-consent-required/)
  assert.equal(f.coordinator.clients.size, 3)
  await f.coordinator.reconfirmWindows({ ...input, confirmation: 'other-stale-windows-are-closed' })
  assert.equal(f.coordinator.clients.has(stale.id), false)
  assert.equal(f.coordinator.clients.get(responsive.id).dirty, true)
  assert.equal(f.coordinator.clients.get(own.id).lastInteraction, f.state.now)
})

test('changing another plugin does not cancel an automatic update already verified for this plugin', async t => {
  const f = await fixture(t, { bundles: [bundle(), bundle('dsh-ppt')] }); await optIn(f); await f.coordinator.check(true)
  let proceed, signal
  f.registry.metadata = (name, abort) => new Promise(resolve => { signal = abort; proceed = () => resolve({ document: version(name), registry: 'https://registry.npmjs.org' }) })
  await f.coordinator.tick(); await new Promise(resolve => setImmediate(resolve))
  await f.coordinator.changePreferences({ name: 'dsh-ppt', revision: 1, changes: { checkEnabled: false } })
  assert.equal(signal.aborted, false)
  proceed(); await f.coordinator.jobPromise
  assert.deepEqual(f.calls.map(call => call.row.name), ['dsh-cite'])
})

test('default checks never install; enabling automatic installation needs explicit consent', async t => {
  const f = await fixture(t)
  assert.equal(packagePreferences((await f.store.read()).value, 'dsh-cite').autoInstall, false)
  await f.coordinator.tick(); assert.equal(f.calls.length, 0)
  assert.equal(f.coordinator.rows[0].release.version, '0.6.2')
  await assert.rejects(f.coordinator.changePreferences({ name: 'dsh-cite', revision: 0, changes: { autoInstall: true } }), /auto-consent-required/)
  assert.equal(packagePreferences((await f.store.read()).value, 'dsh-cite').autoInstall, false)
  await optIn(f); await f.coordinator.tick(); await f.coordinator.jobPromise
  assert.equal(f.calls.length, 1)
})

test('turning checks off cancels a background metadata read and does not persist its partial result', async t => {
  const f = await fixture(t)
  let entered
  const ready = new Promise(resolve => { entered = resolve })
  f.registry.metadata = (name, signal) => new Promise((resolve, reject) => { entered(); signal.addEventListener('abort', () => reject(signal.reason), { once: true }) })
  const checking = f.coordinator.check(false); await ready
  await f.coordinator.changePreferences({ name: 'dsh-cite', revision: 0, changes: { checkEnabled: false } })
  await checking
  assert.equal(f.coordinator.checkedAt, 0); assert.equal(f.coordinator.checking, false)
  assert.equal(f.calls.length, 0)
})

test('legacy clients and loading failures pause automatic installation', async t => {
  const f = await fixture(t); await optIn(f); f.coordinator.autoReady = () => false
  await f.coordinator.tick(); await f.coordinator.jobPromise
  assert.equal(f.calls.length, 0)
  f.coordinator.autoReady = () => true; f.state.bundles[0].error = { code: 'failed' }
  await f.coordinator.tick(); await f.coordinator.jobPromise
  assert.equal(f.calls.length, 0)
})

test('failed recovery blocks subsequent attempts; a manual restart requirement does not prevent other manual updates', async t => {
  const f = await fixture(t); await f.coordinator.check(true)
  f.installer.install = async () => ({ result: { application: 'failed' }, restore: { application: 'failed' } })
  await f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }); await f.coordinator.jobPromise
  assert.equal(f.coordinator.job.state, 'restore-failed')
  await assert.rejects(f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }), /operation-unconfirmed/)
  const second = await fixture(t); await second.coordinator.check(true); second.coordinator.pendingRestart = true
  await second.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }); await second.coordinator.jobPromise
  assert.equal(second.calls.length, 1)
})

test('turning automatic checks off also disables automatic installation but manual checks remain available', async t => {
  const f = await fixture(t); await optIn(f)
  await f.coordinator.changePreferences({ name: 'dsh-cite', revision: 1, changes: { checkEnabled: false } })
  let checks = 0; f.registry.metadata = async name => { checks++; return { document: version(name), registry: 'https://registry.npmjs.org' } }
  await f.coordinator.tick(); assert.equal(checks, 0); assert.equal(f.calls.length, 0)
  await f.coordinator.check(true); assert.equal(checks, 1)
  assert.equal(packagePreferences((await f.store.read()).value, 'dsh-cite').autoInstall, false)
})

test('busy tasks and dirty, stale, missing, busy or recently active pages block automatic installs', async t => {
  for (const mode of ['task', 'dirty', 'stale', 'missing', 'page-busy', 'recent']) {
    const f = await fixture(t); await optIn(f)
    const client = fresh(f.state.now)
    if (mode === 'task') f.state.busy = true
    if (mode === 'dirty') client.dirty = true
    if (mode === 'stale') client.seenAt -= 60000
    if (mode === 'page-busy') client.busy = true
    if (mode === 'recent') client.lastInteraction = f.state.now
    f.coordinator.clients.clear(); if (mode !== 'missing') f.coordinator.clients.set(client.id, client)
    await f.coordinator.tick(); await f.coordinator.jobPromise
    assert.equal(f.calls.length, 0, mode)
  }
})

test('Suite suppresses duplicate component updates and local links are never replaced', async t => {
  const bundles = [bundle(SUITE), bundle(), bundle('dsh-ppt', { source: 'link:E:/source/dsh-ppt' })]
  const rows = targets(bundles)
  assert.equal(rows.find(row => row.name === 'dsh-cite').bundledBy, SUITE)
  assert.equal(rows.find(row => row.name === 'dsh-ppt').sourceKind, 'local')
  const f = await fixture(t, { bundles }); await f.coordinator.check(true)
  assert.ok(f.coordinator.rows.find(row => row.name === SUITE).release)
  assert.equal(f.coordinator.rows.find(row => row.name === 'dsh-cite').release, undefined)
  assert.equal(f.coordinator.rows.find(row => row.name === 'dsh-ppt').release, undefined)
})

test('legacy patch opt-in only accepts patches, while compatible opt-in accepts minor updates and still blocks major jumps', async t => {
  const f = await fixture(t); f.registry.metadata = async name => ({ document: version(name, '0.7.0'), registry: 'https://registry.npmjs.org' })
  await optIn(f); await f.coordinator.tick(); assert.equal(f.calls.length, 0)
  await assert.rejects(f.coordinator.changePreferences({ name: 'dsh-cite', revision: 1, changes: { autoScope: 'compatible' } }), /auto-consent-required/)
  await f.coordinator.changePreferences({ name: 'dsh-cite', revision: 1, changes: { autoInstall: true, autoScope: 'compatible' }, consent: 'enable-idle-compatible-updates' })
  await f.coordinator.tick(); await f.coordinator.jobPromise
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].release.version, '0.7.0')

  f.registry.metadata = async name => ({ document: version(name, '1.0.0'), registry: 'https://registry.npmjs.org' })
  await f.coordinator.check(true, 'dsh-cite')
  await f.coordinator.tick(); await f.coordinator.jobPromise
  assert.equal(f.calls.length, 1, 'Major version jumps must still require manual confirmation')
  await f.coordinator.start({ name: 'dsh-cite', version: '1.0.0' }); await f.coordinator.jobPromise
  assert.equal(f.calls.length, 2)
})

test('Suite updates as one whole bundle via native updateBundle hot-reload while background checks run at most every 6 hours', async t => {
  assert.equal(CHECK_INTERVAL, 6 * 60 * 60 * 1000)
  const f = await fixture(t, { bundles: [bundle(SUITE, { version: '0.11.9', source: SUITE + '@0.11.9' }), bundle()] })
  const registries = []
  f.registry.metadata = async (name, _signal, requestedRegistry) => {
    registries.push([name, requestedRegistry])
    return { document: version(name, name === SUITE ? '0.11.10' : '0.6.2'), registry: 'https://registry.npmjs.org' }
  }
  await f.coordinator.tick()
  assert.deepEqual(registries, [[SUITE, undefined]])
  f.state.now += 15 * 60 * 1000
  await f.coordinator.tick()
  assert.equal(registries.length, 1, 'Background check must not repeat after 15 minutes')
  f.state.now += 6 * 60 * 60 * 1000
  await f.coordinator.tick()
  assert.equal(registries.length, 2, 'Background check runs again once 6 hours have elapsed')

  f.coordinator.clients.set(fresh(f.state.now).id, fresh(f.state.now))
  await assert.rejects(f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }), /managed-by-suite/)
  const updateCalls = []
  const nativeInstaller = new NativeInstaller({
    async updateBundle(name, nextVersion, options) {
      updateCalls.push([name, nextVersion, options])
      f.state.bundles = f.state.bundles.map(entry => entry.name === name ? { ...entry, version: nextVersion } : entry)
      return { step: 'apply', result: { application: 'applied', changed: true, version: nextVersion } }
    },
  })
  f.coordinator.installer = nativeInstaller
  await f.coordinator.start({ name: SUITE, version: '0.11.10' })
  await f.coordinator.jobPromise
  assert.equal(f.coordinator.job.state, 'complete')
  assert.equal(f.coordinator.pendingRestart, false)
  assert.equal(updateCalls.length, 1)
  assert.equal(updateCalls[0][0], SUITE)
  assert.equal(updateCalls[0][1], '0.11.10')
  assert.equal(updateCalls[0][2].registry, 'https://registry.npmjs.org')
  assert.deepEqual(registries.at(-1), [SUITE, 'https://registry.npmjs.org'])
})

test('build-blocked native update results fail cleanly without leaving unconfirmed state', async t => {
  const f = await fixture(t)
  await f.coordinator.check(true, 'dsh-cite')
  f.installer.install = async () => ({ native: true, result: { application: 'applied', changed: true, version: '0.6.2', pendingBuilds: ['dsh-cite'] } })
  await f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' })
  await f.coordinator.jobPromise
  assert.equal(f.coordinator.job.state, 'failed')
  assert.equal(f.coordinator.job.reason, 'build-blocked')
})

test('native progress, temporary removal, and the actual installed version are scoped to the admitted job', async t => {
  const f = await fixture(t, { bundles: [bundle(), bundle('dsh-ppt')] })
  let resolveInstall
  f.installer.install = async () => new Promise(resolve => { resolveInstall = resolve })
  await f.coordinator.check(true, 'dsh-cite')
  const job = await f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' })
  while (!resolveInstall) await new Promise(resolve => setImmediate(resolve))
  f.coordinator.progress(job.id, 'removing')
  f.coordinator.progress('different-job', 'restoring')
  f.state.bundles = f.state.bundles.filter(entry => entry.name !== 'dsh-cite')
  const snapshot = await f.coordinator.snapshot()
  assert.equal(snapshot.job.phase, 'removing')
  assert.equal(snapshot.rows.find(row => row.name === 'dsh-cite').updating, true)
  assert.equal(snapshot.rows.find(row => row.name === 'dsh-ppt').updating, undefined)
  f.state.bundles.push(bundle())
  resolveInstall({ native: true, result: { application: 'applied', version: '0.6.1' } })
  await f.coordinator.jobPromise
  assert.equal(f.coordinator.job.state, 'failed')
  assert.equal(f.coordinator.job.reason, 'version-mismatch')
})

test('ignore and later suppress automatic installation without hiding the available version', async t => {
  for (const action of ['ignore', 'later']) {
    const f = await fixture(t); await optIn(f); await f.coordinator.check(true)
    await f.coordinator.choice({ action, revision: 1, name: 'dsh-cite', version: '0.6.2' })
    await f.coordinator.tick(); assert.equal(f.calls.length, 0); assert.equal(f.coordinator.rows[0].release.version, '0.6.2')
    await f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }); await f.coordinator.jobPromise; assert.equal(f.calls.length, 1)
  }
})

test('two simultaneous confirmations cannot start two package operations', async t => {
  const f = await fixture(t); await f.coordinator.check(true)
  let finish; f.installer.install = async () => { f.calls.push('install'); await new Promise(resolve => { finish = resolve }); return { result: { application: 'applied' } } }
  const results = await Promise.allSettled([f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }), f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' })])
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1)
  assert.equal(f.calls.length, 1)
  finish(); await f.coordinator.jobPromise
})

test('revoking opt-in while the final version check waits prevents installation', async t => {
  const f = await fixture(t); await optIn(f); await f.coordinator.check(true)
  let continueCheck; f.registry.metadata = name => new Promise(resolve => { continueCheck = () => resolve({ document: version(name), registry: 'https://registry.npmjs.org' }) })
  await f.coordinator.tick(); await new Promise(resolve => setImmediate(resolve))
  await f.coordinator.changePreferences({ name: 'dsh-cite', revision: 1, changes: { autoInstall: false } })
  continueCheck(); await f.coordinator.jobPromise
  assert.equal(f.calls.length, 0); assert.equal(packagePreferences((await f.store.read()).value, 'dsh-cite').autoInstall, false)
})

test('unsupported metadata and host constraints never offer an installable release', () => {
  const doc = version('dsh-cite')
  assert.equal(releaseOf('dsh-cite', doc, '0.2.0').reason, 'dsh-version')
  doc.versions['0.6.2'].engines.dsh = 'not a range'
  assert.equal(releaseOf('dsh-cite', doc, '0.2.1-rc.3').compatible, false)
  assert.throws(() => releaseOf('dsh-cite', version('dsh-cite', '0.7.0-beta.1'), '0.2.1-rc.3'), /invalid-release/)
  doc.versions['0.6.2'].dist.integrity = 'unverified'
  assert.throws(() => releaseOf('dsh-cite', doc, '0.2.1-rc.3'), /invalid-integrity/)
})

test('a native update response lost after admission blocks retries instead of starting a second update', async t => {
  const f = await fixture(t); await f.coordinator.check(true)
  f.installer.install = async () => { f.calls.push('admitted'); throw new Error('Unconfirmed native completion') }
  await f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }); await f.coordinator.jobPromise
  assert.equal(f.coordinator.job.state, 'unknown')
  await assert.rejects(f.coordinator.start({ name: 'dsh-cite', version: '0.6.2' }), /operation-unconfirmed/)
  assert.equal(f.calls.length, 1)
})

test('preference writes use a revision check and unreadable state fails closed', async t => {
  const f = await fixture(t)
  const results = await Promise.allSettled([f.store.change(0, value => ({ ...value, checkEnabled: false })), f.store.change(0, value => ({ ...value, deferredUntil: 123 }))])
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1)
  await writeFile(f.store.file, '{broken')
  const state = await f.store.read(); assert.equal(packagePreferences(state.value, 'dsh-cite').autoInstall, false); assert.equal(state.error, 'preferences-unreadable')
  await assert.rejects(f.store.change(0, value => value), /preferences-unreadable/)
  assert.equal(await readFile(f.store.file, 'utf8'), '{broken')
})

test('RC.3 adapter restores the exact previous version and disabled selection on failed installation', async () => {
  const calls = [], manager = {
    async removeBundle(name) { calls.push(['remove', name]); return { application: 'applied' } },
    async installBundle(spec, options) { calls.push(['install', spec, options]); return { application: spec.endsWith('@0.6.1') ? 'applied' : 'failed', ...(spec.endsWith('@0.6.1') ? {} : { error: { code: 'network' } }) } },
  }
  const installer = new NativeInstaller(manager)
  const result = await installer.install({ name: 'dsh-cite', version: '0.6.1', enabled: false }, { version: '0.6.2', registry: 'https://registry.npmjs.org' }, 'request', new AbortController().signal)
  assert.equal(result.restore.application, 'applied'); assert.equal(calls.at(-1)[1], 'dsh-cite@0.6.1'); assert.equal(calls.at(-1)[2].enabled, false); assert.equal(calls.at(-1)[2].requestId, undefined)
})

test('RC.3 startup-owned packages install through the native service and report restart without restarting', async () => {
  const calls = [], manager = { async removeBundle() { return { application: 'failed', error: { code: 'stop-profile' } } }, async installBundle(spec, options) { calls.push([spec, options]); return { application: 'restart-required' } } }
  const installer = new NativeInstaller(manager), result = await installer.install({ name: 'dsh-cite', version: '0.6.1', enabled: true }, { version: '0.6.2' }, 'request')
  assert.equal(result.result.application, 'restart-required'); assert.equal(calls.length, 1); assert.equal(calls[0][0], 'dsh-cite@0.6.2')
})

test('manual start with checkedAt older than PLAN_MAX_AGE auto-refreshes and succeeds when requested version is still latest', async t => {
  const f = await fixture(t, { bundles: [bundle('dsh-cite', { version: '0.7.10', source: 'dsh-cite@0.7.10' })] })
  await assert.rejects(f.coordinator.start({ name: 'dsh-cite', version: '0.7.12' }), /check-first/, 'Never-checked package must still require an initial check')

  f.registry.metadata = async name => ({ document: version(name, '0.7.12'), registry: 'https://registry.npmjs.org' })
  await f.coordinator.check(true, 'dsh-cite')
  f.state.now += PLAN_MAX_AGE + 60 * 60 * 1000
  f.coordinator.clients.set(fresh(f.state.now).id, fresh(f.state.now))

  const refreshedIntegrity = 'sha512-' + Buffer.alloc(64, 9).toString('base64')
  f.registry.metadata = async name => {
    const doc = version(name, '0.7.12')
    doc.versions['0.7.12'].dist.integrity = refreshedIntegrity
    return { document: doc, registry: 'https://registry.npmjs.org' }
  }

  const job = await f.coordinator.start({ name: 'dsh-cite', version: '0.7.12' })
  await f.coordinator.jobPromise
  assert.equal(job.to, '0.7.12')
  assert.equal(f.coordinator.job.state, 'complete')
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].release.version, '0.7.12')
  assert.equal(f.calls[0].release.integrity, refreshedIntegrity)
  assert.equal(f.coordinator.rows.find(r => r.name === 'dsh-cite').checkedAt, f.state.now)
})

test('manual start with checkedAt older than PLAN_MAX_AGE updates rows and cache to newer release and rejects with release-changed', async t => {
  const f = await fixture(t, { bundles: [bundle('dsh-cite', { version: '0.7.10', source: 'dsh-cite@0.7.10' })] })
  f.registry.metadata = async name => ({ document: version(name, '0.7.12'), registry: 'https://registry.npmjs.org' })
  await f.coordinator.check(true, 'dsh-cite')

  f.state.now += PLAN_MAX_AGE + 45 * 60 * 1000
  f.coordinator.clients.set(fresh(f.state.now).id, fresh(f.state.now))
  f.registry.metadata = async name => ({ document: version(name, '0.7.15'), registry: 'https://registry.npmjs.org' })

  await assert.rejects(f.coordinator.start({ name: 'dsh-cite', version: '0.7.12' }), /release-changed/)
  assert.equal(f.calls.length, 0)
  const updatedRow = f.coordinator.rows.find(r => r.name === 'dsh-cite')
  assert.equal(updatedRow.release.version, '0.7.15')
  assert.equal(updatedRow.available, true)
  assert.equal(updatedRow.checkedAt, f.state.now)
  const cached = await f.store.readCache()
  assert.equal(cached.rows.find(r => r.name === 'dsh-cite').release.version, '0.7.15')

  await f.coordinator.start({ name: 'dsh-cite', version: '0.7.15' })
  await f.coordinator.jobPromise
  assert.equal(f.coordinator.job.state, 'complete')
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].release.version, '0.7.15')
})

test('tick refreshes stale PLAN_MAX_AGE metadata for idle autoInstall packages without stalling or looping on offline errors', async t => {
  const f = await fixture(t)
  await optIn(f)
  // First check runs while busy so automatic installation does not start yet.
  f.state.busy = true
  await f.coordinator.tick()
  assert.equal(f.calls.length, 0)
  assert.equal(f.coordinator.rows[0].release.version, '0.6.2')

  // 45 minutes later (> PLAN_MAX_AGE, < CHECK_INTERVAL), host becomes idle.
  f.state.now += PLAN_MAX_AGE + 15 * 60 * 1000
  f.state.busy = false
  f.coordinator.clients.set(fresh(f.state.now).id, fresh(f.state.now))

  // Simulate transient offline failure: tick must throttle retries instead of looping or wiping release.
  let metadataCalls = 0
  f.registry.metadata = async () => { metadataCalls++; throw new Error('registry-unavailable') }
  await f.coordinator.tick()
  assert.equal(metadataCalls, 1)
  assert.equal(f.calls.length, 0)
  assert.equal(f.coordinator.rows[0].release.version, '0.6.2')
  f.state.now += 30 * 1000
  f.coordinator.clients.set(fresh(f.state.now).id, fresh(f.state.now))
  await f.coordinator.tick()
  assert.equal(metadataCalls, 1, 'Offline auto-refresh must stay throttled during the 5-minute cooldown')

  // Once 5 minutes pass and registry is back online (even with a newer compatible patch 0.6.3), tick refreshes and installs cleanly.
  f.state.now += 5 * 60 * 1000
  f.coordinator.clients.set(fresh(f.state.now).id, fresh(f.state.now))
  f.registry.metadata = async name => { metadataCalls++; return { document: version(name, '0.6.3'), registry: 'https://registry.npmjs.org' } }
  await f.coordinator.tick()
  await f.coordinator.jobPromise
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].release.version, '0.6.3')
  assert.equal(f.coordinator.job.state, 'complete')
})
