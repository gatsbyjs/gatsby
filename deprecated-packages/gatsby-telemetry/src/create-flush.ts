/* eslint-disable @typescript-eslint/no-unused-vars */
export function createFlush(_isTrackingEnabled: boolean): () => Promise<void> {
  return async function flush(): Promise<void> {}
}
