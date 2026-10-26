export function abortable(promise, signal) {
  if (!signal) return promise
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    const cancel = () => { signal.removeEventListener('abort', cancel); reject(signal.reason ?? new Error('cancelled')) }
    signal.addEventListener('abort', cancel, { once: true })
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener('abort', cancel))
  })
}
export async function boundedBody(body, maxBytes, signal) {
  const reader = body.getReader(), chunks = []; let size = 0
  try {
    for (;;) {
      const item = await abortable(reader.read(), signal)
      if (item.done) break
      size += item.value.length
      if (size > maxBytes) throw new Error('request-too-large')
      chunks.push(item.value)
    }
    return Buffer.concat(chunks).toString('utf8')
  } finally { void reader.cancel().catch(() => {}) }
}
