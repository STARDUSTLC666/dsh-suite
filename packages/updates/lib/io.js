export function abortable(promise, signal) {
  if (!signal) return promise
  return new Promise((resolve, reject) => {
    const cancel = () => { signal.removeEventListener('abort', cancel); reject(signal.reason ?? new Error('cancelled')) }
    // Observe work that has already started even when cancellation predates us.
    Promise.resolve(promise).then(
      value => { signal.removeEventListener('abort', cancel); resolve(value) },
      error => { signal.removeEventListener('abort', cancel); reject(error) },
    )
    if (signal.aborted) cancel()
    else signal.addEventListener('abort', cancel, { once: true })
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
