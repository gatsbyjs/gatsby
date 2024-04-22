// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPromise(obj: any): obj is PromiseLike<unknown> {
  return (
    !!obj &&
    (typeof obj === `object` || typeof obj === `function`) &&
    typeof obj.then === `function`
  )
}

export function isRunning(pid: number): boolean {
  try {
    // "As a special case, a signal of 0 can be used to test for the existence of a process."
    // See https://nodejs.org/api/process.html#process_process_kill_pid_signal
    process.kill(pid, 0)
    return true
  } catch (e) {
    return false
  }
}
