import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { offlineEnvironment } from '../scripts/lib/offline.mjs'

test('offline environment isolates home and omits service credentials', () => {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-offline-test-'))
  const env = offlineEnvironment(directory, { PATH: 'tools', SystemRoot: 'system', DSH_SLACK_TOKEN: 'secret', HTTPS_PROXY: 'secret', NODE_OPTIONS: 'secret', HOME: 'real-home' })
  assert.equal(env.PATH, 'tools')
  assert.equal(env.SystemRoot, 'system')
  for (const key of ['DSH_SLACK_TOKEN', 'HTTPS_PROXY', 'NODE_OPTIONS']) assert.equal(env[key], undefined)
  assert.equal(env.HOME, join(directory, 'home'))
  assert.equal(env.DSH_HOME, join(directory, 'dsh'))
})

test('network guard rejects remote fetch/TCP while allowing a loopback HTTP fixture', () => {
  const preload = new URL('../scripts/lib/no-network.mjs', import.meta.url).href
  const source = `
    import assert from 'node:assert/strict';
    import { createServer } from 'node:http';
    import { Socket } from 'node:net';
    await assert.rejects(fetch('https://example.invalid'), /blocked an external fetch/);
    assert.throws(() => new Socket().connect({host:'example.invalid',port:443}), /blocked an external network/);
    const server = createServer((_request, response) => response.end('fixture'));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const response = await fetch('http://127.0.0.1:' + server.address().port);
      assert.equal(await response.text(), 'fixture');
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  `
  execFileSync(process.execPath, ['--import', preload, '--input-type=module', '-e', source], { windowsHide: true, timeout: 10000 })
})
