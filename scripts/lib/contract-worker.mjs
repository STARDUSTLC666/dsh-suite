import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [harnessRoot, input, output] = process.argv.slice(2)
const report = { ok: false, plugins: [], tools: 0, skills: 0, healthChecks: 0, outputChecks: 0, registryLossChecks: 0, mockedRequests: [] }
let host
const disposers = []
const importFile = (file) => import(pathToFileURL(file).href)

try {
  const toolsPackage = join(harnessRoot, 'packages/core/tools/package.json')
  const require = createRequire(toolsPackage)
  const toolsApi = await importFile(join(harnessRoot, 'packages/core/tools/lib/index.js'))
  const { Context } = await importFile(require.resolve('@deepseek-ai/cordis'))
  const cliRequireForHarness = createRequire(join(harnessRoot, 'apps/cli/package.json'))
  let hasModernPtcRuntime = false
  try { cliRequireForHarness.resolve('@deepseek-ai/dsh-workflow-ptc'); hasModernPtcRuntime = true } catch { hasModernPtcRuntime = false }
  const { default: SystemPrompt } = await importFile(require.resolve('@deepseek-ai/dsh-system-prompt'))
  const { default: Skills } = await importFile(join(harnessRoot, 'packages/skill/skill/lib/index.js'))
  host = new Context()
  await host.plugin(SystemPrompt)
  await host.plugin(toolsApi.default)
  await host.plugin(Skills)
  report.harnessVersion = JSON.parse(readFileSync(toolsPackage, 'utf8')).version

  // Health checks use a closed fixture list. Sending messages, synthesis,
  // downloads, subprocesses and scans are never dispatched by this worker.
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
    assert.equal(url.origin + url.pathname, 'https://api.crossref.org/works', 'Unexpected contract fetch')
    report.mockedRequests.push('Crossref health fixture')
    return Response.json({ status: 'ok', message: { items: [] } })
  }
  const subprocess = {
    spawn(spec) {
      assert.ok(spec.argv.includes('-version') || spec.argv.includes('--version') || spec.argv[1] === 'version', 'Only version probes have subprocess fixtures')
      report.mockedRequests.push('subprocess version fixture: ' + spec.argv[0])
      const text = 'offline fixture 1.0.0\n'
      return {
        done: Promise.resolve({ exitCode: 0, signal: null }),
        collected: { stdout: { readFrom: () => ({ text }) }, stderr: { readFrom: () => ({ text: '' }) } },
        terminate() {},
      }
    },
  }
  // 与真实宿主一致的 appReady：插件（dsh-minimal-ptc）在 onReady 回调里物化预设，
  // 契约校验需要它同步跑一次，否则 mock context 里是 undefined。
  const appReady = {
    onReady(listener) {
      const dispose = listener()
      return typeof dispose === 'function' ? dispose : () => {}
    },
  }
  const schemas = []
  const skillNames = new Set()
  for (const plugin of JSON.parse(readFileSync(input, 'utf8'))) {
    const item = { name: plugin.name, ok: false, tools: [], skills: [], fixtures: [], warnings: [] }
    report.plugins.push(item)
    const definitions = []
    const skillRegistrations = []
    const registrationErrors = []
    try {
      const module = await importFile(join(plugin.directory, plugin.manifest.main ?? 'lib/index.js'))
      assert.equal(typeof module.apply, 'function', 'Plugin must export apply')
      const settings = {
        writable: false,
        register(_namespace, _schema, options) {
          return { get: () => options?.base ?? {}, replace: async () => { throw new Error('Contract settings are read-only') } }
        },
        describe: () => [],
      }
      const context = {
        logger: { warn: (message) => item.warnings.push(String(message)), info() {} },
        settings, subprocess, appReady,
        // 与真实宿主 0.1.6 对齐：ptcRuntime 存在时插件会物化 modern 预设（否则引用已下线的 workflow-worker-thread）。
        ptcRuntime: hasModernPtcRuntime ? {} : undefined,
        tools: {
          register(...args) {
            try {
              assert.equal(args.length, 1, 'tools.register accepts exactly one definition')
              const definition = args[0]
              assert.match(definition.name, /^[A-Za-z0-9_-]+$/)
              assert.equal(typeof definition.description, 'string')
              assert.equal(typeof definition.execute, 'function')
              toolsApi.assertObjectJsonSchema(definition.parameters)
              toolsApi.assertSupportedJsonSchema(definition.output.schema)
              assert.deepEqual(JSON.parse(JSON.stringify(definition.parameters)), definition.parameters)
              assert.deepEqual(JSON.parse(JSON.stringify(definition.output.schema)), definition.output.schema)
              const dispose = host.tools.register(definition)
              definitions.push(definition)
              schemas.push({ name: definition.name, description: definition.description, parameters: definition.parameters, output: definition.output.schema })
              item.tools.push(definition.name)
              return dispose
            } catch (error) {
              registrationErrors.push(error.message)
              throw error
            }
          },
        },
        skills: {
          get(name, options) { return host.skills.get(name, options) },
          register(definition) {
            try {
              assert.ok(!skillNames.has(definition.name), 'Duplicate skill: ' + definition.name)
              const registration = { definition, dispose: host.skills.register(definition) }
              skillRegistrations.push(registration)
              skillNames.add(definition.name)
              item.skills.push(definition.name)
              return () => registration.dispose()
            } catch (error) {
              registrationErrors.push(error.message)
              throw error
            }
          },
        },
        on(event, listener, options) {
          if (event === 'dispose') { disposers.push(listener); return () => {} }
          return host.on(event, listener, options)
        },
        effect(callback) { const dispose = callback(); if (typeof dispose === 'function') disposers.push(dispose) },
        inject() { return () => {} }, // Web extensions are verified by smoke-harness.mjs.
        get(name) { return this[name] },
      }
      const usedServices = new Set()
      // Cordis object form maps service names to intercept configuration;
      // it does not have separate required/optional service lists.
      const requiredServices = Array.isArray(module.inject) ? module.inject : Object.keys(module.inject ?? {})
      const injectionErrors = []
      const checkedContext = new Proxy(context, {
        get(target, key, receiver) {
          if (['tools', 'skills', 'settings', 'subprocess', 'appReady'].includes(key)) {
            usedServices.add(key)
            if (!requiredServices.includes(key)) {
              injectionErrors.push('Missing inject declaration for ' + key)
              assert.fail(injectionErrors.at(-1))
            }
          }
          return Reflect.get(target, key, receiver)
        },
      })
      await module.apply(checkedContext, plugin.config)
      item.requiredServices = [...requiredServices]
      item.usedServices = [...usedServices]
      assert.deepEqual(injectionErrors, [], 'Service injection errors were swallowed by apply')
      assert.deepEqual(registrationErrors, [], 'Some registrations were swallowed by apply')
      if (Array.isArray(module.SKILL_NAMES)) assert.equal(item.skills.length, module.SKILL_NAMES.length, 'Not all bundled skills registered')
      if (plugin.name === 'dsh-minimal-ptc') {
        const preset = join(process.env.DSH_HOME, '.agent-presets/ptc-minimal')
        for (const filename of ['preset.yml', 'agent.cordis.yml', 'gitbash-executor.mjs']) assert.ok(existsSync(join(preset, filename)), 'Preset materialization missing: ' + filename)
        const cliRequire = createRequire(join(harnessRoot, 'apps/cli/package.json'))
        const composition = readFileSync(join(preset, 'agent.cordis.yml'), 'utf8')
        const references = [...composition.matchAll(/^\s+name:\s*['"](@deepseek-ai\/[^'"\r\n]+)['"]/gm)].map((match) => match[1])
        for (const specifier of new Set(references)) cliRequire.resolve(specifier)
        item.presetModules = [...new Set(references)]
      } else {
        assert.ok(definitions.length > 0, 'Plugin registered no tools')
        const fixtures = definitions.filter((definition) => definition.name.endsWith('_health') || definition.name === 'ppt_themes')
        assert.ok(fixtures.length > 0, 'Plugin has no read-only output contract fixture')
        for (const definition of fixtures) {
          const result = await host.tools.execute({ callId: 'contract-' + definition.name, name: definition.name, arguments: {}, signal: AbortSignal.timeout(10000) })
          assert.equal(result.isError, false, JSON.stringify(result.content))
          if (Array.isArray(module.SKILL_NAMES)) {
            assert.equal(result.value.ok, true, 'Bundled skill health must confirm actual registrations')
          }
          assert.deepEqual(toolsApi.validateJsonSchemaValue(definition.output.schema, result.value), [])
          assert.deepEqual(JSON.parse(JSON.stringify(result.value)), result.value)
          assert.ok(result.content.every((block) => block.type === 'text' && typeof block.text === 'string'))
          item.fixtures.push({ name: definition.name, schemaValid: true, ...(typeof result.value.ok === 'boolean' ? { fixtureOk: result.value.ok } : {}) })
          report.outputChecks += 1
          if (definition.name.endsWith('_health')) report.healthChecks += 1
        }
        if (plugin.name === 'dsh-code-security') {
          const target = join(process.cwd(), 'contract-review.js')
          writeFileSync(target, 'export const fixture = true\n')
          const result = await host.tools.execute({ callId: 'contract-secure-scan', name: 'secure_scan', arguments: { target }, signal: AbortSignal.timeout(10000) })
          assert.equal(result.isError, false, JSON.stringify(result.content))
          assert.equal(result.value.filesScanned, 1)
          assert.equal(result.value.baseline, null)
          item.fixtures.push({ name: 'secure_scan', schemaValid: true })
          report.outputChecks += 1
        }
        if (Array.isArray(module.SKILL_NAMES) && definitions.some(definition => definition.name.endsWith('_health'))) {
          const registration = skillRegistrations[0]
          const health = definitions.find(definition => definition.name.endsWith('_health'))
          assert.ok(registration && health, 'Skill bundles need a registered skill and health tool')
          await registration.dispose()
          try {
            const missing = await host.tools.execute({ callId: 'contract-missing-' + health.name,
              name: health.name, arguments: {}, signal: AbortSignal.timeout(10000) })
            assert.equal(missing.isError, false, 'Health must describe missing registrations as a result')
            assert.equal(missing.value.ok, false, 'Health must detect a skill removed from the real registry')
            assert.deepEqual(toolsApi.validateJsonSchemaValue(health.output.schema, missing.value), [])
          } finally {
            registration.dispose = host.skills.register(registration.definition)
          }
          const restored = await host.tools.execute({ callId: 'contract-restored-' + health.name,
            name: health.name, arguments: {}, signal: AbortSignal.timeout(10000) })
          assert.equal(restored.isError, false)
          assert.equal(restored.value.ok, true, 'Health must observe a matching registration restored in the host')
          report.registryLossChecks += 1
        }
      }
      item.ok = true
    } catch (error) {
      item.error = error.message
    }
  }
  for (const [language, render] of [['typescript', toolsApi.renderToolsSdk], ['python', toolsApi.renderToolsSdkPy]]) {
    const sdk = render(schemas)
    assert.ok(typeof sdk === 'string' && sdk.length > 0, language + ' PTC SDK did not render')
    for (const schema of schemas) assert.ok(sdk.includes(schema.name), language + ' PTC SDK missing ' + schema.name)
  }
  report.tools = host.tools.schemas().length
  report.skills = (await host.skills.list()).length
  report.ptcLanguages = ['typescript', 'python']
  report.ok = report.plugins.every((plugin) => plugin.ok)
} catch (error) {
  report.error = error.message
} finally {
  for (const dispose of disposers.reverse()) {
    try { await dispose() } catch (error) { report.ok = false; report.cleanupError = error.message }
  }
  if (host) {
    try { await host.fiber.dispose() } catch (error) { report.ok = false; report.cleanupError = error.message }
  }
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
  if (!report.ok) process.exitCode = 1
}
