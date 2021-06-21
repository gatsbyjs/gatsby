import { performance } from "perf_hooks"

const fnStats = new Map<
  string,
  { calls: number; time: number; asyncTime: number; created: number }
>()

const timeouts = new Map<string, NodeJS.Timeout>()

export function startOutput(name: string, interval: number = 20000): void {
  if (timeouts.has(name)) {
    return
  }
  const timeout = setInterval(() => {
    const value = fnStats.get(name)!
    console.log(
      `${name} (${value.created}):\n` +
        `  calls: ${value.calls}` +
        `  time: ${(value.time / 1000).toFixed(2)}s;` +
        `  await: ${(value.asyncTime / 1000).toFixed(2)}s;` +
        `  await/call: ${(value.asyncTime / value.calls / 1000).toFixed(2)}s;`
    )
  }, interval)
  timeouts.set(name, timeout)
}

export function stopOutput(name: string): void {
  clearInterval(timeouts.get(name)!)
}

type WrappedFn<T, U> = (...args: Array<T>) => U

export function profileFn<T, U>(
  name: string,
  outputInterval: number,
  fn: WrappedFn<T, U>
): WrappedFn<T, U> {
  if (outputInterval) {
    startOutput(name, outputInterval)
  }
  if (fnStats.has(name)) {
    fnStats.get(name)!.created++
  } else {
    fnStats.set(name, { calls: 0, time: 0, asyncTime: 0, created: 0 })
  }
  return function (...args: Array<T>): U {
    const stats = fnStats.get(name)!
    const start = performance.now()
    const result: any = fn(...args)
    const syncEnd = performance.now()
    stats.calls += 1
    stats.time += syncEnd - start
    if (typeof result?.then === `function`) {
      result.then(() => {
        stats.asyncTime += performance.now() - syncEnd
      })
    }
    return result
  }
}
