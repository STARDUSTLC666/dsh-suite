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
  ['dsh-dingtalk', 'dsh-dingtalk'], ['dsh-docker', '@stardustlc/dsh-docker'],
  ['dsh-dream', '@stardustlc/dsh-dream'], ['dsh-email', 'dsh-email'],
  ['dsh-ffmpeg', 'dsh-ffmpeg'], ['dsh-flakefinder', 'dsh-flakefinder'],
  ['dsh-hyperframes', 'dsh-hyperframes'], ['dsh-minimal-ptc', 'dsh-minimal-ptc'],
  ['dsh-ppt', 'dsh-ppt'], ['dsh-remotion', 'dsh-remotion'], ['dsh-rss', 'dsh-rss'],
  ['dsh-slack', 'dsh-slack'], ['dsh-sql', 'dsh-sql'],
  ['dsh-suite', '@stardustlc/dsh-suite'], ['dsh-voice', 'dsh-voice'],
]
export function validCount(value, name) {
  const date = value && /^\d{4}-\d{2}-\d{2}$/.test(value.start) && /^\d{4}-\d{2}-\d{2}$/.test(value.end)
  return !!date && value.package === name && Number.isSafeInteger(value.downloads) && value.downloads >= 0
    && Date.parse(value.end) - Date.parse(value.start) === 29 * 86400000
    && Date.parse(value.end) <= Date.now()
}
export function badge(value) {
  const svg = makeBadge({ label: 'downloads', message: new Intl.NumberFormat('en-US').format(value.downloads) + '/month', color: 'brightgreen' })
  return svg.replace(/<title>[^<]*<\/title>/, `<title>npm downloads: ${value.downloads}/month; ${value.start} to ${value.end}</title>`)
}
async function request(names, fetcher) {
  let last
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetcher('https://api.npmjs.org/downloads/point/last-month/' + names, { signal: AbortSignal.timeout(20000), headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error('npm statistics HTTP ' + response.status)
      return await response.json()
    } catch (error) {
      last = error
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    }
  }
  throw last
}
export async function refresh(directory, fetcher = fetch) {
  const output = resolve(directory), statsFile = join(output, 'downloads.json')
  let previous = { entries: {} }
  if (existsSync(statsFile)) {
    try { previous = JSON.parse(readFileSync(statsFile, 'utf8')) } catch { /* no unvalidated fallback */ }
  }
  const counts = {}, failures = []
  const plain = packages.filter(([, name]) => !name.startsWith('@')).map(([, name]) => name)
  try { Object.assign(counts, await request(plain.join(','), fetcher)) } catch (error) { failures.push(error.message) }
  // npm does not support scoped names in a bulk statistics request.
  for (const [, name] of packages.filter(([, name]) => name.startsWith('@'))) {
    try { counts[name] = await request(name, fetcher) } catch (error) { failures.push(name + ': ' + error.message) }
  }
  const entries = {}, retained = [], missing = []
  for (const [repo, name] of packages) {
    if (validCount(counts[name], name)) entries[repo] = counts[name]
    else if (validCount(previous.entries?.[repo], name)) { entries[repo] = previous.entries[repo]; retained.push(repo) }
    else missing.push(repo)
  }
  // A failed first fetch never creates a fake zero or an error badge.
  if (missing.length) throw new Error('No verified statistics for: ' + missing.join(', '))
  if (retained.length === packages.length) throw new Error('All upstream requests failed; existing badges remain untouched')
  mkdirSync(join(output, 'assets'), { recursive: true })
  for (const [repo] of packages) writeFileSync(join(output, 'assets', repo + '-downloads.svg'), badge(entries[repo]) + '\n')
  const report = { schemaVersion: 1, source: 'https://api.npmjs.org/downloads/point/last-month/', refreshedAt: new Date().toISOString(), entries, retained }
  writeFileSync(statsFile, JSON.stringify(report, null, 2) + '\n')
  if (retained.length) console.warn('Preserved earlier verified statistics for: ' + retained.join(', '))
  for (const message of failures) console.warn(message)
  return report
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await refresh(process.argv[2] ?? '.download-badges')
  console.log(JSON.stringify({ badges: Object.keys(result.entries).length, retained: result.retained }))
}
