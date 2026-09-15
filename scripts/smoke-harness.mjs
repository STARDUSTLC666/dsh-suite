#!/usr/bin/env node
/** Boot the built Harness and all local suite plugins in an isolated, keyless Web profile. */
import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, promisify } from 'node:util'
import { setTimeout as delay } from 'node:timers/promises'
import { load, dump } from 'js-yaml'

const { values } = parseArgs({ options: {
  'harness-root': { type: 'string' },
  'workspace-root': { type: 'string' },
  'extra-plugin': { type: 'string', multiple: true },
  'contract-report': { type: 'string' },
  'install-tarballs': { type: 'string' },
  'registry-components': { type: 'boolean', default: false },
  report: { type: 'string' },
} })
assert.ok(values['harness-root'], 'Pass --harness-root pointing to a built deepseek-harness checkout')
const suiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workspace = resolve(values['workspace-root'] ?? join(suiteRoot, '..'))
const harness = resolve(values['harness-root'])
const cli = join(harness, 'apps/cli/lib/bin.js')
assert.ok(existsSync(cli), `Build Harness first: ${cli}`)
const version = JSON.parse(readFileSync(join(harness, 'apps/cli/package.json'), 'utf8')).version
const validationRoot = join(workspace, '.harness-validation')
mkdirSync(validationRoot, { recursive: true })
const home = mkdtempSync(join(validationRoot, 'smoke-'))
const profile = join(home, 'profiles/web')
const modules = join(profile, 'node_modules')
mkdirSync(modules, { recursive: true })
const artifactReport = values['install-tarballs']
  ? JSON.parse(readFileSync(resolve(values['install-tarballs']), 'utf8')) : undefined
if (artifactReport) assert.equal(artifactReport.ok, true, 'Use a successful package audit report')
if (values['registry-components']) assert.ok(artifactReport, '--registry-components requires --install-tarballs')

// Preserve executable discovery while keeping service credentials out of the fixture process.
const allowed = /^(?:path|pathext|systemroot|windir|comspec|temp|tmp|appdata|localappdata|userprofile|home|homedrive|homepath|programfiles(?:\(x86\))?|programdata|os|processor_architecture)$/i
const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => allowed.test(name)))
Object.assign(env, { DSH_HOME: home, DSH_AGENTS_HOME: join(home, '.agents'),
  DSH_TELEMETRY_DISABLED: '1', NO_COLOR: '1' })

function linkPackage(name, target) {
  const destination = join(modules, ...name.split('/'))
  mkdirSync(dirname(destination), { recursive: true })
  symlinkSync(target, destination, process.platform === 'win32' ? 'junction' : 'dir')
}
const entries = load(readFileSync(join(suiteRoot, 'cordis.patch.yml'), 'utf8'))[0].insert
const dependencies = {}
for (const entry of entries) {
  const directory = join(workspace, entry.name.split('/').at(-1))
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))
  assert.equal(manifest.name, entry.name, `${directory} package name differs from suite`)
  if (!artifactReport) linkPackage(entry.name, directory)
  dependencies[entry.name] = `link:${directory.replaceAll('\\', '/')}`
}
if (!artifactReport) linkPackage('@stardustlc/dsh-suite', suiteRoot)
dependencies['@stardustlc/dsh-suite'] = `link:${suiteRoot.replaceAll('\\', '/')}`
const extraBundles = []
const extraDirectories = []
for (const extra of values['extra-plugin'] ?? []) {
  const directory = resolve(extra)
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))
  assert.ok(manifest.dsh?.bundle?.patch, `${directory} must export a DSH bundle patch`)
  if (!artifactReport) linkPackage(manifest.name, directory)
  dependencies[manifest.name] = `link:${directory.replaceAll('\\', '/')}`
  extraBundles.push(manifest.name)
  extraDirectories.push(directory)
}

const probeDir = join(home, 'probe')
const probeResult = join(home, 'registry.json')
mkdirSync(probeDir)
writeFileSync(join(probeDir, 'package.json'), JSON.stringify({
  name: 'dsh-suite-smoke-probe', version: '0.0.0', type: 'module', main: 'index.mjs',
}))
writeFileSync(join(probeDir, 'index.mjs'), `
import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
export const inject = ['tools', 'skills', 'appReady', 'agents', 'agentPresets', 'systemPrompt']
export function apply(ctx, config) {
  ctx.effect(() => ctx.appReady.onReady(() => {
    void (async () => {
      const tools = ctx.tools.schemas().map(tool => tool.name).sort()
      const skills = (await ctx.skills.list()).map(skill => skill.name).sort()
      const preset = existsSync(join(process.env.DSH_HOME, '.agent-presets/ptc-minimal/agent.cordis.yml'))
      const handle = await ctx.agents.create({
        sessionId: 'suite-smoke-ptc-' + Date.now(),
        setup: agentCtx => ctx.agentPresets.mount(agentCtx, 'ptc-minimal').then(() => undefined),
      })
      let presetRuntime
      try {
        const assembly = await ctx.systemPrompt.assemble({ scope: handle.agent })
        presetRuntime = {
          mounted: true,
          modelTools: assembly.tools.map(tool => tool.name).sort(),
          registeredTools: ctx.tools.schemas(handle.agent).map(tool => tool.name).sort(),
        }
      } finally {
        await handle.dispose()
      }
      const skillHealth = {}
      for (const name of ['hyperframes_health', 'remotion_health']) {
        const result = await ctx.tools.execute({ callId: 'smoke-' + name, name,
          arguments: {}, signal: AbortSignal.timeout(10_000) })
        skillHealth[name] = { isError: result.isError, value: result.value }
      }
      writeFileSync(config.report, JSON.stringify({ tools, skills, preset, presetRuntime, skillHealth }, null, 2))
    })().catch(error => {
      writeFileSync(config.report, JSON.stringify({ error: error.message }))
    })
  }))
}
`)
if (!artifactReport) linkPackage('dsh-suite-smoke-probe', probeDir)
dependencies['dsh-suite-smoke-probe'] = `link:${probeDir.replaceAll('\\', '/')}`
let installation
if (!artifactReport) {
  writeFileSync(join(profile, 'package.json'), JSON.stringify({
    name: 'dsh-suite-smoke-web', private: true, dependencies,
    dsh: { profile: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app', '@stardustlc/dsh-suite', ...extraBundles] } },
  }, null, 2) + '\n')
} else {
  const packages = artifactReport.packages
  assert.ok(Array.isArray(packages))
  assert.deepEqual(packages.map(pkg => pkg.name).sort(), ['@stardustlc/dsh-suite', ...entries.map(entry => entry.name)].sort())
  for (const pkg of packages) {
    assert.ok(typeof pkg.tarball === 'string' && typeof pkg.version === 'string')
    assert.equal('sha512-' + createHash('sha512').update(readFileSync(pkg.tarball)).digest('base64'), pkg.integrity, pkg.name + ' tarball changed after audit')
  }
  const suite = packages.find(pkg => pkg.name === '@stardustlc/dsh-suite')
  const components = packages.filter(pkg => pkg !== suite)
  // Only this disposable profile redirects exact unpublished versions to audited tarballs.
  // The suite manifest itself retains the registry dependencies users will install.
  if (!values['registry-components']) {
    const overrides = Object.fromEntries(components.map(pkg => [`${pkg.name}@${pkg.version}`, `file:${resolve(pkg.tarball).replaceAll('\\', '/')}`]))
    writeFileSync(join(profile, 'pnpm-workspace.yaml'), dump({ overrides }))
  }
  writeFileSync(join(home, '.npmrc'), 'registry=https://registry.npmjs.org/\n')
  Object.assign(env, { npm_config_userconfig: join(home, '.npmrc'), npm_config_registry: 'https://registry.npmjs.org/' })
  console.log('Installing the suite through the official CLI with ' + (values['registry-components'] ? 'published components...' : 'audited component tarballs...'))
  try {
    const installed = await promisify(execFile)(process.execPath, [cli, 'plugin', '--profile', 'web', 'add', suite.tarball, ...extraDirectories, probeDir], {
      cwd: home, env, windowsHide: true, encoding: 'utf8', timeout: 300_000, maxBuffer: 8 * 1024 * 1024,
    })
    writeFileSync(join(home, 'install.log'), installed.stdout + installed.stderr)
  } catch (error) {
    writeFileSync(join(home, 'install.log'), String(error.stdout ?? '') + String(error.stderr ?? ''))
    throw new Error(`Official CLI installation failed; inspect ${join(home, 'install.log')}`, { cause: error })
  }
  const manifest = JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8'))
  const bundles = manifest.dsh.profile.bundles
  assert.ok(bundles.includes(suite.name))
  assert.deepEqual(components.filter(pkg => bundles.includes(pkg.name)).map(pkg => pkg.name), [], 'Components must load through the suite, without duplicate profile layers')
  assert.deepEqual(components.filter(pkg => Object.hasOwn(manifest.dependencies, pkg.name)).map(pkg => pkg.name), [], 'Components must be transitive suite dependencies')
  const suiteManifestPath = realpathSync(join(modules, suite.name, 'package.json'))
  const requireFromSuite = createRequire(suiteManifestPath)
  const installedSuite = JSON.parse(readFileSync(suiteManifestPath, 'utf8'))
  assert.equal(installedSuite.version, suite.version)
  assert.deepEqual(installedSuite.dependencies, Object.fromEntries(components.map(pkg => [pkg.name, pkg.version])))
  const versions = { [suite.name]: installedSuite.version }
  for (const pkg of components) {
    const actual = JSON.parse(readFileSync(requireFromSuite.resolve(pkg.name + '/package.json'), 'utf8'))
    assert.equal(actual.version, pkg.version)
    versions[pkg.name] = actual.version
  }
  const lock = load(readFileSync(join(profile, 'pnpm-lock.yaml'), 'utf8'))
  const integrities = {}
  for (const pkg of packages) {
    const fromRegistry = values['registry-components'] && pkg !== suite
    const matches = Object.entries(lock.packages).filter(([key]) => fromRegistry
      ? key === `${pkg.name}@${pkg.version}`
      : key.startsWith(`${pkg.name}@file:`))
    assert.equal(matches.length, 1, pkg.name + ' must resolve to one audited package')
    const resolution = matches[0][1].resolution
    assert.equal(resolution.integrity, pkg.integrity, pkg.name + ' installed bytes differ from the audit')
    if (!fromRegistry) {
      assert.ok(typeof resolution.tarball === 'string')
      assert.equal(realpathSync(resolve(profile, resolution.tarball.replace(/^file:/, ''))), realpathSync(pkg.tarball))
    }
    integrities[pkg.name] = resolution.integrity
  }
  installation = { officialCli: true, transitiveComponents: components.length, bundles, versions,
    registryComponents: values['registry-components'], integrities }
  writeFileSync(join(home, 'install.json'), JSON.stringify(installation, null, 2) + '\n')
}
writeFileSync(join(profile, 'cordis.patch.yml'), dump([
  { insert: [{ id: 'suite-smoke-probe', name: 'dsh-suite-smoke-probe', config: { report: probeResult } }] },
]))

const child = spawn(process.execPath, [cli, 'web', '--no-open', '--host', '127.0.0.1', '--port', '0'], {
  cwd: home, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
})
let output = ''
let launchError
child.on('error', error => { launchError = error })
child.stdout.on('data', chunk => { output += chunk })
child.stderr.on('data', chunk => { output += chunk })
const exited = new Promise(resolveExit => child.once('close', (code, signal) => resolveExit({ code, signal })))
let result
try {
  const deadline = Date.now() + 90_000
  let readyUrl
  while (Date.now() < deadline) {
    if (launchError) throw launchError
    assert.equal(child.exitCode, null, `Harness exited before ready: ${output.slice(-6000)}`)
    const match = output.match(/dsh web:\s+(http:\/\/127\.0\.0\.1:\d+\S*)/)
    if (match && existsSync(probeResult)) { readyUrl = match[1]; break }
    await delay(150)
  }
  assert.ok(readyUrl, `Harness did not become ready: ${output.slice(-6000)}`)
  const registry = JSON.parse(readFileSync(probeResult, 'utf8'))
  assert.ok(!registry.error, registry.error)
  const prefixes = ['calendar_', 'cite_', 'secure_', 'codex_', 'dingtalk_', 'docker_', 'dream_',
    'email_', 'ffmpeg_', 'flaky_', 'hyperframes_', 'ppt_', 'remotion_', 'rss_', 'slack_', 'sql_', 'voice_']
  const missing = prefixes.filter(prefix => !registry.tools.some(name => name.startsWith(prefix)))
  assert.deepEqual(missing, [], `Missing plugin tool prefixes; registered: ${registry.tools.join(', ')}`)
  assert.equal(registry.preset, true, 'Minimal PTC preset was not materialized')
  assert.equal(registry.presetRuntime.mounted, true, 'Minimal PTC preset did not mount in a real agent')
  assert.deepEqual(registry.presetRuntime.modelTools, ['run_code'], 'Minimal PTC must expose the program tool to the model')
  assert.deepEqual(registry.tools.filter(name => !registry.presetRuntime.registeredTools.includes(name)), [], 'The preset lost installed plugin tools')
  assert.ok(registry.presetRuntime.registeredTools.includes('bash'), 'Minimal PTC is missing its shell tool')
  for (const [name, result] of Object.entries(registry.skillHealth)) {
    assert.equal(result.isError, false, name + ' execution failed')
    assert.equal(result.value.ok, true, name + ' reported incomplete skill registration')
  }
  if (extraBundles.includes('@liustack/modlens')) {
    assert.ok(registry.tools.includes('modlens_read_image'), 'Modlens image tool was not registered')
  }
  if (values['contract-report']) {
    const previous = JSON.parse(readFileSync(resolve(values['contract-report']), 'utf8'))
    const contract = previous.contracts ?? previous
    assert.equal(contract.ok, true, 'Run verify-local.mjs successfully before using its report')
    assert.equal(contract.harnessVersion, version, 'Contract report targets a different Harness version')
    assert.deepEqual(contract.plugins.map(plugin => plugin.name).sort(), entries.map(entry => entry.name).sort())
    const expectedTools = contract.plugins.flatMap(plugin => plugin.tools)
    const expectedSkills = contract.plugins.flatMap(plugin => plugin.skills)
    assert.deepEqual(expectedTools.filter(name => !registry.tools.includes(name)), [], 'Suite tools missing from the real host')
    assert.deepEqual(expectedSkills.filter(name => !registry.skills.includes(name)), [], 'Suite skills missing from the real host')
  }
  const login = await fetch(readyUrl, { redirect: 'manual', signal: AbortSignal.timeout(15_000) })
  assert.equal(login.status, 303, 'Launch token must exchange for a browser cookie')
  const cookie = login.headers.get('set-cookie')?.split(';', 1)[0]
  assert.ok(cookie, 'Token exchange did not issue a cookie')
  const indexUrl = new URL(login.headers.get('location') ?? '/', readyUrl)
  const unauthenticated = await fetch(indexUrl, { signal: AbortSignal.timeout(15_000) })
  assert.equal(unauthenticated.status, 401, 'Web index must require authentication')
  const response = await fetch(indexUrl, { headers: { cookie }, signal: AbortSignal.timeout(15_000) })
  assert.equal(response.status, 200)
  assert.match(await response.text(), /<html|<!doctype html/i)
  result = { ok: true, harnessVersion: version, pluginCount: entries.length, extraBundles,
    ...(installation ? { installation } : {}),
    completeInventoryChecked: Boolean(values['contract-report']),
    toolCount: registry.tools.length, skillCount: registry.skills.length,
    skillHealthChecked: Object.keys(registry.skillHealth),
    preset: registry.preset, presetMounted: registry.presetRuntime.mounted,
    presetModelTools: registry.presetRuntime.modelTools,
    httpStatus: response.status, tokenExchangeStatus: login.status,
    unauthenticatedStatus: unauthenticated.status, home, registry }
} catch (error) {
  result = { ok: false, harnessVersion: version, home,
    error: error.message.replace(/([?&]token=)[^\s&)]+/g, '$1[REDACTED]') }
  process.exitCode = 1
} finally {
  child.kill('SIGTERM')
  let stopped = await Promise.race([exited, delay(7_000, undefined, { ref: false }).then(() => null)])
  if (!stopped) {
    child.kill('SIGKILL')
    stopped = await Promise.race([exited, delay(3_000, undefined, { ref: false }).then(() => null)])
  }
  result.processClosed = stopped !== null
  if (!result.processClosed) {
    result.ok = false
    result.error = 'Harness process did not close after smoke verification'
    process.exitCode = 1
  }
  // The short-lived launch token is never written into reports or displayed.
  writeFileSync(join(home, 'startup.log'), output.replace(/([?&]token=)[^\s&)]+/g, '$1[REDACTED]'))
}
if (values.report) {
  const report = resolve(values.report)
  mkdirSync(dirname(report), { recursive: true })
  writeFileSync(report, JSON.stringify(result, null, 2) + '\n')
}
const { registry: _registry, ...summary } = result
console.log(JSON.stringify(summary, null, 2))
