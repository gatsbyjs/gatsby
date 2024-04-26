import { AsyncLocalStorage } from "async_hooks";

export type IEngineContext = {
  requestId: string;
};

let asyncLocalStorage;
function getAsyncLocalStorage(): AsyncLocalStorage<IEngineContext> {
  return asyncLocalStorage ?? (asyncLocalStorage = new AsyncLocalStorage());
}

export function getEngineContext(): IEngineContext | undefined {
  return getAsyncLocalStorage().getStore();
}

export function runWithEngineContext<T>(
  context: IEngineContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: Array<any>) => T,
): T {
  return getAsyncLocalStorage().run(context, fn);
}
