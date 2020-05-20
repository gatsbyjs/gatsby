/*
 * Service lock: handles service discovery for Gatsby develop processes
 * The problem:  the develop process starts a proxy server, the actual develop process and a websocket server for communication. The two latter ones have random ports that need to be discovered. We also cannot run multiple of the same site at the same time.
 * The solution: lockfiles! We create a folder in `.config/gatsby/sites/${sitePathHash}, lock it with a site.lock lockfile and then for each service (e.g. developstatusserver) write a file with its data.
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

const LOCKFILE_NAME = `site.lock`

const getSiteDir = (programPath: string): string => {
  const hash = createContentDigest(programPath)

  return path.join(globalConfigPath, `gatsby`, `sites`, hash)
}

const getDataFilePath = (siteDir: string, serviceName: string): string =>
  path.join(siteDir, `${serviceName}.json`)

type UnlockFn = () => Promise<void>

const memoryServices = {}
export const createServiceLock = async (
  programPath: string,
  name: string,
  content: Record<string, any>
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

  const siteDir = getSiteDir(programPath)

  await fs.ensureDir(siteDir)

  try {
    const unlock = await lockfile.lock(siteDir, {
      // Use the minimum stale duration
      stale: 5000,
      lockfilePath: path.join(siteDir, LOCKFILE_NAME),
    })

    // Once the directory for this site is locked, we write a file to the dir with the service metadata
    await fs.writeFile(getDataFilePath(siteDir, name), JSON.stringify(content))

    return unlock
  } catch (err) {
    return null
  }
}

export const getService = async (
  programPath: string,
  name: string
): Promise<string | null> => {
  if (isCI()) return memoryServices[name] || null

  const siteDir = getSiteDir(programPath)

  try {
    return JSON.parse(await fs.readFile(getDataFilePath(siteDir, name), `utf8`))
  } catch (err) {
    return null
  }
}

export const getServices = async (programPath: string): Promise<any> => {
  if (isCI()) return memoryServices
  const siteDir = getSiteDir(programPath)

  const serviceNames = (await fs.readdir(siteDir))
    .filter(file => file.endsWith(`.json`))
    .map(file => file.replace(`.json`, ``))

  const services = {}
  await Promise.all(
    serviceNames.map(async service => {
      services[service] = await getService(programPath, service)
    })
  )

  return services
}
