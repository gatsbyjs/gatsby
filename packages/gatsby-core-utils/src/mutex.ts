import { getStorage, LockStatus, getDatabaseDir } from "./utils/get-storage"

interface IMutex {
  acquire(): Promise<void>
  release(): Promise<void>
}

// Random number to re-check if mutex got released
const MUTEX_INTERVAL = 3000

async function waitUntilUnlocked(
  storage: ReturnType<typeof getStorage>,
  key: string
): Promise<void> {
  const isUnlocked = await storage.mutex.ifNoExists(key, () => {
    storage.mutex.put(key, LockStatus.Locked)
  })

  if (isUnlocked) {
    return
  }

  await new Promise<void>(resolve => {
    setTimeout(() => {
      resolve(waitUntilUnlocked(storage, key))
    }, MUTEX_INTERVAL)
  })
}

/**
 * Creates a mutex, make sure to call `release` when you're done with it.
 *
 * @param {string} key A unique key
 */
export function createMutex(key: string): IMutex {
  const storage = getStorage(getDatabaseDir())
  const BUILD_ID = global.__GATSBY?.buildId ?? ``
  const prefixedKey = `${BUILD_ID}-${key}`

  return {
    acquire: (): Promise<void> => waitUntilUnlocked(storage, prefixedKey),
    release: async (): Promise<void> => {
      // console.log({ unlock: prefixedKey })
      await storage.mutex.remove(prefixedKey)
    },
  }
}

export async function releaseAllMutexes(): Promise<void> {
  const storage = getStorage(getDatabaseDir())

  await storage.mutex.clearAsync()
}
