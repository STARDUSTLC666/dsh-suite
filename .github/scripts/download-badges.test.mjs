import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { badge, packages, refresh, validCount } from './download-badges.mjs'
const value = name => ({ package: name, downloads: 5800, start: '2026-09-04', end: '2026-10-03' })
test('statistics preserve zero and require the exact package and complete month', () => {
  assert.equal(validCount({ ...value('dsh-email'), downloads: 0 }, 'dsh-email'), true)
  for (const patch of [{ downloads: -1 }, { downloads: '5800' }, { package: 'other' }, { start: 'bad' }, { end: '2026-10-02' }]) assert.equal(validCount({ ...value('dsh-email'), ...patch }, 'dsh-email'), false)
  const svg = badge(value('dsh-email'))
  assert.match(svg, /5,800\/month/)
  assert.match(svg, /2026-09-04 to 2026-10-03/)
  assert.doesNotMatch(svg, /rate limited|<script/i)
})
test('a malformed upstream record retains a verified previous count instead of inventing zero', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  writeFileSync(join(directory, 'downloads.json'), JSON.stringify({ entries: { 'dsh-email': value('dsh-email') } }))
  const calls = []
  const fetcher = async url => {
    calls.push(url)
    const names = url.slice(url.lastIndexOf('last-month/') + 11).split(',')
    const result = Object.fromEntries(names.map(name => [name, name === 'dsh-email' ? { error: 'upstream unavailable' } : value(name)]))
    return { ok: true, json: async () => names.length > 1 ? result : result[names[0]] }
  }
  const report = await refresh(directory, fetcher)
  assert.equal(calls.length, 4)
  assert.equal(Object.keys(report.entries).length, 19)
  assert.deepEqual(report.retained, ['dsh-email'])
  assert.match(readFileSync(join(directory, 'assets/dsh-email-downloads.svg'), 'utf8'), /5,800\/month/)
  assert.equal(packages.length, 19)
})
test('a total statistics outage leaves previously generated files unchanged', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = JSON.stringify({ entries: Object.fromEntries(packages.map(([repo, name]) => [repo, value(name)])) })
  const file = join(directory, 'downloads.json')
  writeFileSync(file, original)
  await assert.rejects(refresh(directory, async () => ({ ok: true, json: async () => ({ error: 'rate limited' }) })), /All upstream requests failed/)
  assert.equal(readFileSync(file, 'utf8'), original)
})
