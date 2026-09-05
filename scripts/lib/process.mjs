import { execFile } from 'node:child_process'

export function runNode(args, options) {
  const start = Date.now()
  return new Promise((resolve) => {
    execFile(process.execPath, args, { ...options, windowsHide: true, timeout: 120000, maxBuffer: 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      const totals = {}
      for (const match of stdout.matchAll(/^# (tests|pass|fail|skipped|cancelled) (\d+)$/gm)) totals[match[1]] = Number(match[2])
      resolve({ ok: error === null, durationMs: Date.now() - start, ...totals,
        ...(error === null ? {} : { error: error.message, output: (stdout + stderr).slice(-16000) }),
      })
    })
  })
}
