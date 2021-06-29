export function sync(a: string, opts?: { addWorkerId?: boolean }): string {
  return `foo ${a}${opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``}`
}

export async function async(a: string, opts?: { addWorkerId?: boolean }): Promise<string> {
  return `foo ${a}${opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``}`
}

export function neverEnding(): Promise<string> {
  return new Promise<string>(() => {})
}

export const notAFunction = `string`

export function syncThrow(a: string, opts?: { addWorkerId?: boolean, throwOnWorker?: number }): string {
  if (!opts?.throwOnWorker || opts?.throwOnWorker?.toString() === process.env.GATSBY_WORKER_ID) {
    throw new Error(`sync throw${opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``}`)
  }

  return `foo ${a}${opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``}`
}

export async function asyncThrow(a: string, opts?: { addWorkerId?: boolean, throwOnWorker?: number }): Promise<string> {
  if (!opts?.throwOnWorker || opts?.throwOnWorker?.toString() === process.env.GATSBY_WORKER_ID) {
    throw new Error(`async throw${opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``}`)
  }

  return `foo ${a}${opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``}`
}

// used in task queue as previous functions would be too often too fast
export async function async100ms(taskId: number, opts?: { addWorkerId?: boolean }): Promise<{taskId: number, workerId: string}> {
  return new Promise(resolve => setTimeout(resolve, 100, {taskId, workerId: opts?.addWorkerId ? process.env.GATSBY_WORKER_ID : undefined}))
}