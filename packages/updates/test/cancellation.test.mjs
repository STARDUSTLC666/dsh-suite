import test from 'node:test'
import assert from 'node:assert/strict'
import { NativeInstaller } from '../lib/installer.js'
import { abortable } from '../lib/io.js'
import { UpdateRegistry } from '../lib/registry.js'

test('cancelling during the final idle check prevents native updates and fallback removal', async () => {
  for (const native of [false, true]) {
    const controller = new AbortController(), calls = [], reason = new Error('cancel before admission')
    let resume, entered
    const gate = new Promise(resolve => { resume = resolve })
    const ready = new Promise(resolve => { entered = resolve })
    const manager = {
      removeBundle: async () => { calls.push('remove'); return { application: 'applied' } },
      installBundle: async () => { calls.push('install'); return { application: 'applied' } },
      ...(native ? { updateBundle: async () => { calls.push('update'); return { result: { application: 'applied' } } } } : {}),
    }
    const installer = new NativeInstaller(manager, { canProceed: async () => { entered(); await gate } })
    const pending = installer.install({ name: 'dsh-cite', version: '0.11.4', enabled: true }, { version: '0.11.5' }, 'request', controller.signal)
    const rejected = assert.rejects(pending, error => error === reason)
    await ready; controller.abort(reason); resume()
    await rejected
    assert.deepEqual(calls, [])
  }
})

test('cancelling the startup-owned fallback after its final idle check prevents installation', async () => {
  const controller = new AbortController(), calls = []
  let checks = 0
  const installer = new NativeInstaller({
    removeBundle: async () => ({ error: { code: 'stop-profile' } }),
    installBundle: async () => { calls.push('install'); return { application: 'applied' } },
  }, { canProceed: async () => { if (++checks === 2) controller.abort(new Error('cancel startup fallback')) } })
  await assert.rejects(installer.install({ name: 'dsh-cite', version: '0.11.4', enabled: true }, { version: '0.11.5' }, 'request', controller.signal), /cancel startup fallback/)
  assert.deepEqual(calls, [])
})

test('cancellation after removal restores the previous version without installing the cancelled target', async () => {
  const controller = new AbortController(), versions = []
  let checks = 0
  const installer = new NativeInstaller({
    removeBundle: async () => ({ application: 'applied' }),
    installBundle: async version => { versions.push(version); return { application: 'applied' } },
  }, { canProceed: async () => { if (++checks === 2) controller.abort(new Error('cancel after removal')) } })
  const result = await installer.install({ name: 'dsh-cite', version: '0.11.4', enabled: false }, { version: '0.11.5' }, 'request', controller.signal)
  assert.deepEqual(versions, ['dsh-cite@0.11.4'])
  assert.equal(result.result.application, 'cancelled')
  assert.equal(result.restore.application, 'applied')
})

test('pre-aborted operations still observe an already rejected transport promise', async () => {
  const reason = new Error('already cancelled')
  const pending = Promise.resolve().then(() => abortable(Promise.reject(new Error('late transport failure')), AbortSignal.abort(reason)))
  await assert.rejects(pending, error => error === reason)
  await new Promise(resolve => setImmediate(resolve))
})

test('pre-aborted registry and note requests do not start network operations', async () => {
  let calls = 0
  const registry = new UpdateRegistry({ fetchImpl: async () => { calls++; return Response.json({}) } })
  const reason = new Error('skip request'), signal = AbortSignal.abort(reason)
  await assert.rejects(registry.metadata('dsh-cite', signal), error => error === reason)
  await assert.rejects(registry.notes('dsh-cite', '0.11.4', signal), error => error === reason)
  assert.equal(calls, 0)
})

test('failed registry and note responses release unread bodies without hiding the HTTP result', async () => {
  let released = 0
  const registry = new UpdateRegistry({ fetchImpl: async () => new Response(new ReadableStream({ cancel() { released++; return Promise.reject(new Error('cleanup failed')) } }), { status: 503 }) })
  await assert.rejects(registry.json('https://registry.npmjs.org/dsh-cite'), /registry-http-503/)
  const notes = await registry.notes('dsh-cite', '0.11.4')
  assert.equal(notes.text, null)
  assert.equal(released, 2)
})
