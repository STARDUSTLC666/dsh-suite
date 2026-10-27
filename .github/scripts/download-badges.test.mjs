import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { badge, countWindow, packages, refresh, validCount } from './download-badges.mjs'
const now = new Date('2026-10-27T15:00:00Z'), window = countWindow(now)
const value = name => ({ package: name, downloads: 5800, ...window })
const namesIn = url => decodeURIComponent(new URL(url).pathname.replace(/^\/downloads\/point\/[^/]+\//, '')).split(',')
const reply = (url, change = row => row) => { const names = namesIn(url), result = Object.fromEntries(names.map(name => [name, change(value(name))])); return { ok: true, json: async () => names.length > 1 ? result : result[names[0]] } }
test('the query window uses thirty complete UTC days across month and leap-year boundaries', () => {
  assert.deepEqual(window, { start: '2026-09-27', end: '2026-10-26' })
  assert.deepEqual(countWindow(new Date('2024-03-01T01:00:00Z')), { start: '2024-01-31', end: '2024-02-29' })
  assert.deepEqual(countWindow(new Date('2026-10-27T00:01:00+08:00')), { start: '2026-09-26', end: '2026-10-25' })
})
test('statistics preserve zero and require the exact package and complete month', () => {
  assert.equal(validCount({ ...value('dsh-email'), downloads: 0 }, 'dsh-email', window), true)
  for (const patch of [{ downloads: -1 }, { downloads: '5800' }, { package: 'other' }, { start: 'bad' }, { start: '2026-99-99' }, { start: '2026-02-30' }, { end: '2026-10-02' }, { start: '2026-06-02', end: '2026-07-01' }]) assert.equal(validCount({ ...value('dsh-email'), ...patch }, 'dsh-email', window), false)
  const svg = badge(value('dsh-email'))
  assert.match(svg, /5,800\/month/)
  assert.match(svg, /2026-09-27 to 2026-10-26/)
  assert.doesNotMatch(svg, /rate limited|<script/i)
})
test('a malformed upstream record retains a verified previous count instead of inventing zero', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  writeFileSync(join(directory, 'downloads.json'), JSON.stringify({ entries: { 'dsh-email': value('dsh-email') } }))
  const calls = []
  const fetcher = async url => {
    calls.push(url)
    assert.match(url, /\/2026-09-27:2026-10-26\//); assert.doesNotMatch(url, /last-month/)
    return reply(url, row => row.package === 'dsh-email' ? { error: 'upstream unavailable' } : row)
  }
  const report = await refresh(directory, fetcher, { now })
  assert.equal(calls.length, 5)
  assert.equal(Object.keys(report.entries).length, 21)
  assert.deepEqual(report.retained, ['dsh-email'])
  assert.match(readFileSync(join(directory, 'assets/dsh-email-downloads.svg'), 'utf8'), /5,800\/month/)
  assert.equal(packages.length, 21)
  assert.ok(packages.some(([,name]) => name === 'deepseek-computer-use'))
  assert.ok(packages.some(([,name]) => name === '@stardustlc/dsh-review'))
  assert.ok(!packages.some(([,name]) => name === '@stardustlc/dsh-updates'))
})
test('a total statistics outage leaves previously generated files unchanged', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = JSON.stringify({ entries: Object.fromEntries(packages.map(([repo, name]) => [repo, value(name)])) })
  const file = join(directory, 'downloads.json')
  writeFileSync(file, original)
  await assert.rejects(refresh(directory, async () => ({ ok: true, json: async () => ({ error: 'rate limited' }) }), { now }), /All upstream requests failed/)
  assert.equal(readFileSync(file, 'utf8'), original)
})
test('a structurally valid stale zero cannot overwrite current verified statistics', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-')); t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = JSON.stringify({ entries: Object.fromEntries(packages.map(([repo,name]) => [repo,value(name)])) }), file = join(directory,'downloads.json')
  writeFileSync(file, original)
  await assert.rejects(refresh(directory, async url => reply(url, row => ({ ...row, downloads: 0, start: '2026-06-02', end: '2026-07-01' })), { now }), /All upstream requests failed/)
  assert.equal(readFileSync(file,'utf8'), original)
})
test('stale legacy data is not treated as a current fallback when fresh queries fail', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-')); t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = JSON.stringify({ entries: Object.fromEntries(packages.map(([repo,name]) => [repo,{ ...value(name), downloads:0, start:'2026-06-02', end:'2026-07-01' }])) }), file = join(directory,'downloads.json')
  writeFileSync(file, original)
  await assert.rejects(refresh(directory, async url => reply(url, () => ({ error:'unavailable' })), { now }), /No verified statistics/)
  assert.equal(readFileSync(file,'utf8'), original)
})
