import { parse } from 'acorn'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PACKAGES, SUITE_COMPONENTS } from './policy.js'

const directory = dirname(fileURLToPath(import.meta.url))
const START = '/* STARDUSTLC_UPDATE_CLIENT_BODY_START */', END = '/* STARDUSTLC_UPDATE_CLIENT_BODY_END */'
function find(ast, predicate) {
  if (!ast || typeof ast !== 'object') return undefined
  if (predicate(ast)) return ast
  for (const value of Object.values(ast)) {
    if (Array.isArray(value)) { for (const item of value) { const result = find(item, predicate); if (result) return result } }
    else if (value && typeof value === 'object') { const result = find(value, predicate); if (result) return result }
  }
}
function syntax(source) { return parse(source, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true }) }
function collect(ast, predicate, out = []) {
  if (!ast || typeof ast !== 'object') return out
  if (predicate(ast)) out.push(ast)
  for (const value of Object.values(ast)) if (Array.isArray(value)) { for (const item of value) collect(item, predicate, out) }
  else if (value && typeof value === 'object') collect(value, predicate, out)
  return out
}
function replacements(source, changes) { for (const item of changes.sort((a, b) => b.start - a.start)) source = source.slice(0, item.start) + item.text + source.slice(item.end); return source }
export function unwrapClient(source) {
  if (!source.includes(START)) return source
  const start = source.indexOf(START) + START.length, end = source.lastIndexOf(END)
  if (end <= start) throw new Error('Invalid existing update-client wrapper')
  let body = source.slice(start, end).replace(/^\n/, '').replace(/\n$/, '')
  const call = find(syntax(body), node => node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === '__stardustUpdatesWrap')
  if (!call || call.arguments.length !== 2) throw new Error('Wrapped module definition not found')
  body = body.slice(0, call.start) + body.slice(call.arguments[0].start, call.arguments[0].end) + body.slice(call.end)
  return replacements(body, collect(syntax(body), node => node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === '__stardustUpdatesPage').map(node => ({ start: node.start, end: node.end, text: body.slice(node.arguments[1].start, node.arguments[1].end) })))
}
export function wrapClient(source, name, packageVersion = null) {
  if (!Object.hasOwn(PACKAGES, name)) throw new Error('Unknown participant package')
  source = unwrapClient(source).replace(/\r\n/g, '\n')
  const pages = collect(syntax(source), node => node.type === 'CallExpression' && node.arguments[0]?.type === 'MemberExpression' && node.arguments[0].object.name === 'W' && node.arguments[0].property.name === 'Page' && node.arguments[1]?.type === 'ObjectExpression')
  source = replacements(source, pages.map(node => ({ start: node.arguments[1].start, end: node.arguments[1].end, text: '__stardustUpdatesPage(React,' + source.slice(node.arguments[1].start, node.arguments[1].end) + ',' + JSON.stringify(name) + ')' })))
  const ast = syntax(source)
  const call = find(ast, node => node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.property.name === 'load' && node.callee.object.type === 'MemberExpression' && node.callee.object.property.name === '__ModuleLoader__')
  if (!call || call.arguments.length !== 1 || call.arguments[0].type !== 'ObjectExpression') throw new Error('Expected one DSH client module definition')
  const arg = call.arguments[0]
  const body = source.slice(0, arg.start) + '__stardustUpdatesWrap(' + source.slice(arg.start, arg.end) + ',' + JSON.stringify({ name, version: '0.1.0', hasWorkbench: pages.length > 0, packageVersion, label: PACKAGES[name][0], labelEn: PACKAGES[name][1], suiteComponent: SUITE_COMPONENTS.has(name) }) + ')' + source.slice(arg.end)
  const kit = readFileSync(join(directory, 'ui-kit.js'), 'utf8').replace(/\r\n/g, '\n'), client = readFileSync(join(directory, 'ui-client.js'), 'utf8').replace(/\r\n/g, '\n')
  return '// Generated: shared optional update controls; edit the original client templates.\n(function(){\n' + kit + '\n' + client + '\n' + START + '\n' + body + '\n' + END + '\n})();\n'
}
export function buildClient(root, existingClient) {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const source = existingClient ? readFileSync(join(root, existingClient), 'utf8') : 'window.__ModuleLoader__.load({id:' + JSON.stringify(pkg.name) + ',factory:require=>({apply(){}})});\n'
  const destination = join(root, existingClient || 'lib/update-client.js')
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, wrapClient(source, pkg.name, pkg.version))
}
