import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { load as yamlLoad } from 'js-yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('cordis.patch.yml 是合法 YAML 且为含 insert 的数组', () => {
  const doc = yamlLoad(readFileSync(join(root, 'cordis.patch.yml'), 'utf8'))
  assert.ok(Array.isArray(doc))
  assert.equal(doc.length, 1)
  assert.ok(Array.isArray(doc[0].insert))
})

test('组合补丁恰好包含 18 个组件且 id 唯一', () => {
  const doc = yamlLoad(readFileSync(join(root, 'cordis.patch.yml'), 'utf8'))
  const entries = doc[0].insert
  assert.equal(entries.length, 18)
  const ids = entries.map((e) => e.id)
  assert.equal(new Set(ids).size, 18, 'id 有重复')
  for (const entry of entries) {
    assert.ok(typeof entry.name === 'string' && entry.name !== '', '每个条目必须有 name')
  }
})

test('组合补丁的 name 与 18 个组件包名一一对应', () => {
  const doc = yamlLoad(readFileSync(join(root, 'cordis.patch.yml'), 'utf8'))
  const known = [
    'dsh-calendar', 'dsh-cite', 'dsh-code-security', 'dsh-codex-port', 'dsh-dingtalk',
    '@stardustlc/dsh-docker', '@stardustlc/dsh-dream', 'dsh-email', 'dsh-ffmpeg', 'dsh-flakefinder',
    'dsh-hyperframes', 'dsh-minimal-ptc', 'dsh-ppt', 'dsh-remotion', 'dsh-rss',
    'dsh-slack', 'dsh-sql', 'dsh-voice',
  ]
  const patchNames = doc[0].insert.map((e) => e.name)
  assert.deepEqual([...patchNames].sort(), [...known].sort())
})

test('package.json 元数据：许可证/关键词/入口', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.name, '@stardustlc/dsh-suite')
  assert.equal(pkg.license, 'MIT')
  assert.ok(pkg.keywords.includes('dsh-plugin'))
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
})

test('README 双语文档齐备', () => {
  assert.ok(existsSync(join(root, 'README.md')))
  assert.ok(existsSync(join(root, 'README.en.md')))
})

test('组合补丁条目字段受约束（防注释/字段混入）', () => {
  const doc = yamlLoad(readFileSync(join(root, 'cordis.patch.yml'), 'utf8'))
  const allowed = new Set(['id', 'name', 'config', 'disabled'])
  for (const entry of doc[0].insert) {
    for (const key of Object.keys(entry)) {
      assert.ok(allowed.has(key), `补丁条目出现未知字段：${key}`)
    }
    if (entry.config !== undefined) {
      assert.ok(typeof entry.config === 'object' && !Array.isArray(entry.config) && entry.config !== null, `${entry.id} 的 config 必须是对象`)
    }
  }
})

test('套件声明全部 18 个 npm 组件依赖，避免用户重复启用组件层', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const entries = yamlLoad(readFileSync(join(root, 'cordis.patch.yml'), 'utf8'))[0].insert
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), entries.map(entry => entry.name).sort())
  for (const version of Object.values(pkg.dependencies)) assert.match(version, /^\d+\.\d+\.\d+$/, '组件应锁定已验证的 npm 版本')
})

test('双语安装命令只启用套件，避免 duplicate loader entry id', () => {
  for (const file of ['README.md', 'README.en.md']) {
    const readme = readFileSync(join(root, file), 'utf8')
    const commands = [...readme.matchAll(/^dsh plugin --profile web add ([^\n]+)/gm)].map(match => match[1].trim())
    assert.deepEqual(commands, ['@stardustlc/dsh-suite', 'github:STARDUSTLC666/dsh-suite'])
  }
})
