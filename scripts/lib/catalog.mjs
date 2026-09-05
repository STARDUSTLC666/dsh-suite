import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { load } from 'js-yaml'

export function readCatalog(suiteRoot, workspaceRoot) {
  const patch = load(readFileSync(join(suiteRoot, 'cordis.patch.yml'), 'utf8'))
  const entries = patch.flatMap((operation) => operation.insert ?? [])
  assert.equal(new Set(entries.map((entry) => entry.name)).size, entries.length, 'Duplicate suite package')
  assert.ok(entries.length > 0, 'The suite is empty')
  return entries.map((entry) => {
    const directory = join(workspaceRoot, entry.name.split('/').at(-1))
    const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))
    assert.equal(manifest.name, entry.name, `Package name mismatch: ${directory}`)
    return { name: entry.name, directory, version: manifest.version, config: entry.config ?? {}, manifest }
  })
}

/** The same top-level test surface as the component npm scripts; live tests are opt-in. */
export function testFiles(directory) {
  const testRoot = join(directory, 'test')
  if (!existsSync(testRoot)) return { included: [], excluded: [] }
  const names = readdirSync(testRoot).filter((name) => name.endsWith('.test.mjs') || name === 'smoke.mjs')
  return {
    included: names.filter((name) => !/integration|live|e2e/i.test(name)).sort().map((name) => join(testRoot, name)),
    excluded: names.filter((name) => /integration|live|e2e/i.test(name)).sort(),
  }
}
