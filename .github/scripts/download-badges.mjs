// Statistics and badges live on a separate branch, outside published plugin packages.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const require = createRequire(new URL('../download-badges/package.json', import.meta.url))
const { makeBadge } = require('badge-maker')
export const packages = [
  ['dsh-calendar', 'dsh-calendar'], ['dsh-cite', 'dsh-cite'],
  ['dsh-code-security', 'dsh-code-security'], ['dsh-codex-port', 'dsh-codex-port'],
  ['dsh-computer-use', 'deepseek-computer-use'],
  ['dsh-dingtalk', 'dsh-dingtalk'], ['dsh-docker', '@stardustlc/dsh-docker'],
  ['dsh-dream', '@stardustlc/dsh-dream'], ['dsh-email', 'dsh-email'],
  ['dsh-ffmpeg', 'dsh-ffmpeg'], ['dsh-flakefinder', 'dsh-flakefinder'],
  ['dsh-hyperframes', 'dsh-hyperframes'], ['dsh-minimal-ptc', 'dsh-minimal-ptc'],
  ['dsh-ppt', 'dsh-ppt'], ['dsh-remotion', 'dsh-remotion'], ['dsh-rss', 'dsh-rss'],
  ['dsh-review', '@stardustlc/dsh-review'],
  ['dsh-slack', 'dsh-slack'], ['dsh-sql', 'dsh-sql'],
  ['dsh-suite', '@stardustlc/dsh-suite'], ['dsh-voice', 'dsh-voice'],
]
/** Query complete UTC days explicitly; relative aliases can be cached incorrectly. */
export function countWindow(now = new Date()) {
  const end = new Date(now)
  if (!Number.isFinite(end.getTime())) throw new Error('Invalid statistics clock')
  end.setUTCHours(0, 0, 0, 0); end.setUTCDate(end.getUTCDate() - 1)
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 29)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}
export function validCount(value, name, expected) {
  const date = value && /^\d{4}-\d{2}-\d{2}$/.test(value.start) && /^\d{4}-\d{2}-\d{2}$/.test(value.end)
  return !!date && value.package === name && Number.isSafeInteger(value.downloads) && value.downloads >= 0
    && Number.isFinite(Date.parse(value.start)) && Number.isFinite(Date.parse(value.end))
    && new Date(value.start).toISOString().slice(0, 10) === value.start && new Date(value.end).toISOString().slice(0, 10) === value.end
    && Date.parse(value.end) - Date.parse(value.start) === 29 * 86400000
    && Date.parse(value.end) <= Date.now()
    && (!expected || value.start === expected.start && value.end === expected.end)
}
export function badge(value) {
  const svg = makeBadge({ label: 'downloads', message: new Intl.NumberFormat('en-US').format(value.downloads) + '/month', color: 'brightgreen' })
  return svg.replace(/<title>[^<]*<\/title>/, `<title>npm downloads: ${value.downloads}/month; ${value.start} to ${value.end}</title>`)
}
/** Inclusive, non-overlapping yearly requests stay below npm's 18-month limit. */
export function lifetimeWindows(created, end) {
  if (typeof created !== 'string' || !Number.isFinite(Date.parse(created))) throw new Error('Missing valid first-publication date')
  const first = new Date(created).toISOString().slice(0, 10)
  if (first < '2015-01-10' || !/^\d{4}-\d{2}-\d{2}$/.test(end) || first > end) throw new Error('No complete lifetime statistics window')
  const windows = []; let start = first
  while (start <= end) {
    const stop = new Date(start); stop.setUTCDate(stop.getUTCDate() + 364)
    const finish = stop.toISOString().slice(0, 10) < end ? stop.toISOString().slice(0, 10) : end
    windows.push({ start, end: finish }); const next = new Date(finish); next.setUTCDate(next.getUTCDate() + 1); start = next.toISOString().slice(0, 10)
  }
  return windows
}
export function validLifetime(value, name, end) {
  if (!value || value.package !== name || !Number.isSafeInteger(value.downloads) || value.downloads < 0 || typeof value.createdAt !== 'string') return false
  try {
    const first = new Date(value.createdAt).toISOString().slice(0, 10)
    return first >= '2015-01-10' && value.start === first && /^\d{4}-\d{2}-\d{2}$/.test(value.end)
      && new Date(value.end).toISOString().slice(0, 10) === value.end && value.start <= value.end && value.end <= end
  } catch { return false }
}
export function lifetimeBadge(value) {
  const svg = makeBadge({ label: 'total downloads', message: new Intl.NumberFormat('en-US').format(value.downloads), color: 'blue' })
  return svg.replace(/<title>[^<]*<\/title>/, `<title>npm total downloads: ${value.downloads}; ${value.start} to ${value.end}</title>`)
}
async function metadata(name, fetcher) {
  let last
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const response = await fetcher('https://registry.npmjs.org/' + encodeURIComponent(name), { signal: AbortSignal.timeout(20000), headers: { accept: 'application/json' } }); if (!response.ok) throw new Error('npm metadata HTTP ' + response.status); return await response.json() }
    catch (error) { last = error; if (attempt < 2) await new Promise(r => setTimeout(r, 2000 * (attempt + 1))) }
  }
  throw last
}
export async function lifetimeCount(name, fetcher, end) {
  const info = await metadata(name, fetcher)
  if (info.name !== name || typeof info.time?.created !== 'string') throw new Error('Unverified package creation date: ' + name)
  const windows = lifetimeWindows(info.time.created, end), segments = []; let downloads = 0
  for (const window of windows) {
    const row = await request(name, fetcher, window.start + ':' + window.end)
    if (row?.package !== name || row.start !== window.start || row.end !== window.end || !Number.isSafeInteger(row.downloads) || row.downloads < 0) throw new Error('Invalid lifetime statistics: ' + name)
    downloads += row.downloads; if (!Number.isSafeInteger(downloads)) throw new Error('Unsafe lifetime count: ' + name)
    segments.push({ ...window, downloads: row.downloads })
  }
  return { package: name, downloads, start: windows[0].start, end, createdAt: info.time.created, segments }
}
async function request(names, fetcher, period) {
  let last
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetcher('https://api.npmjs.org/downloads/point/' + period + '/' + names, { signal: AbortSignal.timeout(20000), headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error('npm statistics HTTP ' + response.status)
      return await response.json()
    } catch (error) {
      last = error
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    }
  }
  throw last
}
export async function refresh(directory, fetcher = fetch, { now = new Date(), includeTotals = true } = {}) {
  const window = countWindow(now), period = window.start + ':' + window.end
  const output = resolve(directory), statsFile = join(output, 'downloads.json')
  let previous = { entries: {} }
  if (existsSync(statsFile)) {
    try { previous = JSON.parse(readFileSync(statsFile, 'utf8')) } catch { /* no unvalidated fallback */ }
  }
  const counts = {}, failures = []
  const plain = packages.filter(([, name]) => !name.startsWith('@')).map(([, name]) => name)
  try { Object.assign(counts, await request(plain.join(','), fetcher, period)) } catch (error) { failures.push(error.message) }
  // npm does not support scoped names in a bulk statistics request.
  for (const [, name] of packages.filter(([, name]) => name.startsWith('@'))) {
    try { counts[name] = await request(name, fetcher, period) } catch (error) { failures.push(name + ': ' + error.message) }
  }
  const entries = {}, retained = [], missing = []
  for (const [repo, name] of packages) {
    if (validCount(counts[name], name, window)) entries[repo] = counts[name]
    else if (validCount(previous.entries?.[repo], name) && Date.parse(previous.entries[repo].end) <= Date.parse(window.end) && Date.parse(previous.entries[repo].end) >= Date.parse(window.end) - 7 * 86400000) { entries[repo] = previous.entries[repo]; retained.push(repo) }
    else missing.push(repo)
  }
  // A failed first fetch never creates a fake zero or an error badge.
  if (missing.length) throw new Error('No verified statistics for: ' + missing.join(', '))
  if (retained.length === packages.length) throw new Error('All upstream requests failed; existing badges remain untouched')
  const totals = {}, totalsRetained = [], totalMissing = []
  if (includeTotals) {
    let index = 0
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (index < packages.length) {
        const [repo, name] = packages[index++]
        try {
          const value = await lifetimeCount(name, fetcher, window.end)
          if (value.end === entries[repo].end && value.downloads < entries[repo].downloads) throw new Error('Lifetime count is below the monthly count: ' + name)
          totals[repo] = value
        } catch (error) {
          failures.push(name + ': ' + error.message)
          const old = previous.totals?.[repo]
          if (validLifetime(old, name, window.end) && Date.parse(old.end) >= Date.parse(window.end) - 7 * 86400000) { totals[repo] = old; totalsRetained.push(repo) }
          else totalMissing.push(repo)
        }
      }
    }))
    if (totalMissing.length) throw new Error('No verified lifetime statistics for: ' + totalMissing.join(', '))
    if (totalsRetained.length === packages.length) throw new Error('All lifetime requests failed; existing badges remain untouched')
  }
  mkdirSync(join(output, 'assets'), { recursive: true })
  for (const [repo] of packages) writeFileSync(join(output, 'assets', repo + '-downloads.svg'), badge(entries[repo]) + '\n')
  if (includeTotals) for (const [repo] of packages) writeFileSync(join(output, 'assets', repo + '-total-downloads.svg'), lifetimeBadge(totals[repo]) + '\n')
  const report = { schemaVersion: includeTotals ? 3 : 2, source: 'https://api.npmjs.org/downloads/point/' + period + '/', window, refreshedAt: new Date(now).toISOString(), entries, retained, ...(includeTotals ? { totals, totalsRetained } : {}) }
  writeFileSync(statsFile, JSON.stringify(report, null, 2) + '\n')
  if (retained.length) console.warn('Preserved earlier verified statistics for: ' + retained.join(', '))
  for (const message of failures) console.warn(message)
  return report
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await refresh(process.argv[2] ?? '.download-badges')
  console.log(JSON.stringify({ badges: Object.keys(result.entries).length, totalBadges: Object.keys(result.totals || {}).length, retained: result.retained, totalsRetained: result.totalsRetained }))
}
