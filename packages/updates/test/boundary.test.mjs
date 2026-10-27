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

test('an existing workbench receives an inline footer while keeping its own header actions', async () => {
  const source = 'window.__ModuleLoader__.load({id:"dsh-cite",factory:r=>({apply(){},render(){return h(W.Page,{title:"Library",actions:action},"body")}})});\n'
  const wrapped = wrapClient(source, 'dsh-cite')
  assert.match(wrapped, /__stardustUpdatesInlinePage\(React,h\(W\.Page,\{title:"Library",actions:action\},"body"\),"dsh-cite"\)/)
  assert.match(wrapped, /"hasWorkbench":true/)
  assert.equal(unwrapClient(wrapped), source)
  assert.equal(wrapClient(wrapped, 'dsh-cite'), wrapped)
  const bootstrap = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  assert.doesNotMatch(bootstrap, /sidebar\.panellist|W\.register\(/)
  assert.doesNotMatch(bootstrap, /settings\.section|function Overlay\(/)
  assert.doesNotMatch(bootstrap, /Update all|更新全部/)
})

test('inline footer preserves original page children and actions and uses the native detail slot subject', async () => {
  const context = vm.createContext({ Symbol, Map, Set }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  const actions = {}, content = [{ type: 'draft', key: 'draft' }], page = { type: 'Page', props: { actions, children: content } }
  const React = { createElement: (type, props) => ({ type, props }), cloneElement: (element, props, ...children) => ({ ...element, props: { ...element.props, ...props, children } }) }
  const withFooter = context.__stardustUpdatesInlinePage(React, page, 'dsh-cite')
  assert.equal(withFooter.props.actions, actions); assert.equal(withFooter.props.children[0], content)
  assert.equal(withFooter.props.children[1].props.name, 'dsh-cite')
  assert.equal(page.props.children, content, 'Original element must remain unchanged')
  const rows = [{ name: '@stardustlc/dsh-suite' }, { name: 'dsh-cite', bundledBy: '@stardustlc/dsh-suite' }, { name: 'dsh-ffmpeg' }]
  assert.equal(context.__stardustUpdatesDetailName({ kind: 'bundle', pkg: { name: 'dsh-ffmpeg' } }, rows), 'dsh-ffmpeg')
  assert.equal(context.__stardustUpdatesDetailName({ kind: 'row', pkg: { name: '@stardustlc/dsh-suite' }, row: { moduleName: 'dsh-cite/client' } }, rows), 'dsh-cite')
  assert.equal(context.__stardustUpdatesDetailName({ kind: 'bundle', pkg: { name: 'unrelated' } }, rows), null)
  assert.equal(context.__stardustUpdatesDetailName({ kind: 'item', id: 'dsh-ffmpeg' }, rows), null)
})

test('the previously published header wrapper migrates to a footer without duplicate controls', () => {
  const original = 'window.__ModuleLoader__.load({id:"dsh-cite",factory:r=>({render(){return h(W.Page,{title:"Library",actions:action},"draft")}})});\n'
  const legacy = '/* STARDUSTLC_UPDATE_CLIENT_BODY_START */\nwindow.__ModuleLoader__.load(__stardustUpdatesWrap({id:"dsh-cite",factory:r=>({render(){return h(W.Page,__stardustUpdatesPage(React,{title:"Library",actions:action},"dsh-cite"),"draft")}})},{}));\n\n/* STARDUSTLC_UPDATE_CLIENT_BODY_END */'
  assert.equal(unwrapClient(legacy), original)
  const wrapped = wrapClient(legacy, 'dsh-cite')
  assert.equal(unwrapClient(wrapped), original)
  assert.equal(wrapClient(wrapped, 'dsh-cite'), wrapped)
  assert.doesNotMatch(wrapped, /__stardustUpdatesPage\(/)
})

test('native configuration drafts and saving state protect the footer install controls', async () => {
  const context = vm.createContext({ Symbol, Map, Set }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  const button = (text, { disabled = false, footer = false, visible = true, busy = false } = {}) => ({ textContent: text, disabled, closest: () => footer ? {} : null, getClientRects: () => visible ? [{}] : [], getAttribute: key => key === 'aria-busy' && busy ? 'true' : null })
  const document = items => ({ querySelectorAll: () => [{ querySelectorAll: () => items }] })
  const read = items => JSON.parse(JSON.stringify(context.__stardustUpdatesNativeFormState(document(items))))
  assert.deepEqual(read([button('保存')]), { dirty: true, busy: false })
  assert.deepEqual(read([button('Save changes')]), { dirty: true, busy: false })
  assert.deepEqual(read([button('Saving…', { disabled: true })]), { dirty: false, busy: true })
  assert.deepEqual(read([button('保存', { disabled: true }), button('保存', { footer: true }), button('Save', { visible: false }), button('导出')]), { dirty: false, busy: false })
})

test('a footer ignores a legacy controller until its renderer is available', async () => {
  const context = vm.createContext({ Symbol, Map, Set }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  context.__stardustUpdatesGuards().clients.add({ has: () => true })
  const React = { useState: () => [0, () => {}], useEffect() {}, createElement() { throw new Error('Must not render an undefined legacy component') } }
  assert.equal(context.__StardustPluginUpdatesFooter({ React, name: 'dsh-cite' }), null)
})

test('legacy-first loading hands over one controller after its current install and retains participant guards', async () => {
  const context = vm.createContext({ Symbol, Map, Set, WeakMap, Promise, setTimeout, clearTimeout }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  const effects = [], root = { plugin(definition) { const cleanup = []; definition.apply({ effect(fn) { cleanup.push(fn()) } }); return { async dispose() { for (const fn of cleanup) await fn?.() } } } }
  let oldDisposed = 0, newStarted = 0
  const oldRef = {}, old = { refs: new Map([[oldRef, { name: 'legacy' }]]), alive: true, hold: true, fiber: { async dispose() { oldDisposed++; old.alive = false; context[Symbol.for('stardustlc.plugin-updates.client.v1')].delete(root) } } }
  const pools = new WeakMap([[root, old]]); context[Symbol.for('stardustlc.plugin-updates.client.v1')] = pools
  context.__stardustUpdatesClient = () => { newStarted++; return { dispose() {} } }
  context.__stardustUpdatesJoin({ root, effect(fn) { effects.push(fn()) } }, {}, () => {}, { name: 'dsh-cite', version: VERSION })
  await Promise.resolve(); assert.equal(oldDisposed, 0); old.hold = false
  await old.migration
  assert.equal(oldDisposed, 1); assert.equal(newStarted, 1); assert.equal(pools.get(root), old); assert.equal(old.uiRevision, 2)
  assert.equal(old.refs.has(oldRef), true); assert.equal(old.refs.size, 2)
  effects.forEach(fn => fn()); assert.equal(old.refs.size, 1)
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

test('official Suite-only inventory retains active component entries without inventing install targets', async () => {
  const context = vm.createContext({ Symbol, Map, Set }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  const suite = { name: '@stardustlc/dsh-suite', version: '0.4.0', enabled: true, sourceKind: 'registry' }
  const cite = { name: 'dsh-cite', packageVersion: '0.7.1', suiteComponent: true, label: '引文库', labelEn: 'Citations' }
  const review = { name: '@stardustlc/dsh-review', packageVersion: '0.4.1', suiteComponent: false, label: 'Review' }
  const input = { rows: [suite], job: null }
  const view = context.__stardustUpdatesSuiteRows(input, [cite, cite, review])
  assert.equal(input.rows.length, 1, 'Host inventory must remain unchanged')
  assert.equal(view.rows.length, 2)
  assert.equal(view.rows[1].name, cite.name); assert.equal(view.rows[1].version, cite.packageVersion)
  assert.equal(view.rows[1].bundledBy, suite.name)
  assert.equal(view.rows[1].sourceKind, 'suite', 'Component must not become an independently installable target')
  const independent = { rows: [{ name: cite.name, version: '0.6.0' }] }
  assert.equal(context.__stardustUpdatesSuiteRows(independent, [cite]), independent)
  const direct = { name: cite.name, version: '0.7.0' }
  assert.equal(context.__stardustUpdatesSuiteRows({ rows: [suite, direct] }, [cite]).rows[1], direct)
  assert.equal(context.__stardustUpdatesSuiteRows({ rows: [{ ...suite, enabled: false }] }, [cite]).rows.length, 1)
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
