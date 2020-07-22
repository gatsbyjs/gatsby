import { isCI } from "gatsby-core-utils"
const { join } = require(`path`)
const { fork, spawnSync } = require(`child_process`)
import time, { TimeUnit } from "@turist/time"

export function createFlush(isTrackingEnabled: boolean): () => Promise<void> {
  return async function flush(): Promise<void> {
    if (!isTrackingEnabled) {
      return
    }

    if (isCI()) {
      spawnSync(process.execPath, [join(__dirname, `send.js`)], {
        execArgv: [],
        timeout: time(1, TimeUnit.Minute),
      })
      return
    }
    // Submit events on background with out blocking the main process
    // nor relying on it's life cycle
    const forked = fork(join(__dirname, `send.js`), {
      detached: false,
      stdio: `ignore`,
      execArgv: [],
    })
    forked.on(`exit`, code => {
      console.log(`child process exited with code ${code}`)
    })
    //forked.unref()
  }
}
