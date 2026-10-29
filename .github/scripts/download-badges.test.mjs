import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { badge, countWindow, packages, refresh, validCount, lifetimeWindows, lifetimeCount, lifetimeBadge, validLifetime } from './download-badges.mjs'
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
  const report = await refresh(directory, fetcher, { now, includeTotals: false })
  assert.equal(calls.length, 5)
  assert.equal(Object.keys(report.entries).length, 21)
  assert.deepEqual(report.retained, ['dsh-email'])
  assert.match(readFileSync(join(directory, 'assets/dsh-email-downloads.svg'), 'utf8'), /5,800\/month/)
  assert.equal(packages.length, 21)
  assert.ok(packages.some(([,name]) => name === 'deepseek-computer-use'))
  assert.ok(packages.some(([,name]) => name === '@stardustlc/dsh-review'))
  assert.ok(!packages.some(([,name]) => name === '@stardustlc/dsh-updates'))
})

test('lifetime windows cover every day once while remaining below the API range limit', () => {
  const windows=lifetimeWindows('2024-02-28T18:30:00Z','2026-10-26')
  assert.equal(windows[0].start,'2024-02-28');assert.equal(windows.at(-1).end,'2026-10-26')
  let days=0;for(let i=0;i<windows.length;i++){const w=windows[i],span=(Date.parse(w.end)-Date.parse(w.start))/86400000+1;assert.ok(span>0&&span<=365);days+=span;if(i)assert.equal(Date.parse(w.start)-Date.parse(windows[i-1].end),86400000)}
  assert.equal(days,(Date.parse('2026-10-26')-Date.parse('2024-02-28'))/86400000+1)
  for(const created of ['bad','2014-01-01','2026-10-27T00:00:00Z'])assert.throws(()=>lifetimeWindows(created,'2026-10-26'))
})
const totalReply=async (url,change=value=>value)=>{
  if(typeof change!=='function')change=value=>value
  const target=new URL(url)
  if(target.hostname==='registry.npmjs.org'){const name=decodeURIComponent(target.pathname.slice(1));return{ok:true,json:async()=>({name,time:{created:'2026-09-01T12:00:00Z'}})}}
  const [,start,end]=/^\/downloads\/point\/([^:]+):([^/]+)\//.exec(target.pathname)||[]
  const names=namesIn(url),rows=Object.fromEntries(names.map(name=>[name,change({package:name,start,end,downloads:start==='2026-09-01'?10000:5800})]))
  return{ok:true,json:async()=>names.length>1?rows:rows[names[0]]}
}
test('lifetime count uses creation metadata and a cumulative label instead of a monthly count',async()=>{
  const total=await lifetimeCount('@stardustlc/dsh-suite',totalReply,window.end)
  assert.equal(total.downloads,10000);assert.equal(total.start,'2026-09-01');assert.equal(total.end,window.end)
  assert.ok(validLifetime(total,'@stardustlc/dsh-suite',window.end));assert.match(lifetimeBadge(total),/10,000/);assert.doesNotMatch(lifetimeBadge(total),/\/month/)
  await assert.rejects(lifetimeCount('dsh-email',async()=>({ok:true,json:async()=>({name:'other',time:{created:'2026-09-01'}})}),window.end),/creation date/)
})
test('refresh generates both badge types and never accepts a total smaller than the matching month',async t=>{
  const dir=mkdtempSync(join(tmpdir(),'dsh-total-badges-'));t.after(()=>rmSync(dir,{recursive:true,force:true}))
  const report=await refresh(dir,totalReply,{now});assert.equal(report.schemaVersion,3);assert.equal(Object.keys(report.totals).length,21)
  assert.match(readFileSync(join(dir,'assets/dsh-email-total-downloads.svg'),'utf8'),/10,000/)
  const before=readFileSync(join(dir,'downloads.json'),'utf8')
  const after=await refresh(dir,url=>totalReply(url,row=>row.start==='2026-09-01'&&row.package==='dsh-email'?{...row,downloads:1}:row),{now})
  assert.deepEqual(after.totalsRetained,['dsh-email']);assert.equal(after.totals['dsh-email'].downloads,10000)
  assert.equal(JSON.parse(before).totals['dsh-email'].downloads,10000)
})
test('missing lifetime data on a first run does not publish monthly-only or fake zero totals',async t=>{
  const dir=mkdtempSync(join(tmpdir(),'dsh-total-badges-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));const file=join(dir,'downloads.json');writeFileSync(file,'{"keep":true}')
  await assert.rejects(refresh(dir,url=>totalReply(url,row=>row.start==='2026-09-01'?{error:'unavailable'}:row),{now}),/No verified lifetime/)
  assert.equal(readFileSync(file,'utf8'),'{"keep":true}')
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
