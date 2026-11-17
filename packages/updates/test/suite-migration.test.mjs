import assert from 'node:assert/strict'
import { test } from 'node:test'
import { UpdateCoordinator } from '../lib/coordinator.js'
import { SUITE } from '../lib/policy.js'
import { SuiteMigration } from '../lib/suite-migration.js'

const pins = { 'dsh-cite': '0.6.1', 'dsh-rss': '0.8.3' }
const suiteVersion = '0.11.7'
const rows = Object.keys(pins).map(name => ({ rowId: name.slice(4), moduleName: name, entryId: name.slice(4) }))

function fixture({ failEnable, failInspection, journal, retryAtStartup } = {}) {
  const events = []
  const bundles = new Map()
  function add(name, version, enabled) {
    bundles.set(name, { name, version, installed: true, availability: 'profile', enabled,
      source: name + '@' + version, rows: (name === SUITE ? rows : rows.filter(row => row.moduleName === name)) })
  }
  add(SUITE, suiteVersion, true)
  const manager = {
    listBundles: async () => [...bundles.values()].map(row => ({ ...row })),
    listPlugins: async () => [...bundles.values()].filter(entry => entry.enabled).flatMap(entry =>
      entry.rows.map(row => ({ entryId: row.entryId, enabled: row.rowId !== 'rss',
        fiberPhase: row.rowId === 'rss' ? null : entry.name === retryAtStartup?.name && !retryAtStartup.loaded ? 'failed' : 'active' }))),
    async inspect(spec) {
      const [name, version] = spec.split('@')
      if (name === failInspection) return { status: 'refused' }
      return { status: 'accepted', name, version, registry: 'https://registry.npmjs.org', bundle: true }
    },
    async installBundle(spec, { enabled, expected }) {
      assert.equal(spec, expected.name + '@' + expected.version)
      if (expected.name !== SUITE) assert.notEqual(bundles.get(SUITE)?.enabled, true)
      events.push(['install', expected.name, expected.version, enabled])
      add(expected.name, expected.version, enabled)
      return { application: 'applied' }
    },
    async setBundleEnabled(name, enabled) {
      if (name !== SUITE && enabled) assert.equal(bundles.has(SUITE), false)
      events.push(['enable', name, enabled])
      if (name === failEnable && enabled) return { application: 'failed' }
      if (name === retryAtStartup?.name && enabled) {
        if (retryAtStartup.persisted) bundles.get(name).enabled = enabled
        return { application: 'failed', error: { code: 'operation-error', diagnostic: 'cite (dsh-cite): failed to import: missing export' } }
      }
      bundles.get(name).enabled = enabled
      return { application: 'applied' }
    },
    async removeBundle(name) {
      assert.equal(bundles.get(name).enabled, false)
      if (name === SUITE) assert.ok([...bundles.values()].every(bundle => !bundle.enabled))
      events.push(['remove', name])
      bundles.delete(name)
      return { application: 'applied' }
    },
  }
  const migration = new SuiteMigration(manager, async () => ({ name: SUITE, version: suiteVersion, dependencies: pins }), () => true, journal)
  const run = () => migration.run({ requestId: 'fixture', signal: new AbortController().signal,
    beforeSwitch: async () => { assert.equal(bundles.get(SUITE).enabled, true) }, progress() {} })
  return { run, add, bundles, events, migration }
}

test('Suite migration removes the old owner before loading the same component IDs independently', async () => {
  const { run, bundles, events } = fixture()
  assert.equal((await run()).state, 'complete')
  assert.deepEqual([...bundles.values()].map(bundle => [bundle.name, bundle.version, bundle.enabled]),
    Object.entries(pins).map(([name, version]) => [name, version, true]))
  assert.deepEqual(events, [
    ['enable', SUITE, false], ['install', 'dsh-cite', '0.6.1', false], ['install', 'dsh-rss', '0.8.3', false],
    ['remove', SUITE], ['enable', 'dsh-cite', true], ['enable', 'dsh-rss', true],
  ])
})

test('a failed activation reinstalls the original Suite after undoing independent bundles', async () => {
  const { run, bundles, events } = fixture({ failEnable: 'dsh-rss' })
  assert.equal((await run()).state, 'restored')
  assert.deepEqual([...bundles.keys()], [SUITE])
  assert.deepEqual(events.at(-1), ['install', SUITE, suiteVersion, true])
})

test('a package refused during preflight leaves the installed Suite running', async () => {
  const { run, bundles, events } = fixture({ failInspection: 'dsh-rss' })
  assert.equal((await run()).state, 'restored')
  assert.deepEqual([...bundles.keys()], [SUITE])
  assert.deepEqual(events, [])
})

test('Suite startup verifies both saved and live selections after a transient import failure', async () => {
  let saved
  const journal = { readSuiteRecovery: async () => saved, saveSuiteRecovery: async plan => { saved = plan } }
  const retryAtStartup = { name: 'dsh-cite', persisted: true, loaded: false }
  const { run, bundles, migration, events } = fixture({ journal, retryAtStartup })
  const coordinator = () => new UpdateCoordinator({ suiteMigration: migration, store: {
    readCache: async () => null, read: async () => ({ error: 'preferences-unreadable' }),
  } })
  assert.equal((await run()).state, 'restart-required')
  assert.deepEqual([...bundles.values()].map(bundle => [bundle.name, bundle.version, bundle.enabled]),
    Object.entries(pins).map(([name, version]) => [name, version, true]))
  assert.equal(saved.restartPid, process.pid)
  assert.deepEqual(events.at(-1), ['enable', 'dsh-rss', true])
  const before = coordinator()
  await before.initialize()
  assert.deepEqual(before.suiteRecovery, { version: suiteVersion, restartRequired: true })
  assert.equal((await migration.recover({})).state, 'restart-required')

  saved.restartPid = process.pid + 1
  const after = coordinator()
  await after.initialize()
  assert.deepEqual(after.suiteRecovery, { version: suiteVersion, awaitingVerification: true })
  assert.ok(saved)
  retryAtStartup.loaded = true
  await after.tick()
  assert.equal(after.suiteRecovery, null)
  assert.equal(saved, null)
})

test('a failed import without a saved selection rolls back', async () => {
  let saved
  const journal = { readSuiteRecovery: async () => saved, saveSuiteRecovery: async plan => { saved = plan } }
  const { run, bundles } = fixture({ journal, retryAtStartup: { name: 'dsh-cite', persisted: false } })
  assert.equal((await run()).state, 'restored')
  assert.deepEqual([...bundles.keys()], [SUITE])
  assert.equal(saved, null)
})

test('a saved conversion can recover after the Host stopped between removal and activation', async () => {
  let saved
  const journal = { readSuiteRecovery: async () => saved, saveSuiteRecovery: async plan => { saved = plan } }
  const { add, bundles, migration, events } = fixture({ journal })
  saved = { suite: { version: suiteVersion }, members: Object.entries(pins).map(([name, version]) => ({ name, version, existing: false })),
    rows: rows.map(row => [JSON.stringify([row.rowId, row.moduleName]), row.rowId !== 'rss']) }
  bundles.delete(SUITE)
  add('dsh-cite', '0.6.1', true)
  add('dsh-rss', '0.8.3', false)
  const result = await migration.recover({ beforeSwitch: async () => {}, progress() {} })
  assert.equal(result.state, 'restored')
  assert.deepEqual([...bundles.keys()], [SUITE])
  assert.equal(saved, null)
  assert.deepEqual(events.at(-1), ['install', SUITE, suiteVersion, true])
})
