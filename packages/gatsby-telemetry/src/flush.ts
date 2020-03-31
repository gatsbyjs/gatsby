import { join } from "path"
import { fork } from "child_process"

export const makeFlush = (isTrackingEnabled: boolean) => async (): Promise<
  void
> => {
  if (!isTrackingEnabled) {
    return
  }

  // Submit events on background w/o blocking the main process
  // nor relying on it's lifecycle
  const forked = fork(join(__dirname, `send.js`), /* args= */ undefined, {
    detached: true,
    stdio: `ignore`,
    execArgv: [],
  })
  forked.unref()
}
