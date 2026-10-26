import semver from 'semver'

// Deliberately fixed: request bodies cannot choose arbitrary packages or repositories.
export const PACKAGES = Object.freeze({
  'dsh-calendar': ['日历', 'Calendar', 'dsh-calendar', 'main'],
  'dsh-cite': ['引文库', 'Citations', 'dsh-cite', 'master'],
  'dsh-code-security': ['代码安全', 'Code Security', 'dsh-code-security', 'master'],
  'dsh-codex-port': ['Codex 技能移植', 'Codex Port', 'dsh-codex-port', 'master'],
  'deepseek-computer-use': ['电脑操作', 'Computer Use', 'deepseek-computer-use', 'main'],
  'dsh-dingtalk': ['钉钉', 'DingTalk', 'dsh-dingtalk', 'main'],
  '@stardustlc/dsh-docker': ['Docker', 'Docker', 'dsh-docker', 'master'],
  '@stardustlc/dsh-dream': ['Dream 记忆', 'Dream', 'dsh-dream', 'master'],
  'dsh-email': ['邮件', 'Email', 'dsh-email', 'main'],
  'dsh-ffmpeg': ['FFmpeg', 'FFmpeg', 'dsh-ffmpeg', 'master'],
  'dsh-flakefinder': ['不稳定测试排查', 'Flakefinder', 'dsh-flakefinder', 'master'],
  'dsh-hyperframes': ['HyperFrames', 'HyperFrames', 'dsh-hyperframes', 'master'],
  'dsh-minimal-ptc': ['极简 PTC', 'Minimal PTC', 'dsh-minimal-ptc', 'main'],
  'dsh-ppt': ['演示文稿', 'PPT', 'dsh-ppt', 'master'],
  'dsh-remotion': ['Remotion', 'Remotion', 'dsh-remotion', 'master'],
  '@stardustlc/dsh-review': ['代码审阅', 'Review', 'dsh-review', 'main'],
  'dsh-rss': ['RSS 订阅', 'RSS', 'dsh-rss', 'master'],
  'dsh-slack': ['Slack', 'Slack', 'dsh-slack', 'main'],
  'dsh-sql': ['数据库', 'SQL', 'dsh-sql', 'master'],
  '@stardustlc/dsh-suite': ['组合包', 'Suite', 'dsh-suite', 'master'],
  'dsh-voice': ['语音', 'Voice', 'dsh-voice', 'master'],
})
export const SUITE = '@stardustlc/dsh-suite'
export const SUITE_COMPONENTS = new Set(Object.keys(PACKAGES).filter(name => ![SUITE, '@stardustlc/dsh-review', 'deepseek-computer-use'].includes(name)))
export const DEFAULT_PACKAGE_PREFERENCES = Object.freeze({ checkEnabled: true, autoInstall: false, deferredUntil: 0, ignoredVersion: null })
export const DEFAULT_PREFERENCES = Object.freeze({ schema: 1, revision: 0, packages: Object.freeze({}) })
export const CHECK_INTERVAL = 24 * 60 * 60 * 1000
export const PLAN_MAX_AGE = 30 * 60 * 1000
export const AUTO_QUIET_MS = 2 * 60 * 1000

export function preferences(raw) {
  if (!raw || raw.schema !== 1 || !Number.isSafeInteger(raw.revision) || raw.revision < 0 || !raw.packages || typeof raw.packages !== 'object' || Array.isArray(raw.packages)) throw new Error('invalid-preferences')
  const packages = {}
  for (const [name, item] of Object.entries(raw.packages)) {
    if (!Object.hasOwn(PACKAGES, name) || !item || typeof item.checkEnabled !== 'boolean' || typeof item.autoInstall !== 'boolean' || !Number.isSafeInteger(item.deferredUntil) || item.deferredUntil < 0 || item.ignoredVersion !== null && !semver.valid(item.ignoredVersion)) throw new Error('invalid-preferences')
    packages[name] = { checkEnabled: item.checkEnabled, autoInstall: item.checkEnabled && item.autoInstall, deferredUntil: item.deferredUntil, ignoredVersion: item.ignoredVersion }
  }
  return { schema: 1, revision: raw.revision, packages }
}
export const packagePreferences = (value, name) => value.packages[name] ?? DEFAULT_PACKAGE_PREFERENCES

export function installationKind(bundle) {
  const source = bundle.source
  if (!bundle.installed || bundle.availability !== 'profile' || !Object.hasOwn(PACKAGES, bundle.name)) return 'unmanaged'
  if (typeof source !== 'string') return 'unknown'
  if (/^(?:file:|link:|workspace:)|^(?:[A-Za-z]:[\\/]|\/|\.\.?[\\/])/.test(source)) return 'local'
  if (/^(?:git|github:|https?:|ssh:)/.test(source)) return 'external'
  if (source !== bundle.name && !source.startsWith(bundle.name + '@')) return 'alias'
  const selector = source === bundle.name ? 'latest' : source.slice(bundle.name.length + 1)
  if (selector.includes(':') || selector.includes('/') || selector.includes('\\') || selector.includes(' ') || !selector) return 'external'
  return semver.valid(bundle.version) ? 'registry' : 'unknown'
}

export function targets(bundles) {
  const suite = bundles.find(bundle => bundle.name === SUITE && bundle.installed && bundle.enabled && bundle.availability === 'profile')
  return bundles.filter(bundle => Object.hasOwn(PACKAGES, bundle.name) && bundle.installed && bundle.availability === 'profile').map(bundle => ({
    name: bundle.name, version: bundle.version, enabled: bundle.enabled, sourceKind: installationKind(bundle), loadError: !!bundle.error,
    bundledBy: suite && SUITE_COMPONENTS.has(bundle.name) ? SUITE : null,
    label: PACKAGES[bundle.name][0], labelEn: PACKAGES[bundle.name][1],
  }))
}

export function releaseOf(name, packument, runtimeVersion, nodeVersion = process.versions.node) {
  const version = packument?.['dist-tags']?.latest
  const item = packument?.versions?.[version]
  if (!semver.valid(version) || semver.prerelease(version) || !item || item.name !== name || item.version !== version) throw new Error('invalid-release')
  if (!/^sha512-[A-Za-z0-9+/]{86}==$/.test(item.dist?.integrity ?? '')) throw new Error('invalid-integrity')
  if (item.deprecated) return { version, compatible: false, reason: 'deprecated' }
  if (!item.dsh?.bundle || typeof item.dsh.bundle !== 'object') return { version, compatible: false, reason: 'not-bundle' }
  const checks = [[item.engines?.node, nodeVersion, 'node-version'], [item.engines?.dsh, runtimeVersion, 'dsh-version']]
  for (const [peer, range] of Object.entries(item.peerDependencies ?? {})) if (peer === '@deepseek-ai/dsh' || peer.startsWith('@deepseek-ai/dsh-')) checks.push([range, runtimeVersion, 'dsh-version'])
  for (const [range, actual, reason] of checks) {
    if (range === undefined) continue
    if (typeof range !== 'string' || !semver.validRange(range) || !semver.valid(actual) || !semver.satisfies(actual, range, { includePrerelease: true })) return { version, compatible: false, reason }
  }
  return { version, compatible: true, integrity: item.dist.integrity, publishedAt: typeof packument.time?.[version] === 'string' ? packument.time[version] : null }
}

export function eligibleAuto(row, prefs, now, activity, clients, pendingRestart) {
  if (!prefs.checkEnabled || !prefs.autoInstall || prefs.deferredUntil > now || pendingRestart) return false
  if (!row.enabled || row.loadError || row.sourceKind !== 'registry' || row.bundledBy || !row.release?.compatible || !semver.valid(row.release.version) || !semver.valid(row.version)) return false
  if (prefs.ignoredVersion === row.release.version || !semver.gt(row.release.version, row.version)) return false
  if (semver.prerelease(row.version) || semver.diff(row.version, row.release.version) !== 'patch') return false
  if (!activity.known || activity.busy) return false
  if (!clients.length || clients.some(client => !client.fresh || client.dirty || client.busy || now - client.lastInteraction < AUTO_QUIET_MS)) return false
  return true
}
