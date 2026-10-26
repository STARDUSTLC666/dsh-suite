import { PACKAGES } from './policy.js'
import { abortable, boundedBody } from './io.js'

export class UpdateRegistry {
  constructor({ fetchImpl = fetch, timeoutMs = 15000 } = {}) { this.fetch = fetchImpl; this.timeoutMs = timeoutMs }
  async json(url, signal, maxBytes = 2 * 1024 * 1024) {
    const combined = signal ? AbortSignal.any([signal, AbortSignal.timeout(this.timeoutMs)]) : AbortSignal.timeout(this.timeoutMs)
    const response = await abortable(this.fetch(url, { redirect: 'error', signal: combined, headers: { accept: 'application/json' } }), combined)
    if (!response.ok || !response.body) throw new Error('registry-http-' + response.status)
    return JSON.parse(await boundedBody(response.body, maxBytes, combined))
  }
  async metadata(name, signal) {
    if (!Object.hasOwn(PACKAGES, name)) throw new Error('unknown-package')
    for (const registry of ['https://registry.npmjs.org', 'https://registry.npmmirror.com']) {
      try { return { document: await this.json(registry + '/' + encodeURIComponent(name), signal), registry } }
      catch (error) { signal?.throwIfAborted(); if (registry.includes('npmmirror.com')) throw new Error('registry-unavailable') }
    }
  }
  async notes(name, version, signal) {
    const item = PACKAGES[name]
    if (!item || !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) throw new Error('invalid-release')
    const url = 'https://raw.githubusercontent.com/STARDUSTLC666/' + item[2] + '/' + item[3] + '/CHANGELOG.md'
    const combined = signal ? AbortSignal.any([signal, AbortSignal.timeout(this.timeoutMs)]) : AbortSignal.timeout(this.timeoutMs)
    const response = await abortable(this.fetch(url, { redirect: 'error', signal: combined }), combined)
    if (!response.ok || !response.body) return { text: null, url: 'https://github.com/STARDUSTLC666/' + item[2] + '/blob/' + item[3] + '/CHANGELOG.md' }
    const text = await boundedBody(response.body, 256 * 1024, combined), escaped = version.replaceAll('.', '\\.')
    const match = new RegExp('^##\\s+(?:v)?' + escaped + '(?=[\\s（(]|$)[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))', 'm').exec(text)
    return { text: match?.[1]?.trim().slice(0, 8000) ?? null, url: 'https://github.com/STARDUSTLC666/' + item[2] + '/blob/' + item[3] + '/CHANGELOG.md' }
  }
}
