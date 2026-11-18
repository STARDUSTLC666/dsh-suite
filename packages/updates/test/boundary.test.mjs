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

test('an explicit footer supports custom workbenches without adding a second footer', () => {
  const source = "window.__ModuleLoader__.load({id:'dsh-calendar',factory:require=>{function render(){return h(W.Page, {}, __stardustUpdatesFooter(React, 'dsh-calendar'))} return {apply(){}}}});"
  const wrapped = wrapClient(source, 'dsh-calendar', '0.14.6')
  assert.match(wrapped, /"hasWorkbench":true/)
  assert.equal(unwrapClient(wrapped), source)
  assert.equal(wrapClient(wrapped, 'dsh-calendar', '0.14.6'), wrapped)
  assert.equal(wrapClient(wrapped.replaceAll('\n', '\r\n'), 'dsh-calendar', '0.14.6'), wrapped)
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
  assert.doesNotMatch(bootstrap, /name:\s*['"]settings\.section['"]|function Overlay\(/)
  assert.doesNotMatch(bootstrap, /Update all|更新全部/)
  assert.doesNotMatch(bootstrap, /migrate-suite|recover-suite|切换为独立安装|Use independent installations/)
})

test('an incompatible release names the environment that has to change instead of only refusing', async () => {
  const source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  // releaseOf() reports dsh-version / node-version / deprecated / not-bundle; the footer must
  // translate each one, otherwise the user only sees "incompatible" with no next step.
  assert.match(source, /function requirement\(release\)/)
  for (const code of ['dsh-version', 'node-version', 'deprecated', 'not-bundle']) assert.ok(source.includes(code + ':') || source.includes("'" + code + "':"), code)
  assert.match(source, /!row\.release\.compatible[\s\S]{0,240}requirement\(row\.release\)/)
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
  const oldRef = {}, old = { refs: new Map([[oldRef, { name: 'legacy' }]]), alive: true, hold: true, uiRevision: 4, fiber: { async dispose() { oldDisposed++; old.alive = false; context[Symbol.for('stardustlc.plugin-updates.client.v1')].delete(root) } } }
  const pools = new WeakMap([[root, old]]); context[Symbol.for('stardustlc.plugin-updates.client.v1')] = pools
  context.__stardustUpdatesClient = () => { newStarted++; return { dispose() {} } }
  context.__stardustUpdatesJoin({ root, effect(fn) { effects.push(fn()) } }, {}, () => {}, { name: 'dsh-cite', version: VERSION })
  await Promise.resolve(); assert.equal(oldDisposed, 0); old.hold = false
  await old.migration
  assert.equal(oldDisposed, 1); assert.equal(newStarted, 1); assert.equal(pools.get(root), old); assert.equal(old.uiRevision, 8)
  assert.equal(old.refs.has(oldRef), true); assert.equal(old.refs.size, 2)
  effects.forEach(fn => fn()); assert.equal(old.refs.size, 1)
})

test('an upgraded Host coordinator waits for a legacy installation and inherits participants', async t => {
  const { registerUpdates } = await import('../lib/index.js')
  const key = Symbol.for('stardustlc.plugin-updates.host.v1')
  const previousPool = globalThis[key]
  const profile = { dir: new URL('./unused-host-fixture/', import.meta.url).href }
  const clients = new Map()
  const engine = { clients, history: [], pendingRestart: false }
  let settled, oldDisposed = 0, routesRegistered = 0
  engine.jobPromise = new Promise(resolve => { settled = resolve }).finally(() => { engine.jobPromise = null })
  const legacy = { refs: new Map([['original', 'dsh-rss']]), version: VERSION, revision: 2, engine,
    fiber: { async dispose() { oldDisposed++; globalThis[key].delete(profile) } } }
  globalThis[key] = new WeakMap([[profile, legacy]])
  const services = {
    profileContext: profile,
    connection: { fetch: { register() { routesRegistered++; return () => {} } } },
    pluginManager: { listBundles: async () => [], installBundle() {}, removeBundle() {}, cancelInstall() {} },
    agents: { list: () => [] },
    loader: { import: async () => ({ getDshRuntimeVersion: () => '0.2.2-rc.3' }) },
  }
  const effects = []
  const get = name => services[name]
  const root = { get, plugin(plugin) {
    const fiber = Promise.resolve(plugin.apply({ get, effect: setup => effects.push(setup()) }))
    fiber.dispose = async () => { for (const dispose of effects.reverse()) await dispose?.() }
    return fiber
  } }
  t.after(async () => {
    const current = globalThis[key].get(profile)
    if (current !== legacy) await current?.fiber?.dispose()
    globalThis[key] = previousPool
  })
  const host = { root, get, inject(_services, attach) { attach(this) }, effect() {} }
  registerUpdates(host, { name: 'dsh-cite' })
  await Promise.resolve()
  assert.equal(oldDisposed, 0)
  settled()
  await legacy.upgrade
  const current = globalThis[key].get(profile)
  await current.fiber
  assert.equal(oldDisposed, 1)
  assert.equal(routesRegistered, 1)
  assert.equal(current.engine.clients, clients)
  assert.deepEqual([...current.refs.values()], ['dsh-rss', 'dsh-cite'])
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

test('Suite-only inventory keeps transitive component entries attached while Suite is mid-hot-update', async () => {
  const context = vm.createContext({ Symbol, Map, Set }), source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  vm.runInContext(source, context)
  const suiteDisabledMidSwap = { name: '@stardustlc/dsh-suite', version: '0.11.9', enabled: false, sourceKind: 'registry', updating: true }
  const cite = { name: 'dsh-cite', packageVersion: '0.8.1', suiteComponent: true, label: '引文库', labelEn: 'Citations' }
  const view = context.__stardustUpdatesSuiteRows({ rows: [suiteDisabledMidSwap], job: { name: '@stardustlc/dsh-suite', state: 'installing', phase: 'applying' } }, [cite])
  assert.equal(view.rows.length, 2)
  assert.equal(view.rows[1].name, 'dsh-cite')
  assert.equal(view.rows[1].bundledBy, '@stardustlc/dsh-suite')
})

test('footer includes subtle non-intrusive GitHub star and component issue links', async () => {
  const source = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  assert.match(source, /https:\/\/github\.com\/STARDUSTLC666\//)
  assert.match(source, /Star dsh-suite on GitHub/)
  assert.match(source, /ownRepo \+ '\/issues'/)
})

test('alpha.3 settings icons match section ids, preserve page registration and dispose with their scope', () => {
  const source='window.__ModuleLoader__.load({id:"dsh-cite",factory:require=>({apply(ctx){ctx.slots.register({name:"settings.section",id:"cite-settings"},()=>null)}})});\n';
  const icon='data:image/webp;base64,fixture';
  const defs=[],registrations=[],cleanup=[];
  vm.runInNewContext(wrapClient(source,'dsh-cite','0.7.9',icon),{window:{__ModuleLoader__:{load:def=>defs.push(def)}}});
  const slots={register(meta,component){const row={meta,component};registrations.push(row);return()=>registrations.splice(registrations.indexOf(row),1)},inject(name,callback){assert.equal(name,'settings.section.icon');cleanup.push(callback())}};
  const plugin=defs[0].factory(()=>({createElement:(type,props)=>({type,props})}));
  plugin.apply({slots,inject(names,callback){if(names.length===1)callback({slots})}});
  const row=registrations.find(row=>row.meta.name==='settings.section.icon');
  assert.equal(row.meta.id,'cite-settings');
  const image=row.component({size:24,active:true});assert.equal(image.type,'img');assert.equal(image.props.src,icon);assert.equal(image.props.width,24);assert.equal(image.props.alt,'');
  assert.equal(registrations.filter(row=>row.meta.name==='settings.section').length,1);
  for(const dispose of cleanup)dispose();assert.equal(registrations.some(row=>row.meta.name==='settings.section.icon'),false);
});
test('hosts without the optional icon slot keep working without a new settings page', () => {
  const source='window.__ModuleLoader__.load({id:"dsh-cite",factory:require=>({apply(ctx){ctx.count++}})});\n',defs=[];
  vm.runInNewContext(wrapClient(source,'dsh-cite','0.7.9','data:image/webp;base64,fixture'),{window:{__ModuleLoader__:{load:def=>defs.push(def)}}});
  const ctx={count:0,inject(){throw Error('No injection expected without a matching section')}};
  // The updater injection remains optional in this minimal legacy host.
  delete ctx.inject;
  defs[0].factory(()=>({})).apply(ctx);assert.equal(ctx.count,1);
});

test('inline workbench footer stays completely hidden when calm and surfaces a compact strip only for actionable updates or active jobs', async t => {
  const kit = await readFile(new URL('../lib/ui-kit.js', import.meta.url), 'utf8')
  const uiClient = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  let snapshot = {
    rows: [{ name: 'dsh-cite', version: '0.10.0', enabled: true, sourceKind: 'registry', available: false, checkedAt: 1_700_000_000_000, label: '引文库', labelEn: 'Citations', release: { version: '0.10.0', compatible: true } }],
    preferences: { revision: 1, packages: {} },
    activity: { known: true, busy: false },
    pages: { known: true, dirty: false, clients: [] },
    checkingNames: [],
    job: { id: 'past-job', name: 'dsh-cite', state: 'complete', from: '0.9.9', to: '0.10.0' },
  }
  const context = vm.createContext({
    Symbol, Map, Set, WeakMap, URL, AbortController, Promise, Date,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000099' },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {},
    document: { baseURI: 'http://localhost/', addEventListener() {}, removeEventListener() {}, querySelectorAll: () => [] },
    window: { addEventListener() {}, removeEventListener() {} },
    fetch: async () => ({ ok: true, status: 200, async json() { return { ok: true, value: snapshot } } }),
  })
  vm.runInContext(kit + '\n' + uiClient, context)
  function expand(node) {
    if (node == null || typeof node !== 'object') return node
    if (typeof node.type === 'function') return expand(node.type({ ...(node.props || {}), children: node.children }))
    return { ...node, children: (node.children || []).flat().map(expand).filter(item => item != null && item !== false) }
  }
  const React = {
    Fragment: 'fragment',
    useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect() {},
    useRef: initial => ({ current: initial }),
    useId: () => 'u1',
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  }
  const shared = { refs: new Map([['r1', { name: 'dsh-cite' }]]), hold: false }
  const client = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: { inject(_slot, fn) { fn() }, register() {} },
  }, React, () => ({}), shared)
  t.after(() => client.dispose())
  await new Promise(resolve => setTimeout(resolve, 150))

  // 1. Calm up-to-date state (even with historical completed job): workbench inline footer renders nothing (null),
  //    while native plugin details still render the full management section.
  assert.equal(expand(React.createElement(client.Footer, { name: 'dsh-cite' })), null)
  const nativeCalm = expand(React.createElement(client.NativeFooter, { subject: { kind: 'bundle', pkg: { name: 'dsh-cite' } } }))
  assert.equal(nativeCalm.type, 'section')
  assert.equal(nativeCalm.props['data-plugin-update-footer'], 'dsh-cite')
  assert.doesNotMatch(nativeCalm.props.className, /is-inline/)

  // 2. Compatible update available: workbench inline footer renders a single-line compact strip (.is-inline).
  snapshot = {
    ...snapshot,
    rows: [{ ...snapshot.rows[0], available: true, release: { version: '0.10.1', compatible: true } }],
    job: null,
  }
  await new Promise(resolve => setTimeout(resolve, 10))
  // Trigger refresh via client poll cycle by re-creating or invoking state update
  const clientWithUpdate = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: { inject(_slot, fn) { fn() }, register() {} },
  }, React, () => ({}), shared)
  t.after(() => clientWithUpdate.dispose())
  await new Promise(resolve => setTimeout(resolve, 150))
  const inlineAvailable = expand(React.createElement(clientWithUpdate.Footer, { name: 'dsh-cite' }))
  assert.equal(inlineAvailable.type, 'section')
  assert.match(inlineAvailable.props.className, /\bis-inline\b/)
  assert.equal(inlineAvailable.props['data-plugin-update-footer'], 'dsh-cite')

  // 3. Ignored version hides the inline workbench strip again while keeping NativeFooter available.
  snapshot = {
    ...snapshot,
    preferences: { revision: 2, packages: { 'dsh-cite': { checkEnabled: true, autoInstall: false, deferredUntil: 0, ignoredVersion: '0.10.1' } } },
  }
  const clientIgnored = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: { inject(_slot, fn) { fn() }, register() {} },
  }, React, () => ({}), shared)
  t.after(() => clientIgnored.dispose())
  await new Promise(resolve => setTimeout(resolve, 150))
  assert.equal(expand(React.createElement(clientIgnored.Footer, { name: 'dsh-cite' })), null)
  assert.notEqual(expand(React.createElement(clientIgnored.NativeFooter, { subject: { kind: 'bundle', pkg: { name: 'dsh-cite' } } })), null)
})

test('shell overlay reminder offers direct in-chat hot-update actions and yields when a page update footer is visible', async t => {
  const kit = await readFile(new URL('../lib/ui-kit.js', import.meta.url), 'utf8')
  const uiClient = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  let footerNodes = []
  const snapshot = {
    rows: [{ name: '@stardustlc/dsh-suite', version: '0.12.5', enabled: true, sourceKind: 'registry', available: true, checkedAt: 1_700_000_000_000, label: '组合包', labelEn: 'Suite', release: { version: '0.12.6', compatible: true } }],
    preferences: { revision: 1, packages: {} },
    activity: { known: true, busy: false },
    pages: { known: true, dirty: false, clients: [] },
    checkingNames: [],
    job: null,
  }
  const context = vm.createContext({
    Symbol, Map, Set, WeakMap, URL, AbortController, Promise, Date,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000098' },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {},
    document: { baseURI: 'http://localhost/', addEventListener() {}, removeEventListener() {}, querySelectorAll: sel => sel === '[data-plugin-update-footer]' ? footerNodes : [] },
    window: { addEventListener() {}, removeEventListener() {} },
    fetch: async () => ({ ok: true, status: 200, async json() { return { ok: true, value: snapshot } } }),
  })
  vm.runInContext(kit + '\n' + uiClient, context)
  function expand(node) {
    if (node == null || typeof node !== 'object') return node
    if (typeof node.type === 'function') return expand(node.type({ ...(node.props || {}), children: node.children }))
    return { ...node, children: (node.children || []).flat().map(expand).filter(item => item != null && item !== false) }
  }
  function textOf(node) {
    if (node == null || typeof node === 'boolean') return ''
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    return (node.children || []).map(textOf).join(' ')
  }
  const React = {
    Fragment: 'fragment',
    useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect() {},
    useRef: initial => ({ current: initial }),
    useId: () => 'u2',
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  }
  let OverlayComponent = null
  const shared = { refs: new Map([['r1', { name: '@stardustlc/dsh-suite' }]]), hold: false }
  const client = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: {
      inject(_slot, fn) { fn() },
      register(meta, comp) { if (meta.name === 'shell.overlay') OverlayComponent = comp },
    },
  }, React, () => ({}), shared)
  t.after(() => client.dispose())
  await new Promise(resolve => setTimeout(resolve, 150))
  assert.equal(typeof OverlayComponent, 'function')

  const chatCard = expand(React.createElement(OverlayComponent, {}))
  assert.equal(chatCard.type, 'aside')
  assert.equal(chatCard.props['data-plugin-update-reminder'], '@stardustlc/dsh-suite')
  assert.match(textOf(chatCard), /热更新 Suite 至 v0\.12\.6/)

  footerNodes = [{ getClientRects: () => [{}] }]
  assert.equal(expand(React.createElement(OverlayComponent, {})), null)
})

test('native bundle detail footer avoids duplicating host version/install buttons while keeping Suite row delegation and clear bundle-in-use guidance', async t => {
  const kit = await readFile(new URL('../lib/ui-kit.js', import.meta.url), 'utf8')
  const uiClient = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  let snapshot = {
    rows: [
      { name: 'dsh-calendar', version: '0.18.3', enabled: false, sourceKind: 'registry', available: true, checkedAt: 1_700_000_000_000, label: '日历', labelEn: 'Calendar', release: { version: '0.18.6', compatible: true } },
      { name: '@stardustlc/dsh-suite', version: '0.12.5', enabled: true, sourceKind: 'registry', available: true, checkedAt: 1_700_000_000_000, label: '组合包', labelEn: 'Suite', release: { version: '0.12.6', compatible: true } },
      { name: 'dsh-cite', version: '0.10.2', enabled: true, sourceKind: 'suite', bundledBy: '@stardustlc/dsh-suite', label: '引文库', labelEn: 'Citations' },
    ],
    preferences: { revision: 1, packages: {} },
    activity: { known: true, busy: false },
    pages: { known: true, dirty: false, clients: [] },
    checkingNames: [],
    job: { id: 'failed-bundle-in-use', name: 'dsh-calendar', state: 'failed', from: '0.18.3', to: '0.18.6', outcome: { result: { error: { code: 'bundle-in-use' } } } },
  }
  const context = vm.createContext({
    Symbol, Map, Set, WeakMap, URL, AbortController, Promise, Date,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000097' },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {},
    document: { baseURI: 'http://localhost/', addEventListener() {}, removeEventListener() {}, querySelectorAll: () => [] },
    window: { addEventListener() {}, removeEventListener() {} },
    fetch: async () => ({ ok: true, status: 200, async json() { return { ok: true, value: snapshot } } }),
  })
  vm.runInContext(kit + '\n' + uiClient, context)
  function expand(node) {
    if (node == null || typeof node !== 'object') return node
    if (typeof node.type === 'function') return expand(node.type({ ...(node.props || {}), children: node.children }))
    return { ...node, children: (node.children || []).flat().map(expand).filter(item => item != null && item !== false) }
  }
  function textOf(node) {
    if (node == null || typeof node === 'boolean') return ''
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    return (node.children || []).map(textOf).join(' ')
  }
  const React = {
    Fragment: 'fragment',
    useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect() {},
    useRef: initial => ({ current: initial }),
    useId: () => 'u3',
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  }
  const shared = { refs: new Map([['r1', { name: 'dsh-calendar' }], ['r2', { name: '@stardustlc/dsh-suite' }]]), hold: false }
  const client = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: { inject(_slot, fn) { fn() }, register() {} },
  }, React, () => ({}), shared)
  t.after(() => client.dispose())
  await new Promise(resolve => setTimeout(resolve, 150))

  const standaloneDetail = expand(React.createElement(client.NativeFooter, { subject: { kind: 'bundle', pkg: { name: 'dsh-calendar' } } }))
  const standaloneText = textOf(standaloneDetail)
  assert.doesNotMatch(standaloneText, /更新至 v0\.18\.6|检查更新|有兼容的新版本|上次检查/)
  assert.match(standaloneText, /自动更新与提醒/)
  assert.match(standaloneText, /更新记录/)
  assert.match(standaloneText, /手动重启一次 DSH 即可继续更新，无需逐个停用插件/)
  assert.doesNotMatch(standaloneText, /操作未完成，请刷新后重试/)

  const suiteRowDetail = expand(React.createElement(client.NativeFooter, { subject: { kind: 'row', pkg: { name: '@stardustlc/dsh-suite' }, row: { moduleName: 'dsh-cite/client' } } }))
  const suiteRowText = textOf(suiteRowDetail)
  assert.match(suiteRowText, /随 Suite 整包管理/)
  assert.match(suiteRowText, /更新 Suite 至 v0\.12\.6/)
})

test('reminder proactively refreshes stale available checks with per-package throttling and recovers from release-changed and check-first', async t => {
  const kit = await readFile(new URL('../lib/ui-kit.js', import.meta.url), 'utf8')
  const uiClient = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  let now = 1_800_000_000_000
  const FakeDate = Object.assign(function (...args) { return new Date(...args) }, { now: () => now })
  let checkFail = true
  let nextInstallError = 'release-changed'
  let snapshot = {
    rows: [{ name: 'dsh-cite', version: '0.7.10', enabled: true, sourceKind: 'registry', available: true, checkedAt: now - 2 * 60 * 60 * 1000, label: '引文库', labelEn: 'Citations', release: { version: '0.7.12', compatible: true } }],
    preferences: { revision: 1, packages: {} },
    activity: { known: true, busy: false },
    pages: { known: true, dirty: false, clients: [] },
    checkingNames: [],
    job: null,
  }
  const apiCalls = []
  const context = vm.createContext({
    Symbol, Map, Set, WeakMap, URL, AbortController, Promise, Date: FakeDate,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000096' },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {},
    document: { baseURI: 'http://localhost/', addEventListener() {}, removeEventListener() {}, querySelectorAll: () => [], activeElement: null },
    window: { addEventListener() {}, removeEventListener() {} },
    fetch: async (_url, init) => {
      const body = JSON.parse(init.body)
      apiCalls.push(body)
      if (body.action === 'check') {
        if (checkFail) return { ok: false, status: 503, async json() { return { ok: false, code: 'registry-unavailable' } } }
        snapshot = {
          ...snapshot,
          rows: [{ ...snapshot.rows[0], checkedAt: now, release: { version: '0.7.15', compatible: true }, available: true }],
        }
        return { ok: true, status: 200, async json() { return { ok: true, value: snapshot } } }
      }
      if (body.action === 'install') {
        if (nextInstallError) {
          const code = nextInstallError
          if (code === 'release-changed') {
            snapshot = {
              ...snapshot,
              rows: [{ ...snapshot.rows[0], checkedAt: now, release: { version: '0.7.15', compatible: true }, available: true }],
            }
          }
          return { ok: false, status: 400, async json() { return { ok: false, code } } }
        }
        snapshot = { ...snapshot, job: { id: 'job-0715', name: 'dsh-cite', state: 'complete', from: '0.7.10', to: body.version } }
        return { ok: true, status: 200, async json() { return { ok: true, value: snapshot.job } } }
      }
      return { ok: true, status: 200, async json() { return { ok: true, value: snapshot } } }
    },
  })
  vm.runInContext(kit + '\n' + uiClient, context)

  // Minimal stateful React renderer supporting useState, useRef, and useEffect across renders.
  function createHarness() {
    const states = [], refs = [], effects = []
    let cursor = 0, refCursor = 0, effectCursor = 0
    const pendingEffects = []
    const React = {
      Fragment: 'fragment',
      useState(initial) {
        const idx = cursor++
        if (!(idx in states)) states[idx] = typeof initial === 'function' ? initial() : initial
        const set = next => { states[idx] = typeof next === 'function' ? next(states[idx]) : next }
        return [states[idx], set]
      },
      useRef(initial) {
        const idx = refCursor++
        if (!(idx in refs)) refs[idx] = { current: initial }
        return refs[idx]
      },
      useEffect(fn, deps) {
        const idx = effectCursor++
        const prev = effects[idx]
        const changed = !prev || !deps || deps.length !== prev.deps?.length || deps.some((d, i) => !Object.is(d, prev.deps[i]))
        if (changed) pendingEffects.push({ idx, fn, deps })
      },
      useId: () => 'r-id',
      createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    }
    function expand(node) {
      if (node == null || typeof node !== 'object') return node
      if (typeof node.type === 'function') return expand(node.type({ ...(node.props || {}), children: node.children }))
      return { ...node, children: (node.children || []).flat().map(expand).filter(item => item != null && item !== false) }
    }
    return {
      React,
      render(Component, props = {}) {
        cursor = 0; refCursor = 0; effectCursor = 0; pendingEffects.length = 0
        const tree = expand(React.createElement(Component, props))
        for (const item of pendingEffects.splice(0)) {
          effects[item.idx]?.cleanup?.()
          const cleanup = item.fn()
          effects[item.idx] = { deps: item.deps, cleanup }
        }
        return tree
      },
      dispose() { for (const item of effects) item?.cleanup?.() },
    }
  }
  function textOf(node) {
    if (node == null || typeof node === 'boolean') return ''
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    return (node.children || []).map(textOf).join(' ')
  }
  function findButtons(node, out = []) {
    if (!node || typeof node !== 'object') return out
    if (node.type === 'button') out.push(node)
    for (const child of node.children || []) findButtons(child, out)
    return out
  }

  const harness = createHarness()
  let OverlayComponent = null
  const shared = { refs: new Map([['r1', { name: 'dsh-cite' }]]), hold: false }
  const client = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: {
      inject(_slot, fn) { fn() },
      register(meta, comp) { if (meta.name === 'shell.overlay') OverlayComponent = comp },
    },
  }, harness.React, () => ({}), shared)
  t.after(() => { harness.dispose(); client.dispose() })
  await new Promise(resolve => setTimeout(resolve, 150))

  // 1. Mounting Reminder with stale checkedAt (> 30m) triggers one proactive background check,
  //    and offline failure stays throttled on subsequent renders within 5 minutes.
  let view = harness.render(OverlayComponent)
  await new Promise(resolve => setTimeout(resolve, 30))
  const initialChecks = apiCalls.filter(call => call.action === 'check' && call.name === 'dsh-cite').length
  assert.equal(initialChecks, 1, 'Expected one proactive background check for stale reminder')
  now += 60 * 1000
  view = harness.render(OverlayComponent)
  await new Promise(resolve => setTimeout(resolve, 30))
  assert.equal(apiCalls.filter(call => call.action === 'check' && call.name === 'dsh-cite').length, 1, 'Proactive check must be throttled for 5 minutes on offline errors')
  assert.match(textOf(view), /热更新至 v0\.7\.12/)

  // 2. Clicking install when npm moved ahead (release-changed) auto-runs check + refresh,
  //    explains that a newer release was found, and updates the button straight to v0.7.15.
  checkFail = false
  findButtons(view).find(btn => /热更新至 v0\.7\.12/.test(textOf(btn))).props.onClick()
  view = harness.render(OverlayComponent)
  await findButtons(view).find(btn => /安装此版本/.test(textOf(btn))).props.onClick()
  view = harness.render(OverlayComponent)
  assert.match(textOf(view), /发现更新的发布版本（或发布信息已更新），已刷新至最新状态，请再次确认安装/)
  assert.match(textOf(view), /热更新至 v0\.7\.15/)

  // Opening the confirm dialog again clears the previous error and targets v0.7.15.
  findButtons(view).find(btn => /热更新至 v0\.7\.15/.test(textOf(btn))).props.onClick()
  view = harness.render(OverlayComponent)
  assert.doesNotMatch(textOf(view), /发现更新的发布版本/)
  assert.match(textOf(view), /v0\.7\.10 → v0\.7\.15/)

  // 3. If install returns check-first, Reminder auto-checks and renders an explicit [重新检查] recovery button.
  nextInstallError = 'check-first'
  await findButtons(view).find(btn => /安装此版本/.test(textOf(btn))).props.onClick()
  view = harness.render(OverlayComponent)
  assert.match(textOf(view), /检查结果已过期，请重新检查/)
  const recheckBtn = findButtons(view).find(btn => /重新检查/.test(textOf(btn)))
  assert.ok(recheckBtn, 'Expected [重新检查] recovery button when error is check-first')
  const checksBeforeClick = apiCalls.filter(call => call.action === 'check').length
  await recheckBtn.props.onClick()
  view = harness.render(OverlayComponent)
  assert.equal(apiCalls.filter(call => call.action === 'check').length, checksBeforeClick + 1)
  assert.doesNotMatch(textOf(view), /检查结果已过期，请重新检查/)

  // 4. InlineFooter (Panel) also proactively refreshes stale checks and recovers from release-changed / check-first.
  const panelHarness = createHarness()
  snapshot = {
    rows: [{ name: 'dsh-cite', version: '0.7.10', enabled: true, sourceKind: 'registry', available: true, checkedAt: 0, label: '引文库', labelEn: 'Citations', release: { version: '0.7.12', compatible: true } }],
    preferences: { revision: 1, packages: {} },
    activity: { known: true, busy: false },
    pages: { known: true, dirty: false, clients: [] },
    checkingNames: [],
    job: null,
  }
  checkFail = true
  const panelClient = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: { inject(_slot, fn) { fn() }, register() {} },
  }, panelHarness.React, () => ({}), shared)
  t.after(() => { panelHarness.dispose(); panelClient.dispose() })
  await new Promise(resolve => setTimeout(resolve, 150))

  const checksBeforePanel = apiCalls.filter(call => call.action === 'check' && call.name === 'dsh-cite').length
  let footerView = panelHarness.render(panelClient.Footer, { name: 'dsh-cite' })
  await new Promise(resolve => setTimeout(resolve, 30))
  assert.equal(apiCalls.filter(call => call.action === 'check' && call.name === 'dsh-cite').length, checksBeforePanel + 1)

  checkFail = false
  nextInstallError = 'check-first'
  findButtons(footerView).find(btn => /更新至 v0\.7\.12/.test(textOf(btn))).props.onClick()
  footerView = panelHarness.render(panelClient.Footer, { name: 'dsh-cite' })
  await findButtons(footerView).find(btn => /安装此版本/.test(textOf(btn))).props.onClick()
  footerView = panelHarness.render(panelClient.Footer, { name: 'dsh-cite' })
  assert.match(textOf(footerView), /检查结果已过期，请重新检查/)
  assert.ok(findButtons(footerView).some(btn => /重新检查/.test(textOf(btn))))
  assert.match(textOf(footerView), /更新至 v0\.7\.15/)
})

test('reminder keeps update action on mid-flight release-changed job failure and advances or yields once a finished job is dismissed', async t => {
  const kit = await readFile(new URL('../lib/ui-kit.js', import.meta.url), 'utf8')
  const uiClient = await readFile(new URL('../lib/ui-client.js', import.meta.url), 'utf8')
  const now = 1_800_000_000_000
  const FakeDate = Object.assign(function (...args) { return new Date(...args) }, { now: () => now })
  let footerNodes = []
  let installAttempt = 0
  let snapshot = {
    rows: [
      { name: 'dsh-cite', version: '0.7.10', enabled: true, sourceKind: 'registry', available: true, checkedAt: now - 5 * 60 * 1000, label: '引文库', labelEn: 'Citations', release: { version: '0.7.12', compatible: true } },
      { name: 'dsh-ppt', version: '0.5.0', enabled: true, sourceKind: 'registry', available: true, checkedAt: now - 5 * 60 * 1000, label: '演示文稿', labelEn: 'PPT', release: { version: '0.5.1', compatible: true } },
    ],
    preferences: { revision: 1, packages: {} },
    activity: { known: true, busy: false },
    pages: { known: true, dirty: false, clients: [] },
    checkingNames: [],
    job: null,
  }
  const fastTimeout = (fn, ms) => setTimeout(fn, ms >= 800 ? 5 : ms)
  const context = vm.createContext({
    Symbol, Map, Set, WeakMap, URL, AbortController, Promise, Date: FakeDate,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000095' },
    setTimeout: fastTimeout, clearTimeout, setInterval: () => 1, clearInterval() {},
    document: { baseURI: 'http://localhost/', addEventListener() {}, removeEventListener() {}, querySelectorAll: sel => sel === '[data-plugin-update-footer]' ? footerNodes : [], activeElement: null },
    window: { addEventListener() {}, removeEventListener() {} },
    fetch: async (_url, init) => {
      const body = JSON.parse(init.body)
      if (body.action === 'install') {
        installAttempt++
        if (installAttempt === 1) {
          // Admitted job fails mid-flight in run() with release-changed while rows update to 0.7.15.
          const failedJob = { id: 'job-mid-flight', name: 'dsh-cite', state: 'failed', reason: 'release-changed', from: '0.7.10', to: '0.7.12' }
          snapshot = {
            ...snapshot,
            rows: [
              { ...snapshot.rows[0], checkedAt: now, release: { version: '0.7.15', compatible: true }, available: true },
              snapshot.rows[1],
            ],
            job: failedJob,
          }
          return { ok: true, status: 200, async json() { return { ok: true, value: { ...failedJob, state: 'verifying' } } } }
        }
        const completedJob = { id: 'job-0715-done', name: 'dsh-cite', state: 'complete', from: '0.7.10', to: body.version }
        snapshot = {
          ...snapshot,
          rows: [
            { ...snapshot.rows[0], version: body.version, checkedAt: now, release: { version: body.version, compatible: true }, available: false },
            snapshot.rows[1],
          ],
          job: completedJob,
        }
        return { ok: true, status: 200, async json() { return { ok: true, value: { ...completedJob, state: 'verifying' } } } }
      }
      return { ok: true, status: 200, async json() { return { ok: true, value: snapshot } } }
    },
  })
  vm.runInContext(kit + '\n' + uiClient, context)

  const states = [], refs = [], effects = [], pendingEffects = []
  let cursor = 0, refCursor = 0, effectCursor = 0
  const React = {
    Fragment: 'fragment',
    useState(initial) {
      const idx = cursor++
      if (!(idx in states)) states[idx] = typeof initial === 'function' ? initial() : initial
      const set = next => { states[idx] = typeof next === 'function' ? next(states[idx]) : next }
      return [states[idx], set]
    },
    useRef(initial) {
      const idx = refCursor++
      if (!(idx in refs)) refs[idx] = { current: initial }
      return refs[idx]
    },
    useEffect(fn, deps) {
      const idx = effectCursor++
      const prev = effects[idx]
      const changed = !prev || !deps || deps.length !== prev.deps?.length || deps.some((d, i) => !Object.is(d, prev.deps[i]))
      if (changed) pendingEffects.push({ idx, fn, deps })
    },
    useId: () => 'r-mid',
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  }
  function expand(node) {
    if (node == null || typeof node !== 'object') return node
    if (typeof node.type === 'function') return expand(node.type({ ...(node.props || {}), children: node.children }))
    return { ...node, children: (node.children || []).flat().map(expand).filter(item => item != null && item !== false) }
  }
  function render(Component) {
    cursor = 0; refCursor = 0; effectCursor = 0; pendingEffects.length = 0
    const tree = expand(React.createElement(Component, {}))
    for (const item of pendingEffects.splice(0)) {
      effects[item.idx]?.cleanup?.()
      effects[item.idx] = { deps: item.deps, cleanup: item.fn() }
    }
    return tree
  }
  function textOf(node) {
    if (node == null || typeof node === 'boolean') return ''
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    return (node.children || []).map(textOf).join(' ')
  }
  function findButtons(node, out = []) {
    if (!node || typeof node !== 'object') return out
    if (node.type === 'button') out.push(node)
    for (const child of node.children || []) findButtons(child, out)
    return out
  }

  let OverlayComponent = null
  const shared = { refs: new Map([['r1', { name: 'dsh-cite' }], ['r2', { name: 'dsh-ppt' }]]), hold: false }
  const client = context.__stardustUpdatesClient({
    locale: { getSnapshot: () => ({ active: 'zh-CN' }), subscribe: () => () => {} },
    slots: {
      inject(_slot, fn) { fn() },
      register(meta, comp) { if (meta.name === 'shell.overlay') OverlayComponent = comp },
    },
  }, React, () => ({}), shared)
  t.after(() => { for (const item of effects) item?.cleanup?.(); client.dispose() })
  await new Promise(resolve => setTimeout(resolve, 150))

  // 1. Mid-flight failed job with reason 'release-changed' still renders [热更新至 v0.7.15] in .reminder-actions!
  let view = render(OverlayComponent)
  findButtons(view).find(btn => /热更新至 v0\.7\.12/.test(textOf(btn))).props.onClick()
  view = render(OverlayComponent)
  await findButtons(view).find(btn => /安装此版本/.test(textOf(btn))).props.onClick()
  view = render(OverlayComponent)
  assert.match(textOf(view), /发现更新的发布版本（或发布信息已更新），已刷新至最新状态，请再次确认安装/)
  const retry0715 = findButtons(view).find(btn => /热更新至 v0\.7\.15/.test(textOf(btn)))
  assert.ok(retry0715, 'Mid-flight release-changed failure must keep [热更新至 v0.7.15] button visible')

  // 2. Clicking [热更新至 v0.7.15] dismisses the failed job, opens confirm dialog for 0.7.15, and installs cleanly.
  retry0715.props.onClick()
  view = render(OverlayComponent)
  assert.doesNotMatch(textOf(view), /更新未成功/)
  await findButtons(view).find(btn => /安装此版本/.test(textOf(btn))).props.onClick()
  view = render(OverlayComponent)
  assert.match(textOf(view), /已更新/)
  assert.match(textOf(view), /v0\.7\.10 → v0\.7\.15/)

  // 3. Dismissing the completed job advances Reminder to the next candidate (dsh-ppt), and yields when footerVisible is true.
  findButtons(view).find(btn => btn.props['aria-label'] === '关闭提醒').props.onClick()
  view = render(OverlayComponent)
  assert.equal(view.props['data-plugin-update-reminder'], 'dsh-ppt')
  assert.match(textOf(view), /热更新至 v0\.5\.1/)

  footerNodes = [{ getClientRects: () => [{}] }]
  assert.equal(render(OverlayComponent), null)
})
