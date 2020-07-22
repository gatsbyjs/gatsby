const { join } = require(`path`)
const { fork } = require(`child_process`)

export function createFlush(isTrackingEnabled: boolean): () => Promise<void> {
  return async function flush(): Promise<void> {
    if (!isTrackingEnabled) {
      return
    }

    // Submit events on background w/o blocking the main process
    // nor relying on it's lifecycle
    const forked = fork(join(__dirname, `send.js`), {
      detached: true,
      stdio: `ignore`,
      execArgv: [],
    })
    forked.unref()
  }
}
