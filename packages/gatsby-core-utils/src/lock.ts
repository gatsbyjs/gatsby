import { Lock as lockInner } from "lock"
const lockInstance = lockInner()

export function lock(resources: string): Promise<() => void> {
  return new Promise(resolve => {
    return lockInstance(resources, release => {
      const releaseLock = release(() => {})
      resolve(releaseLock)
    })
  })
}
