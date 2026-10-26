import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFile } from 'node:fs/promises'
import { wrapClient, unwrapClient } from '../lib/build.js'
import { VERSION, createHandler, hostActivity } from '../lib/index.js'
import { UpdateRegistry } from '../lib/registry.js'
import { boundedBody } from '../lib/io.js'

test('client wrapping is idempotent and preserves the original module factory, permissions and apply return', () => {
  const source = 'window.__ModuleLoader__.load({id:"existing", factory:require=>({inject:["slots"], apply(ctx){ctx.original++;return ()=>{ctx.cleaned++}}})});\n'
  const wrapped = wrapClient(source, 'dsh-cite')
  assert.equal(wrapClient(wrapped, 'dsh-cite'), wrapped)
  assert.equal(unwrapClient(wrapped), source)
  const definitions = [], window = { __ModuleLoader__: { load: def => definitions.push(def) } }
  vm.runInNewContext(wrapped, { window })
  assert.equal(definitions.length, 1); assert.equal(definitions[0].id, 'existing')
  const plugin = definitions[0].factory(() => ({})), injections = [], ctx = { original: 0, cleaned: 0, inject(names) { injections.push(names) } }
  assert.deepEqual([...plugin.inject], ['slots'])
  const cleanup = plugin.apply(ctx); cleanup()
  assert.equal(ctx.original, 1); assert.equal(ctx.cleaned, 1)
  assert.deepEqual([...injections[0]], ['slots', 'locale', 'remote', 'remote.pluginManager'])
})

test('wrapping uses syntax positions rather than changing strings or nested parentheses', () => {
  const source = '/* window.__ModuleLoader__.load(fake) */\n(()=>{const text="window.__ModuleLoader__.load( } )";window.__ModuleLoader__.load({id:"sample",factory:r=>({apply(){return text}})})})();\n'
  const defs = [], wrapped = wrapClient(source, 'dsh-cite')
  vm.runInNewContext(wrapped, { window: { __ModuleLoader__: { load: def => defs.push(def) } } })
  assert.equal(defs[0].factory(() => ({})).apply({}), 'window.__ModuleLoader__.load( } )')
  assert.equal(unwrapClient(wrapped), source)
  assert.match(wrapped, new RegExp('"version":"' + VERSION.replaceAll('.', '\\.') + '"'))
  assert.throws(() => wrapClient(source, 'arbitrary-package'), /Unknown/)
})

test('an existing workbench receives its own update button without a global sidebar or page', async () => {
  const source = 'window.__ModuleLoader__.load({id:"dsh-cite",factory:r=>({apply(){},render(){return h(W.Page,{title:"Library",actions:action},"body")}})});\n'
  const wrapped = wrapClient(source, 'dsh-cite')
  assert.match(wrapped, /__stardustUpdatesPage\(React,\{title:"Library",actions:action\},"dsh-cite"\)/)
  assert.match(wrapped, /"hasWorkbench":true/)
  assert.equal(unwrapClient(wrapped), source)
  assert.equal(wrapClient(wrapped, 'dsh-cite'), wrapped)
  const bootstrap = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  assert.doesNotMatch(bootstrap, /sidebar\.panellist|W\.register\(/)
  assert.doesNotMatch(bootstrap, /Update all|更新全部/)
})

test('draft guard remains active when a dirty panel closes and clears only on a clean mount of that plugin', async () => {
  const context = vm.createContext({ Symbol, Map, Set }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  const mounts = []
  function mount(dirty, busy = false) {
    const cleanup = [], React = { useRef: () => ({ current: null }), useLayoutEffect: fn => fn(), useEffect: fn => { const dispose = fn(); if (dispose) cleanup.push(dispose) } }
    context.__stardustUpdatesGuard(React, 'dsh-ppt', { dirty, busy, retainOnClose: true })
    const unmount = () => cleanup.forEach(fn => fn()); mounts.push(unmount); return unmount
  }
  const unmount = mount(true); unmount()
  const pool = context.__stardustUpdatesGuards()
  assert.equal([...pool.values.values()].some(value => value.orphan && value.dirty), true)
  mount(false)
  assert.equal([...pool.values.values()].some(value => value.dirty || value.busy), false)
  mounts.forEach(fn => fn())
})

test('a temporary native removal keeps the same plugin update panel and Suite context visible until completion', async () => {
  const context = vm.createContext({ Symbol, Map, Set }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  const known = new Map(), suite = { name: '@stardustlc/dsh-suite', version: '0.3.1' }, cite = { name: 'dsh-cite', bundledBy: suite.name, version: '0.6.1' }
  context.__stardustUpdatesDisplayRows({ rows: [suite, cite], job: null }, known)
  const installing = context.__stardustUpdatesDisplayRows({ rows: [], job: { name: suite.name, state: 'installing' } }, known)
  assert.equal(installing.rows.length, 2); assert.ok(installing.rows.every(row => row.updating))
  const complete = context.__stardustUpdatesDisplayRows({ rows: [], job: { name: suite.name, state: 'complete' } }, known)
  assert.equal(complete.rows.length, 0)
})

test('HTTP mutation requires custom header, JSON and explicit manual consent; package names stay bounded', async () => {
  const calls = [], engine = { async snapshot() { return { preferences: { autoInstall: false } } }, async start(input) { calls.push(input); return { id: 'job' } } }
  const handler = createHandler(engine, {})
  const request = (body, extra = {}) => new Request('http://localhost/api/stardustlc/plugin-updates', { method: 'POST', headers: { 'content-type': 'application/json', ...extra }, body: JSON.stringify(body) })
  assert.equal((await handler(request({ action: 'install' }))).status, 400)
  assert.equal((await handler(request({ action: 'install', name: 'dsh-cite', version: '0.7.0' }, { 'x-stardustlc-updates': '1' }))).status, 400)
  assert.equal(calls.length, 0)
  assert.equal((await handler(request({ action: 'install', name: 'dsh-cite', version: '0.7.0', confirmation: 'update-installed-plugin' }, { 'x-stardustlc-updates': '1' }))).status, 200)
  assert.equal(calls.length, 1)
  const huge = request({ action: 'state', text: 'x'.repeat(17000) }, { 'x-stardustlc-updates': '1' })
  assert.equal((await handler(huge)).status, 413)
})

test('host activity uses public agent/job statuses and fails closed for unknown or throwing services', () => {
  const ctx = services => ({ get: name => services[name] })
  assert.deepEqual(hostActivity(ctx({ agents: { list: () => [] }, jobs: { list: () => [] } })), { known: true, busy: false, agents: 0, jobs: 0 })
  assert.equal(hostActivity(ctx({ agents: { list: () => [{ status: 'running' }] } })).busy, true)
  assert.equal(hostActivity(ctx({ agents: { list: () => [] }, jobs: { list: () => [{ status: 'stopping' }] } })).busy, true)
  assert.equal(hostActivity(ctx({ agents: { list: () => [{ status: 'mystery' }] } })).known, false)
  assert.equal(hostActivity(ctx({ agents: { list() { throw Error('unavailable') } } })).known, false)
})

test('registry and note reads have deadlines even if a transport ignores AbortSignal', async () => {
  const keepAlive = setTimeout(() => {}, 500)
  try {
    const registry = new UpdateRegistry({ fetchImpl: () => new Promise(() => {}), timeoutMs: 20 })
    await assert.rejects(registry.metadata('dsh-cite'), /registry-unavailable/)
    await assert.rejects(registry.notes('dsh-cite', '0.6.1'), /aborted|timeout/i)
    const controller = new AbortController(), body = new ReadableStream({ pull: () => new Promise(() => {}) })
    setTimeout(() => controller.abort(new Error('body-timeout')), 15)
    await assert.rejects(boundedBody(body, 128, controller.signal), /body-timeout/)
  } finally { clearTimeout(keepAlive) }
})

test('registry fallback is explicit, bounded, and notes render only the exact changelog section', async () => {
  const urls = [], registry = new UpdateRegistry({ fetchImpl: async url => {
    urls.push(url)
    if (url.startsWith('https://registry.npmjs.org')) return new Response('offline', { status: 503 })
    if (url.startsWith('https://registry.npmmirror.com')) return Response.json({ marker: 'mirror' })
    return new Response('# Changelog\n\n## 0.6.2 (2026-10-26)\nNew patch\n<script>unsafe()</script>\n\n## 0.6.1\nPrevious release\n')
  } })
  const metadata = await registry.metadata('dsh-cite')
  assert.equal(metadata.registry, 'https://registry.npmmirror.com'); assert.equal(metadata.document.marker, 'mirror')
  const notes = await registry.notes('dsh-cite', '0.6.2')
  assert.match(notes.text, /New patch/); assert.doesNotMatch(notes.text, /Previous release/)
  assert.match(notes.url, /^https:\/\/github.com\/STARDUSTLC666\/dsh-cite\/blob\/master\/CHANGELOG.md$/)
  const absent = await registry.notes('dsh-cite', '0.6.3'); assert.equal(absent.text, null)
  await assert.rejects(registry.metadata('unowned-package'), /unknown-package/)
})
