import { AsyncLocalStorage } from "async_hooks"

export interface IEngineContext {
  requestId: string
}

let asyncLocalStorage
function getAsyncLocalStorage(): AsyncLocalStorage<IEngineContext> {
  return asyncLocalStorage ?? (asyncLocalStorage = new AsyncLocalStorage())
}

export function getEngineContext(): IEngineContext | undefined {
  return getAsyncLocalStorage().getStore()
}

export function runWithEngineContext<T>(
  context: IEngineContext,
  fn: (...args: Array<any>) => T
): T {
  // @ts-ignore typings are incorrect, run() returns the result of fn()
  return getAsyncLocalStorage().run(context, fn)
}
