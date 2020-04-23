/*
 * Service lock: handles service discovery for Gatsby develop processes
 * The problem:  the develop process starts a proxy server, the actual develop process and a websocket server for communication. The two latter ones have random ports that need to be discovered. We also cannot run multiple of the same site at the same time.
 * The solution: lockfiles! We create a lockfolder in `.config/gatsby/sites/${sitePathHash} and then write a file to that lockfolder for every service with its port.
 */
import path from "path"
import os from "os"
import crypto from "crypto"
import lockfile from "proper-lockfile"
import fse from "fs-extra"

const globalConfigPath =
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), `.config`)

const hashString = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`)

export const createServiceLock = async (
  programPath: string,
  name: string,
  content: string
): Promise<void> => {
  const hash = hashString(programPath)

  const lockfileDir = path.join(
    globalConfigPath,
    `gatsby`,
    `sites`,
    `${hash}.lock`
  )

  await fse.ensureDir(lockfileDir)

  try {
    await lockfile.lock(lockfileDir)
  } catch (err) {
    // TODO: Nice helpful error message
    throw new Error(`The develop process is already running on another port.`)
  }

  // Once the directory for this site is locked, we write a file to the dir with the service metadata
  await fse.writeFile(path.join(lockfileDir, `${name}.lock`), content)
}

export const getService = (
  programPath: string,
  name: string
): Promise<string | null> => {
  const hash = hashString(programPath)

  try {
    const lockfileDir = path.join(
      globalConfigPath,
      `gatsby`,
      `sites`,
      `${hash}.lock`
    )
    const lockfilePath = path.join(lockfileDir, `${name}.lock`)

    return fse.readFile(lockfilePath, "utf8")
  } catch (err) {
    return Promise.resolve(null)
  }
}

export const getServices = async (programPath: string): Promise<any> => {
  const hash = hashString(programPath)
  const lockfileDir = path.join(
    globalConfigPath,
    `gatsby`,
    `sites`,
    `${hash}.lock`
  )

  const files = await fse.readdir(lockfileDir)
  let services = {}

  await Promise.all(
    files
      .filter(file => file.endsWith(".lock"))
      .map(async file => {
        const service = file.replace(`.lock`, "")
        services[service] = await getService(programPath, service)
      })
  )

  return services
}
