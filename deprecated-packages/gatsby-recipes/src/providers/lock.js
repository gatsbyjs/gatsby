import { Lock as lockInner } from "lock"
const lockInstance = lockInner()

export default function lock(resources) {
  return new Promise(resolve =>
    lockInstance(resources, release => {
      const releaseLock = release(() => {})
      resolve(releaseLock)
    })
  )
}
