// Statistics and badges live on a separate branch, outside published plugin packages.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
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
function windowThrough(end) {
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 29)
  return { start: start.toISOString().slice(0, 10), end }
}

/** Latest possible complete UTC window, before checking npm data availability. */
export function countWindow(now = new Date()) {
  const end = new Date(now)
  if (!Number.isFinite(end.getTime())) throw new Error('Invalid statistics clock')
  end.setUTCHours(0, 0, 0, 0); end.setUTCDate(end.getUTCDate() - 1)
  return windowThrough(end.toISOString().slice(0, 10))
}
const NPM_METADATA_BASE = 'https://registry.npmjs.org/'
const NPM_STATISTICS_BASE = 'https://api.npmjs.org/downloads/point/'
const NPMMIRROR_STATISTICS_BASE = 'https://registry.npmmirror.com/downloads/point/'

export function validSources(sources, downloads) {
  return !!sources
    && Number.isSafeInteger(sources.npm) && sources.npm >= 0
    && Number.isSafeInteger(sources.npmmirror) && sources.npmmirror >= 0
    && sources.npm + sources.npmmirror === downloads
}

function sourceSummary(sources, suffix = '') {
  return validSources(sources, (sources?.npm ?? -1) + (sources?.npmmirror ?? -1))
    ? ` (npm ${sources.npm}${suffix} + npmmirror ${sources.npmmirror}${suffix})`
    : ''
}

export function validCount(value, name, expected) {
  const date = value && /^\d{4}-\d{2}-\d{2}$/.test(value.start) && /^\d{4}-\d{2}-\d{2}$/.test(value.end)
  return !!date && value.package === name && Number.isSafeInteger(value.downloads) && value.downloads >= 0
    && (value.sources === undefined || validSources(value.sources, value.downloads))
    && Number.isFinite(Date.parse(value.start)) && Number.isFinite(Date.parse(value.end))
    && new Date(value.start).toISOString().slice(0, 10) === value.start && new Date(value.end).toISOString().slice(0, 10) === value.end
    && Date.parse(value.end) - Date.parse(value.start) === 29 * 86400000
    && Date.parse(value.end) <= Date.now()
    && (!expected || value.start === expected.start && value.end === expected.end)
}
export function badge(value) {
  const svg = makeBadge({ label: 'downloads', message: new Intl.NumberFormat('en-US').format(value.downloads) + '/month', color: 'brightgreen' })
  return svg.replace(/<title>[^<]*<\/title>/, `<title>downloads: ${value.downloads}/month${sourceSummary(value.sources, '/month')}; ${value.start} to ${value.end}</title>`)
}
/** Inclusive, non-overlapping yearly requests stay below npm's 18-month and npmmirror's 1-year limits. */
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
  if (value.sources !== undefined && !validSources(value.sources, value.downloads)) return false
  try {
    const first = new Date(value.createdAt).toISOString().slice(0, 10)
    return first >= '2015-01-10' && value.start === first && /^\d{4}-\d{2}-\d{2}$/.test(value.end)
      && new Date(value.end).toISOString().slice(0, 10) === value.end && value.start <= value.end && value.end <= end
  } catch { return false }
}
export function lifetimeBadge(value) {
  const svg = makeBadge({ label: 'total downloads', message: new Intl.NumberFormat('en-US').format(value.downloads), color: 'blue' })
  return svg.replace(/<title>[^<]*<\/title>/, `<title>total downloads: ${value.downloads}${sourceSummary(value.sources)}; ${value.start} to ${value.end}</title>`)
}
async function fetchJson(url, fetcher, label, { allowNotFound = false } = {}) {
  let last
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetcher(url, { signal: AbortSignal.timeout(20000), headers: { accept: 'application/json' } })
      if (allowNotFound && response?.status === 404) return { notFound: true }
      if (!response.ok) {
        const err = new Error(label + ' HTTP ' + response.status)
        if (response?.status === 404) err.noRetry = true
        throw err
      }
      return await response.json()
    } catch (error) {
      last = error
      if (error?.noRetry) break
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    }
  }
  throw last
}
async function metadata(name, fetcher) {
  return fetchJson(NPM_METADATA_BASE + encodeURIComponent(name), fetcher, 'npm metadata')
}
async function request(names, fetcher, period) {
  const path = names ? period + '/' + names : period
  return fetchJson(NPM_STATISTICS_BASE + path, fetcher, 'npm statistics')
}
async function mirrorRequest(name, fetcher, window, { allowNotFound = false } = {}) {
  const period = window.start + ':' + window.end
  const row = await fetchJson(NPMMIRROR_STATISTICS_BASE + period + '/' + name, fetcher, 'npmmirror statistics', { allowNotFound })
  return row?.notFound ? { package: name, start: window.start, end: window.end, downloads: 0 } : row
}
function validWindowPoint(row, name, window) {
  return row?.package === name && row.start === window.start && row.end === window.end
    && Number.isSafeInteger(row.downloads) && row.downloads >= 0
}
export async function lifetimeCount(name, fetcher, end, { allowUnsyncedMirror = false } = {}) {
  const info = await metadata(name, fetcher)
  if (info.name !== name || typeof info.time?.created !== 'string') throw new Error('Unverified package creation date: ' + name)
  const windows = lifetimeWindows(info.time.created, end), segments = []
  let downloads = 0, npmTotal = 0, mirrorTotal = 0
  for (const window of windows) {
    const period = window.start + ':' + window.end
    const [npmRow, mirrorRow] = await Promise.all([
      request(name, fetcher, period),
      mirrorRequest(name, fetcher, window, { allowNotFound: allowUnsyncedMirror }),
    ])
    if (!validWindowPoint(npmRow, name, window)) throw new Error('Invalid lifetime statistics: ' + name)
    if (!validWindowPoint(mirrorRow, name, window)) throw new Error('Invalid npmmirror lifetime statistics: ' + name)
    const segmentDownloads = npmRow.downloads + mirrorRow.downloads
    npmTotal += npmRow.downloads
    mirrorTotal += mirrorRow.downloads
    downloads += segmentDownloads
    if (!Number.isSafeInteger(downloads)) throw new Error('Unsafe lifetime count: ' + name)
    segments.push({ ...window, downloads: segmentDownloads, sources: { npm: npmRow.downloads, npmmirror: mirrorRow.downloads } })
  }
  return { package: name, downloads, start: windows[0].start, end, createdAt: info.time.created, sources: { npm: npmTotal, npmmirror: mirrorTotal }, segments }
}

function isUtcDay(day) {
  return typeof day === 'string' && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day
}

async function publishedDay(fetcher, expectedEnd) {
  // An explicit date can return a zero before npm has processed that day's logs.
  const latest = await request('', fetcher, 'last-day')
  const day = latest?.end
  if (!isUtcDay(day) || latest.start !== day || day > expectedEnd
      || !Number.isSafeInteger(latest.downloads) || latest.downloads <= 0) {
    throw new Error('Invalid npm last available day')
  }
  return day
}

export async function refresh(directory, fetcher = fetch, { now = new Date(), includeTotals = true } = {}) {
  const schemaVersion = includeTotals ? 4 : 2
  const expectedEnd = countWindow(now).end
  const availableThrough = await publishedDay(fetcher, expectedEnd)
  const output = resolve(directory), statsFile = join(output, 'downloads.json')
  let previous = { entries: {} }
  if (existsSync(statsFile)) {
    try { previous = JSON.parse(readFileSync(statsFile, 'utf8')) ?? previous } catch { /* no unvalidated fallback */ }
  }
  const previousEnd = previous.window?.end
  const hasRetained = (previous.retained?.length ?? 0) > 0 || (includeTotals && (previous.totalsRetained?.length ?? 0) > 0)
  if (previous.schemaVersion === schemaVersion && Array.isArray(previous.sources) && !hasRetained
      && availableThrough < expectedEnd && isUtcDay(previousEnd) && previousEnd >= availableThrough) {
    return { pending: true, expectedEnd, availableThrough }
  }

  const window = windowThrough(availableThrough), period = window.start + ':' + window.end
  const counts = {}, mirrorCounts = {}, failures = []
  const plain = packages.filter(([, name]) => !name.startsWith('@')).map(([, name]) => name)
  try { Object.assign(counts, await request(plain.join(','), fetcher, period)) } catch (error) { failures.push(error.message) }
  // npm does not support scoped names in a bulk statistics request.
  for (const [, name] of packages.filter(([, name]) => name.startsWith('@'))) {
    try { counts[name] = await request(name, fetcher, period) } catch (error) { failures.push(name + ': ' + error.message) }
  }
  let mirrorIndex = 0
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (mirrorIndex < packages.length) {
      const [repo, name] = packages[mirrorIndex++]
      const allowNotFound = !previous.entries?.[repo] || previous.entries[repo]?.sources?.npmmirror === 0
      try { mirrorCounts[name] = await mirrorRequest(name, fetcher, window, { allowNotFound }) }
      catch (error) { failures.push(name + ' (npmmirror): ' + error.message) }
    }
  }))
  const entries = {}, retained = [], missing = []
  for (const [repo, name] of packages) {
    if (validCount(counts[name], name, window) && validCount(mirrorCounts[name], name, window)) {
      const npmDownloads = counts[name].downloads, mirrorDownloads = mirrorCounts[name].downloads
      const downloads = npmDownloads + mirrorDownloads
      if (!Number.isSafeInteger(downloads)) { missing.push(repo); continue }
      entries[repo] = { package: name, downloads, start: window.start, end: window.end, sources: { npm: npmDownloads, npmmirror: mirrorDownloads } }
    } else if (validCount(previous.entries?.[repo], name) && Date.parse(previous.entries[repo].end) <= Date.parse(window.end) && Date.parse(previous.entries[repo].end) >= Date.parse(window.end) - 7 * 86400000) {
      entries[repo] = previous.entries[repo]; retained.push(repo)
    } else missing.push(repo)
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
          const allowUnsyncedMirror = (!previous.totals?.[repo] || previous.totals[repo]?.sources?.npmmirror === 0)
            && entries[repo]?.sources?.npmmirror === 0
          const value = await lifetimeCount(name, fetcher, window.end, { allowUnsyncedMirror })
          if (value.end === entries[repo].end && (
            value.downloads < entries[repo].downloads
            || entries[repo].sources && (value.sources.npm < entries[repo].sources.npm || value.sources.npmmirror < entries[repo].sources.npmmirror)
          )) {
            throw new Error('Lifetime count is below the monthly count: ' + name)
          }
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
  const snapshot = {
    schemaVersion,
    source: NPM_STATISTICS_BASE + period + '/',
    sources: [NPM_STATISTICS_BASE + period + '/', NPMMIRROR_STATISTICS_BASE + period + '/'],
    window,
    entries,
    retained,
    ...(includeTotals ? { totals, totalsRetained } : {}),
  }
  const { refreshedAt, ...previousSnapshot } = previous
  const report = typeof refreshedAt === 'string' && isDeepStrictEqual(previousSnapshot, snapshot)
    ? previous
    : { ...snapshot, refreshedAt: new Date(now).toISOString() }
  writeFileSync(statsFile, JSON.stringify(report, null, 2) + '\n')
  if (retained.length) console.warn('Preserved earlier verified statistics for: ' + retained.join(', '))
  for (const message of failures) console.warn(message)
  return report
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await refresh(process.argv[2] ?? '.download-badges')
  if (result.pending) {
    console.log('npm downloads are available through ' + result.availableThrough + '. Waiting for ' + result.expectedEnd + '.')
  } else {
    console.log(JSON.stringify({ badges: Object.keys(result.entries).length, totalBadges: Object.keys(result.totals || {}).length, retained: result.retained, totalsRetained: result.totalsRetained }))
  }
}
