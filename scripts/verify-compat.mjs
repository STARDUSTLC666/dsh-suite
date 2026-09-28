#!/usr/bin/env node
/**
 * Re-verify every suite component against a built DeepSeek Harness checkout.
 *
 * The offline harness lives in scripts/verify-local.mjs; this entry is the
 * documented compatibility command: it pins nothing itself, so the same
 * command proves a new Harness release before the README statements change.
 *
 * Usage:
 *   node scripts/verify-compat.mjs --harness-root <built harness checkout> [--report compat.json]
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const suiteRoot = fileURLToPath(new URL('..', import.meta.url))
const { values } = parseArgs({ options: { 'harness-root': { type: 'string' }, report: { type: 'string' }, json: { type: 'boolean', default: false } } })
if (!values['harness-root']) throw new Error('--harness-root <built DeepSeek Harness checkout> is required')
const harnessRoot = resolve(values['harness-root'])
const harnessVersion = JSON.parse(readFileSync(join(harnessRoot, 'package.json'), 'utf8')).version
const report = resolve(values.report ?? join(suiteRoot, 'compatibility-' + harnessVersion + '.json'))
mkdirSync(dirname(report), { recursive: true })
const result = spawnSync(process.execPath, ['scripts/verify-local.mjs', '--harness-root', harnessRoot, '--report', report, '--json'], { cwd: suiteRoot, stdio: values.json ? 'pipe' : 'inherit', encoding: 'utf8' })
if (result.status !== 0 && result.status !== 1) throw new Error('verify-local failed to run: ' + (result.error?.message ?? result.status))
const data = JSON.parse(readFileSync(report, 'utf8'))
const plugins = data.plugins ?? []
const contracts = data.contracts ?? {}
if (!values.json) {
  console.log('\nHarness ' + harnessVersion + ' compatibility')
  for (const item of plugins) {
    const t = item.tests ?? {}
    console.log('  ' + ((item.build?.ok === false || t.ok === false) ? 'FAIL' : 'ok  ') + ' ' + item.name + ' v' + item.version + (t.pass === undefined ? '' : '  (' + t.pass + ' tests)'))
  }
  console.log('  contracts: ' + (contracts.ok ? 'ok' : 'FAIL') + (contracts.tools === undefined ? '' : ' (' + contracts.tools + ' tools, ' + contracts.skills + ' skills registered in one host)'))
  console.log('  report: ' + report)
  console.log(data.ok ? 'PASS' : 'FAIL')
}
process.exitCode = data.ok ? 0 : 1
