import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { badge, countWindow, packages, refresh, validCount, validSources, lifetimeWindows, lifetimeCount, lifetimeBadge, validLifetime } from './download-badges.mjs'
const now = new Date('2026-10-27T15:00:00Z'), window = countWindow(now)
const value = (name, npm = 5000, npmmirror = 800) => ({ package: name, downloads: npm + npmmirror, ...window, sources: { npm, npmmirror } })
const namesIn = url => decodeURIComponent(new URL(url).pathname.replace(/^\/downloads\/point\/[^/]+\//, '')).split(',')
const reply = (url, change = row => row) => {
  const host = new URL(url).hostname, isMirror = host === 'registry.npmmirror.com'
  const names = namesIn(url)
  const result = Object.fromEntries(names.map(name => [name, change({ package: name, downloads: isMirror ? 800 : 5000, ...window }, { host, isMirror })]))
  return { ok: true, status: 200, json: async () => names.length > 1 ? result : result[names[0]] }
}
const lastDayUrl = 'https://api.npmjs.org/downloads/point/last-day'
const lastDayReply = (day, downloads = 1000000) => ({ ok: true, status: 200, json: async () => ({ start: day, end: day, downloads }) })
const withPublishedDay = (fetcher, day = window.end) => url => url === lastDayUrl ? lastDayReply(day) : fetcher(url)

test('the query window uses thirty complete UTC days across month and leap-year boundaries', () => {
  assert.deepEqual(window, { start: '2026-09-27', end: '2026-10-26' })
  assert.deepEqual(countWindow(new Date('2024-03-01T01:00:00Z')), { start: '2024-01-31', end: '2024-02-29' })
  assert.deepEqual(countWindow(new Date('2026-10-27T00:01:00+08:00')), { start: '2026-09-26', end: '2026-10-25' })
})

test('statistics preserve zero, validate per-source sums, and require the exact package and complete month', () => {
  assert.equal(validCount({ ...value('dsh-email', 0, 0) }, 'dsh-email', window), true)
  assert.equal(validSources({ npm: 5000, npmmirror: 800 }, 5800), true)
  assert.equal(validSources({ npm: 5000, npmmirror: 800 }, 5801), false)
  assert.equal(validSources({ npm: -1, npmmirror: 801 }, 800), false)
  for (const patch of [
    { downloads: -1 }, { downloads: '5800' }, { package: 'other' }, { start: 'bad' },
    { start: '2026-99-99' }, { start: '2026-02-30' }, { end: '2026-10-02' },
    { start: '2026-06-02', end: '2026-07-01' }, { sources: { npm: 5000, npmmirror: 700 } },
  ]) {
    assert.equal(validCount({ ...value('dsh-email'), ...patch }, 'dsh-email', window), false)
  }
  const svg = badge(value('dsh-email'))
  assert.match(svg, /5,800\/month/)
  assert.match(svg, /npm 5000\/month \+ npmmirror 800\/month/)
  assert.match(svg, /2026-09-27 to 2026-10-26/)
  assert.doesNotMatch(svg, /rate limited|<script/i)
})

test('a malformed upstream record from either npm or npmmirror retains a verified previous count instead of inventing zero', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  writeFileSync(join(directory, 'downloads.json'), JSON.stringify({
    entries: {
      'dsh-email': value('dsh-email', 5000, 800),
      'dsh-ppt': value('dsh-ppt', 9000, 3000),
    },
  }))
  const calls = []
  const fetcher = async url => {
    calls.push(url)
    assert.match(url, /\/2026-09-27:2026-10-26\//); assert.doesNotMatch(url, /last-month/)
    return reply(url, (row, { isMirror }) => {
      if (!isMirror && row.package === 'dsh-email') return { error: 'upstream unavailable' }
      if (isMirror && row.package === 'dsh-ppt') return { error: 'mirror unavailable' }
      return row
    })
  }
  const report = await refresh(directory, withPublishedDay(fetcher), { now, includeTotals: false })
  // 1 bulk unscoped npm + 4 scoped npm + 21 per-package npmmirror = 26 calls
  assert.equal(calls.length, 26)
  assert.equal(Object.keys(report.entries).length, 21)
  assert.deepEqual(report.retained, ['dsh-email', 'dsh-ppt'])
  assert.equal(report.entries['dsh-voice'].downloads, 5800)
  assert.deepEqual(report.entries['dsh-voice'].sources, { npm: 5000, npmmirror: 800 })
  assert.equal(report.entries['dsh-ppt'].downloads, 12000)
  assert.match(readFileSync(join(directory, 'assets/dsh-email-downloads.svg'), 'utf8'), /5,800\/month/)
  assert.match(readFileSync(join(directory, 'assets/dsh-ppt-downloads.svg'), 'utf8'), /12,000\/month/)
  assert.equal(packages.length, 21)
  assert.ok(packages.some(([, name]) => name === 'deepseek-computer-use'))
  assert.ok(packages.some(([, name]) => name === '@stardustlc/dsh-review'))
  assert.ok(!packages.some(([, name]) => name === '@stardustlc/dsh-updates'))
})

test('lifetime windows cover every day once while remaining below npm and npmmirror range limits', () => {
  const windows = lifetimeWindows('2024-02-28T18:30:00Z', '2026-10-26')
  assert.equal(windows[0].start, '2024-02-28'); assert.equal(windows.at(-1).end, '2026-10-26')
  let days = 0
  for (let i = 0; i < windows.length; i++) {
    const w = windows[i], span = (Date.parse(w.end) - Date.parse(w.start)) / 86400000 + 1
    assert.ok(span > 0 && span <= 365); days += span
    if (i) assert.equal(Date.parse(w.start) - Date.parse(windows[i - 1].end), 86400000)
  }
  assert.equal(days, (Date.parse('2026-10-26') - Date.parse('2024-02-28')) / 86400000 + 1)
  for (const created of ['bad', '2014-01-01', '2026-10-27T00:00:00Z']) assert.throws(() => lifetimeWindows(created, '2026-10-26'))
})

const totalReply = async (url, change = value => value) => {
  if (typeof change !== 'function') change = value => value
  const target = new URL(url)
  if (target.hostname === 'registry.npmjs.org') {
    const name = decodeURIComponent(target.pathname.slice(1))
    return { ok: true, status: 200, json: async () => ({ name, time: { created: '2026-09-01T12:00:00Z' } }) }
  }
  const isMirror = target.hostname === 'registry.npmmirror.com'
  const [, start, end] = /^\/downloads\/point\/([^:]+):([^/]+)\//.exec(target.pathname) || []
  const baseDownloads = start === '2026-09-01' ? (isMirror ? 2000 : 10000) : (isMirror ? 800 : 5000)
  const names = namesIn(url)
  const rows = Object.fromEntries(names.map(name => [name, change({ package: name, start, end, downloads: baseDownloads }, { isMirror })]))
  return { ok: true, status: 200, json: async () => names.length > 1 ? rows : rows[names[0]] }
}

test('lifetime count merges npm and npmmirror across bounded windows and exposes source breakdown', async () => {
  const total = await lifetimeCount('@stardustlc/dsh-suite', totalReply, window.end)
  assert.equal(total.downloads, 12000)
  assert.deepEqual(total.sources, { npm: 10000, npmmirror: 2000 })
  assert.equal(total.start, '2026-09-01'); assert.equal(total.end, window.end)
  assert.ok(validLifetime(total, '@stardustlc/dsh-suite', window.end))
  const svg = lifetimeBadge(total)
  assert.match(svg, /12,000/)
  assert.match(svg, /npm 10000 \+ npmmirror 2000/)
  assert.doesNotMatch(svg, /\/month/)
  await assert.rejects(lifetimeCount('dsh-email', async () => ({ ok: true, status: 200, json: async () => ({ name: 'other', time: { created: '2026-09-01' } }) }), window.end), /creation date/)
})

test('refresh generates both badge types and never accepts a total smaller than the matching month on any source', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-total-badges-')); t.after(() => rmSync(dir, { recursive: true, force: true }))
  const report = await refresh(dir, withPublishedDay(totalReply), { now })
  assert.equal(report.schemaVersion, 4)
  assert.equal(Object.keys(report.totals).length, 21)
  assert.match(readFileSync(join(dir, 'assets/dsh-email-total-downloads.svg'), 'utf8'), /12,000/)
  const before = readFileSync(join(dir, 'downloads.json'), 'utf8')
  const after = await refresh(dir, withPublishedDay(url => totalReply(url, (row, { isMirror }) => (
    row.start === '2026-09-01' && row.package === 'dsh-email' && isMirror ? { ...row, downloads: 100 } : row
  ))), { now })
  assert.deepEqual(after.totalsRetained, ['dsh-email'])
  assert.equal(after.totals['dsh-email'].downloads, 12000)
  assert.equal(JSON.parse(before).totals['dsh-email'].downloads, 12000)
})

test('brand-new package not yet synced to npmmirror treats 404 as zero, while existing mirror history rejects 404', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-unsynced-mirror-')); t.after(() => rmSync(dir, { recursive: true, force: true }))
  const firstRun = await refresh(dir, withPublishedDay(async url => {
    const target = new URL(url)
    if (target.hostname === 'registry.npmmirror.com' && target.pathname.endsWith('/@stardustlc/dsh-review')) {
      return { ok: false, status: 404, json: async () => ({ error: '[NOT_FOUND]' }) }
    }
    return totalReply(url)
  }), { now })
  assert.deepEqual(firstRun.entries['dsh-review'].sources, { npm: 5000, npmmirror: 0 })
  assert.deepEqual(firstRun.totals['dsh-review'].sources, { npm: 10000, npmmirror: 0 })
  assert.deepEqual(firstRun.entries['dsh-email'].sources, { npm: 5000, npmmirror: 800 })

  // Once dsh-email has recorded npmmirror > 0, a sudden 404 on npmmirror must retain previous data instead of dropping to 5000.
  const nextNow = new Date('2026-10-28T15:00:00Z'), nextWindow = countWindow(nextNow)
  const secondRun = await refresh(dir, withPublishedDay(async url => {
    const target = new URL(url)
    if (target.hostname === 'registry.npmmirror.com' && target.pathname.endsWith('/dsh-email')) {
      return { ok: false, status: 404, json: async () => ({ error: '[NOT_FOUND]' }) }
    }
    return totalReply(url)
  }, nextWindow.end), { now: nextNow })
  assert.deepEqual(secondRun.retained, ['dsh-email'])
  assert.deepEqual(secondRun.totalsRetained, ['dsh-email'])
  assert.equal(secondRun.entries['dsh-email'].downloads, 5800)
  assert.equal(secondRun.totals['dsh-email'].downloads, 12000)
})

test('missing lifetime data on a first run does not publish monthly-only or fake zero totals', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-total-badges-')); t.after(() => rmSync(dir, { recursive: true, force: true })); const file = join(dir, 'downloads.json'); writeFileSync(file, '{"keep":true}')
  await assert.rejects(refresh(dir, withPublishedDay(url => totalReply(url, row => row.start === '2026-09-01' ? { error: 'unavailable' } : row)), { now }), /No verified lifetime/)
  assert.equal(readFileSync(file, 'utf8'), '{"keep":true}')
})

test('a total statistics outage leaves previously generated files unchanged', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = JSON.stringify({ entries: Object.fromEntries(packages.map(([repo, name]) => [repo, value(name)])) })
  const file = join(directory, 'downloads.json')
  writeFileSync(file, original)
  await assert.rejects(refresh(directory, withPublishedDay(async () => ({ ok: true, status: 200, json: async () => ({ error: 'rate limited' }) })), { now }), /All upstream requests failed/)
  assert.equal(readFileSync(file, 'utf8'), original)
})

test('a structurally valid stale zero cannot overwrite current verified statistics', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-')); t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = JSON.stringify({ entries: Object.fromEntries(packages.map(([repo, name]) => [repo, value(name)])) }), file = join(directory, 'downloads.json')
  writeFileSync(file, original)
  await assert.rejects(refresh(directory, withPublishedDay(async url => reply(url, row => ({ ...row, downloads: 0, start: '2026-06-02', end: '2026-07-01' }))), { now }), /All upstream requests failed/)
  assert.equal(readFileSync(file, 'utf8'), original)
})

test('stale legacy data is not treated as a current fallback when fresh queries fail', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-')); t.after(() => rmSync(directory, { recursive: true, force: true }))
  const original = JSON.stringify({ entries: Object.fromEntries(packages.map(([repo, name]) => [repo, { package: name, downloads: 0, start: '2026-06-02', end: '2026-07-01' }])) }), file = join(directory, 'downloads.json')
  writeFileSync(file, original)
  await assert.rejects(refresh(directory, withPublishedDay(async url => reply(url, () => ({ error: 'unavailable' }))), { now }), /No verified statistics/)
  assert.equal(readFileSync(file, 'utf8'), original)
})

test('an unpublished day preserves a current schema snapshot, but immediately upgrades a legacy schemaVersion 3 snapshot', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const previousDay = '2026-10-25'
  const reportPath = join(directory, 'downloads.json')
  const badgePath = join(directory, 'assets/dsh-email-downloads.svg')

  // Legacy schemaVersion 3 snapshot on the same availableThrough day should NOT short-circuit to pending:
  writeFileSync(reportPath, JSON.stringify({
    schemaVersion: 3,
    window: { start: '2026-09-26', end: previousDay },
    entries: Object.fromEntries(packages.map(([repo, name]) => [repo, { package: name, downloads: 5000, start: '2026-09-26', end: previousDay }])),
  }))
  const upgraded = await refresh(directory, withPublishedDay(totalReply, previousDay), { now })
  assert.equal(upgraded.schemaVersion, 4)
  assert.equal(upgraded.entries['dsh-email'].downloads, 5800)

  const previousReport = readFileSync(reportPath, 'utf8')
  const previousBadge = readFileSync(badgePath, 'utf8')

  // Once upgraded to schemaVersion 4 with no retained entries, an unpublished day short-circuits cleanly:
  const pending = await refresh(directory, async url => {
    assert.equal(url, lastDayUrl)
    return lastDayReply(previousDay)
  }, { now })
  assert.deepEqual(pending, { pending: true, expectedEnd: window.end, availableThrough: previousDay })
  assert.equal(readFileSync(reportPath, 'utf8'), previousReport)
  assert.equal(readFileSync(badgePath, 'utf8'), previousBadge)

  const refreshed = await refresh(directory, withPublishedDay(totalReply), { now })
  assert.deepEqual(refreshed.window, window)
  assert.match(readFileSync(badgePath, 'utf8'), /2026-09-27 to 2026-10-26/)
  const currentReport = readFileSync(reportPath, 'utf8')
  await refresh(directory, withPublishedDay(totalReply), { now: new Date('2026-10-27T21:00:00Z') })
  assert.equal(readFileSync(reportPath, 'utf8'), currentReport)

  const delayedDay = '2026-10-27'
  const caughtUp = await refresh(directory, withPublishedDay(totalReply, delayedDay), { now: new Date('2026-10-29T12:00:00Z') })
  assert.equal(caughtUp.window.end, delayedDay)
  assert.equal(caughtUp.totals['dsh-email'].end, delayedDay)
})

test('an empty registry-wide day cannot be treated as published', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-badge-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  await assert.rejects(refresh(directory, async url => {
    assert.equal(url, lastDayUrl)
    return lastDayReply(window.end, 0)
  }, { now }), /Invalid npm last available day/)
})
