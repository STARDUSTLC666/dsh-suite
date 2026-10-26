import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import lockfile from 'proper-lockfile'
import { DEFAULT_PREFERENCES, preferences } from './policy.js'

export class UpdateStore {
  constructor(profileDir) { this.directory = profileDir; this.file = join(profileDir, 'stardustlc-plugin-updates.json'); this.cacheFile = join(profileDir, 'stardustlc-plugin-update-cache.json') }
  async read() {
    try {
      const stat = await fs.lstat(this.file)
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 32768) throw new Error('invalid-preferences')
      return { value: preferences(JSON.parse(await fs.readFile(this.file, 'utf8'))), error: null }
    } catch (error) {
      if (error.code === 'ENOENT') return { value: structuredClone(DEFAULT_PREFERENCES), error: null }
      return { value: structuredClone(DEFAULT_PREFERENCES), error: 'preferences-unreadable' }
    }
  }
  async atomic(file, value) {
    try { if ((await fs.lstat(file)).isSymbolicLink()) throw new Error('unsafe-state-file') } catch (error) { if (error.code !== 'ENOENT') throw error }
    const tmp = file + '.' + randomUUID() + '.tmp'
    try { await fs.writeFile(tmp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); await fs.rename(tmp, file) }
    finally { await fs.unlink(tmp).catch(error => { if (error.code !== 'ENOENT') throw error }) }
  }
  async change(revision, edit) {
    await fs.mkdir(this.directory, { recursive: true })
    const release = await lockfile.lock(this.file, { realpath: false, stale: 10000, retries: { retries: 4, minTimeout: 25, maxTimeout: 100 } })
    try {
      const current = await this.read()
      if (current.error) throw new Error(current.error)
      if (current.value.revision !== revision) throw new Error('preferences-conflict')
      const next = preferences(edit(structuredClone(current.value)))
      next.revision = current.value.revision + 1
      await this.atomic(this.file, next); return next
    } finally { await release() }
  }
  async readCache() {
    try {
      const stat = await fs.lstat(this.cacheFile)
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 256 * 1024) return null
      const value = JSON.parse(await fs.readFile(this.cacheFile, 'utf8'))
      return value?.schema === 1 && Number.isSafeInteger(value.checkedAt) && Array.isArray(value.rows) && value.rows.length <= 21 ? value : null
    } catch { return null }
  }
  async saveCache(rows, checkedAt, automaticAttempts = {}) { await this.atomic(this.cacheFile, { schema: 1, checkedAt, rows, automaticAttempts }) }
}
