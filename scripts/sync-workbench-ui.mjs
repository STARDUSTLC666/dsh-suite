import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'ui/workbench-ui.js'), 'utf8')
const check = process.argv.includes('--check')
const plugins = ['calendar', 'cite', 'code-security', 'dream', 'email', 'hyperframes', 'ppt', 'remotion', 'rss']
// The shared update footer renders these same components inside every plugin page, so it
// carries the tenth copy. It lives in this repository instead of a plugin directory.
const targets = [
  ...plugins.map(name => ({ label: name, destination: resolve(root, '..', 'dsh-' + name, 'templates/workbench-ui.js') })),
  { label: 'updates', destination: join(root, 'packages/updates/lib/ui-kit.js') },
]
let differences = 0
for (const { label: name, destination } of targets) {
  const directory = dirname(destination)
  if (check) {
    if (!existsSync(destination) || readFileSync(destination, 'utf8').replace(/\r\n/g, '\n') !== source.replace(/\r\n/g, '\n')) {
      console.error(name + ': workbench UI differs; run node scripts/sync-workbench-ui.mjs')
      differences++
    }
  } else {
    mkdirSync(directory, { recursive: true })
    writeFileSync(destination, source)
  }
}
if (differences) process.exitCode = 1
else console.log((check ? 'Verified' : 'Synchronized') + ' workbench UI in ' + plugins.length + ' plugins and the updates package.')
