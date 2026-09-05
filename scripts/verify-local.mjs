#!/usr/bin/env node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { readCatalog, testFiles } from './lib/catalog.mjs'
import { offlineEnvironment } from './lib/offline.mjs'
import { runNode } from './lib/process.mjs'

const suiteRoot = fileURLToPath(new URL('../', import.meta.url))
const { values } = parseArgs({ options: {
  'harness-root': { type: 'string' }, 'workspace-root': { type: 'string' },
  report: { type: 'string' }, json: { type: 'boolean', default: false },
  'contracts-only': { type: 'boolean', default: false }, help: { type: 'boolean', default: false },
} })
if (values.help) {
  console.log('node scripts/verify-local.mjs --harness-root <built checkout> [--workspace-root <parent of dsh-* repos>] [--report report.json] [--json] [--contracts-only]')
} else {
  const report = { ok: false, startedAt: new Date().toISOString(), plugins: [] }
  try {
    if (!values['harness-root']) throw new Error('--harness-root is required; point it at a built DeepSeek Harness checkout')
    const workspaceRoot = resolve(values['workspace-root'] ?? join(suiteRoot, '..'))
    const harnessRoot = resolve(values['harness-root'])
    const runsRoot = join(workspaceRoot, '.harness-validation')
    mkdirSync(runsRoot, { recursive: true })
    const runDirectory = mkdtempSync(join(runsRoot, 'offline-'))
    report.runDirectory = runDirectory
    report.harnessRoot = harnessRoot
    report.harnessVersion = JSON.parse(readFileSync(join(harnessRoot, 'package.json'), 'utf8')).version
    const catalog = readCatalog(suiteRoot, workspaceRoot)
    const preload = new URL('./lib/no-network.mjs', import.meta.url).href
    for (const plugin of catalog) {
      const item = { name: plugin.name, version: plugin.version }
      report.plugins.push(item)
      if (!values['contracts-only']) {
        const env = offlineEnvironment(join(runDirectory, plugin.name.split('/').at(-1)))
        if (existsSync(join(plugin.directory, 'tsconfig.json'))) {
          const require = createRequire(join(plugin.directory, 'package.json'))
          item.build = await runNode([require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.json'], { cwd: plugin.directory, env })
        }
        const files = testFiles(plugin.directory)
        item.excludedTests = files.excluded
        if (item.build?.ok !== false) {
          item.tests = files.included.length === 0 ? { ok: false, error: 'No offline test files found' }
            : await runNode(['--import', preload, '--test', '--test-reporter=tap', ...files.included], { cwd: plugin.directory, env })
        }
      }
      if (!values.json) console.error(`${item.build?.ok === false || item.tests?.ok === false ? 'FAIL' : 'OK'} ${item.name}${item.tests?.tests === undefined ? '' : ` (${item.tests.pass} passed, ${item.tests.skipped} skipped)`}`)
    }
    const input = join(runDirectory, 'catalog.json')
    const output = join(runDirectory, 'contracts.json')
    writeFileSync(input, JSON.stringify(catalog))
    const contract = await runNode(['--import', preload, fileURLToPath(new URL('./lib/contract-worker.mjs', import.meta.url)), harnessRoot, input, output], {
      cwd: runDirectory, env: offlineEnvironment(join(runDirectory, 'contracts')),
    })
    report.contracts = existsSync(output) ? JSON.parse(readFileSync(output, 'utf8')) : contract
    report.ok = contract.ok && report.contracts.ok && report.plugins.every((item) => item.build?.ok !== false && item.tests?.ok !== false)
  } catch (error) {
    report.error = error.message
  }
  report.finishedAt = new Date().toISOString()
  const json = JSON.stringify(report, null, 2) + '\n'
  if (values.report) {
    const target = resolve(values.report)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, json)
  }
  if (values.json) process.stdout.write(json)
  else console.log(`${report.ok ? 'PASS' : 'FAIL'}: ${report.plugins.length} plugins; contracts ${report.contracts?.ok ? 'passed' : 'failed'}. Report: ${values.report ?? report.runDirectory ?? '(not created)'}`)
  if (!report.ok) process.exitCode = 1
}
