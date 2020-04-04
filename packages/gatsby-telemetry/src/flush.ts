import { join } from 'path'
import { fork } from 'child_process'

export function flush (isTrackingEnabled: boolean): () => Promise<void> {
  return async function (): Promise<void> {
    if (!isTrackingEnabled) {
      return
    }

    // Submit events on background w/o blocking the main process
    // nor relying on it's lifecycle
    const forked = fork(join(__dirname, `send.js`), void 0 ,{
      detached: true,
      stdio: `ignore`,
      execArgv: [],
    })

    forked.unref()
  }
}
