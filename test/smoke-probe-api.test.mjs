import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

const smoke = readFileSync(new URL('../scripts/smoke-harness.mjs', import.meta.url), 'utf8')
const match = /writeFileSync\(join\(probeDir, 'index\.mjs'\), `([\s\S]*?)\n`\)/.exec(smoke)
assert.ok(match, 'Smoke entry must emit its real probe module')
const source = match[1].replace(/^import .*\n/gm, '').replace(/^export /gm, '')

async function runProbe(reply) {
  const requests = []
  const names = ['hyperframes_health', 'remotion_health']
  let report, done
  const finished = new Promise(resolve => { done = resolve })
  const context = {
    writeFileSync(_path, text) { report = JSON.parse(text); done() },
    AbortSignal,
    Date,
    ctx: {
      effect(fn) { fn() },
      appReady: { onReady(fn) { fn() } },
      tools: {
        definitions: () => names.map(name => ({ name })),
        schemas: () => names.map(name => ({ name })),
        async execute(input) {
          assert.ok(Array.isArray(input.calls), 'Current DSH API accepts a calls batch')
          assert.equal(input.calls.length, 1)
          const call = input.calls[0]
          assert.equal(call.type, 'tool-call')
          assert.equal(call.id, 'smoke-' + call.name)
          assert.equal(typeof call.arguments, 'string')
          assert.deepEqual(JSON.parse(call.arguments), {})
          assert.equal(input.signal.aborted, false)
          requests.push(call)
          return reply(call)
        },
      },
      skills: { list: async () => [] },
      agentPresets: { list: async () => [{ id: 'ptc-minimal' }], mount: async () => {} },
      agents: { create: async () => ({ agent: {}, dispose: async () => {} }) },
      systemPrompt: { assemble: async () => ({ tools: [{ name: 'run_code' }], sections: [] }) },
    },
  }
  runInNewContext(source + '\napply(ctx, {report:"probe.json"})', context)
  await finished
  return { report, requests }
}

test('generated smoke probe dispatches current tool-call batches and reads their individual results', async () => {
  const { report, requests } = await runProbe(call => ({ results: [{ callId: call.id, result: { isError: false, value: { ok: true, name: call.name } } }] }))
  assert.equal(report.error, undefined)
  assert.deepEqual(requests.map(call => call.name), ['hyperframes_health', 'remotion_health'])
  assert.equal(report.skillHealth.hyperframes_health.value.name, 'hyperframes_health')
  assert.equal(report.skillHealth.remotion_health.value.ok, true)
})

test('generated smoke probe rejects an incomplete or mismatched batch response', async () => {
  for (const response of [{ results: [] }, { results: [{ callId: 'another-call', result: { isError: false, value: { ok: true } } }] }]) {
    const { report } = await runProbe(() => response)
    assert.match(report.error, /incomplete|mismatch/i)
    assert.equal(report.skillHealth, undefined)
  }
})
