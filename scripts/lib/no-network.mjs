// Preload in Node test workers. Local mock HTTP servers remain available.
// This is an accidental-network guard for trusted tests, not an OS sandbox.
import net from 'node:net'
import tls from 'node:tls'
import dgram from 'node:dgram'
import { syncBuiltinESMExports } from 'node:module'
import { isLoopback } from './offline.mjs'

function checkConnection(args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0]
  const host = first !== null && typeof first === 'object'
    ? first.host ?? first.hostname
    : typeof args[1] === 'string' ? args[1] : undefined
  if (!isLoopback(host)) throw new Error('Offline verification blocked an external network connection')
}

const connect = net.Socket.prototype.connect
net.Socket.prototype.connect = function (...args) {
  checkConnection(args)
  return connect.apply(this, args)
}
const tlsConnect = tls.connect
tls.connect = function (...args) {
  checkConnection(args)
  return tlsConnect.apply(this, args)
}
dgram.Socket.prototype.send = function () {
  throw new Error('Offline verification blocked a UDP send')
}
const fetch = globalThis.fetch
globalThis.fetch = async function (input, options) {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
  if (!isLoopback(url.hostname)) throw new Error('Offline verification blocked an external fetch')
  return fetch(input, options)
}
syncBuiltinESMExports()
