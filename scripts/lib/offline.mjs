import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/** Pass only process-launch essentials, never the user's tokens or service configuration. */
export function offlineEnvironment(directory, source = process.env) {
  const allowed = new Set(['path', 'systemroot', 'windir', 'comspec', 'pathext', 'programfiles', 'programfiles(x86)', 'lang', 'lc_all', 'tz'])
  const env = Object.fromEntries(Object.entries(source).filter(([key]) => allowed.has(key.toLowerCase())))
  for (const name of ['home', 'tmp', 'dsh', 'codex', 'config']) mkdirSync(join(directory, name), { recursive: true })
  return {
    ...env,
    HOME: join(directory, 'home'), USERPROFILE: join(directory, 'home'),
    TMP: join(directory, 'tmp'), TEMP: join(directory, 'tmp'), TMPDIR: join(directory, 'tmp'),
    DSH_HOME: join(directory, 'dsh'), CODEX_HOME: join(directory, 'codex'),
    XDG_CONFIG_HOME: join(directory, 'config'), NO_COLOR: '1',
  }
}

export function isLoopback(host) {
  const value = String(host ?? 'localhost').replace(/^\[|\]$/g, '').toLowerCase()
  return value === 'localhost' || value === '::1' || /^127\.\d+\.\d+\.\d+$/.test(value)
    || /^::ffff:127\.\d+\.\d+\.\d+$/.test(value)
}
