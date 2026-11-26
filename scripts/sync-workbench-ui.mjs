import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'ui/workbench-ui.js')
const updatesKitPath = join(root, 'packages/updates/lib/ui-kit.js')
const args = process.argv.slice(2)

const forbiddenFlags = new Set(['--plugins', '--workbenches', '--all', '--overwrite-workbenches'])
const allowedFlags = new Set(['--check', '--write', '--sync'])

for (const arg of args) {
  if (forbiddenFlags.has(arg)) {
    console.error(
      `Refusing ${arg}: the 10 native workbenches have migrated to bespoke v3/v4 UIs (_dsh-design-system) and must not be overwritten with v1 ui/workbench-ui.js. `
      + 'This script only checks or syncs packages/updates/lib/ui-kit.js (shared update footer).',
    )
    process.exit(1)
  }
  if (!allowedFlags.has(arg)) {
    console.error(`Unknown argument: ${arg}. Usage: node scripts/sync-workbench-ui.mjs [--check | --write]`)
    process.exit(1)
  }
}

const write = (args.includes('--write') || args.includes('--sync')) && !args.includes('--check')
const source = readFileSync(sourcePath, 'utf8')
const normalize = (text) => text.replace(/\r\n/g, '\n')

if (!write) {
  if (!existsSync(updatesKitPath) || normalize(readFileSync(updatesKitPath, 'utf8')) !== normalize(source)) {
    console.error('updates: packages/updates/lib/ui-kit.js differs from ui/workbench-ui.js; run node scripts/sync-workbench-ui.mjs --write')
    process.exitCode = 1
  } else {
    console.log('Verified update-footer UI kit (ui/workbench-ui.js === packages/updates/lib/ui-kit.js). Plugin v3/v4 workbenches are managed independently.')
  }
} else {
  mkdirSync(dirname(updatesKitPath), { recursive: true })
  writeFileSync(updatesKitPath, source)
  console.log('Synchronized update-footer UI kit to packages/updates/lib/ui-kit.js. Plugin v3/v4 workbenches were intentionally left untouched.')
}
