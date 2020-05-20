/*
 * Service lock: handles service discovery for Gatsby develop processes
 * The problem:  the develop process starts a proxy server, the actual develop process and a websocket server for communication. The two latter ones have random ports that need to be discovered. We also cannot run multiple of the same site at the same time.
 * The solution: lockfiles! We create a lockfolder in `.config/gatsby/sites/${sitePathHash} and then write a file to that lockfolder for every service with its port.
 *
 * NOTE(@mxstbr): This is NOT EXPORTED from the main index.ts due to this relying on Node.js-specific APIs but core-utils also being used in browser environments. See https://github.com/jprichardson/node-fs-extra/issues/743
 */
import path from "path"
import tmp from "tmp"
import lockfile from "proper-lockfile"
import fs from "fs-extra"
import xdgBasedir from "xdg-basedir"
import { createContentDigest } from "./create-content-digest"
import { isCI } from "./ci"

const globalConfigPath = xdgBasedir.config || tmp.fileSync().name

const getLockfileDir = (programPath: string): string => {
  const hash = createContentDigest(programPath)

  return path.join(globalConfigPath, `gatsby`, `sites`, `${hash}.lock`)
}

const getDataFilePath = (lockfileDir: string, serviceName: string): string =>
  path.join(lockfileDir, `${serviceName}.lock`)

type UnlockFn = () => Promise<void>

const memoryServices = {}
export const createServiceLock = async (
  programPath: string,
  name: string,
  content: string
): Promise<UnlockFn | null> => {
  // NOTE(@mxstbr): In CI, we cannot reliably access the global config dir and do not need cross-process coordination anyway
  // so we fall back to storing the services in memory instead!
  if (isCI()) {
    if (memoryServices[name]) return null

    memoryServices[name] = content
    return async (): Promise<void> => {
      delete memoryServices[name]
    }
  }

  const lockfileDir = getLockfileDir(programPath)

  await fs.ensureDir(lockfileDir)

  try {
    const unlock = await lockfile.lock(lockfileDir, {
      // Use the minimum stale duration
      stale: 5000,
    })

    // Once the directory for this site is locked, we write a file to the dir with the service metadata
    await fs.writeFile(getDataFilePath(lockfileDir, name), content)

    return unlock
  } catch (err) {
    return null
  }
}

export const getService = (
  programPath: string,
  name: string
): Promise<string | null> => {
  if (isCI()) return Promise.resolve(memoryServices[name] || null)

  const lockfileDir = getLockfileDir(programPath)

  try {
    return fs.readFile(getDataFilePath(lockfileDir, name), `utf8`)
  } catch (err) {
    return Promise.resolve(null)
  }
}

export const getServices = async (programPath: string): Promise<any> => {
  if (isCI()) return memoryServices
  const lockfileDir = getLockfileDir(programPath)

  const files = await fs.readdir(lockfileDir)
  const services = {}

  await Promise.all(
    files
      .filter(file => file.endsWith(`.lock`))
      .map(async file => {
        const service = file.replace(`.lock`, ``)
        services[service] = await getService(programPath, service)
      })
  )

  return services
}
