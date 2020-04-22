import util from "util"
import path from "path"
import os from "os"
import crypto from "crypto"
import lockFile from "lockfile"
import fse from "fs-extra"

const globalConfigPath =
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), `.config`)
const lock = util.promisify(lockFile.lock)

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

  const lockfileDir = path.join(globalConfigPath, `gatsby`, `sites`, hash)

  await fse.ensureDir(lockfileDir)
  const lockfilePath = path.join(lockfileDir, `${name}.lock`)

  try {
    await lock(lockfilePath, {})
  } catch (err) {
    console.log(err)
    // TODO: Nice helpful error message
    throw new Error(`Another process probably already running.`)
  }

  await fse.writeFile(lockfilePath, content)
}

export const getService = (
  programPath: string,
  name: string
): Promise<string | null> => {
  const hash = hashString(programPath)

  try {
    const lockfileDir = path.join(globalConfigPath, `gatsby`, `sites`, hash)
    const lockfilePath = path.join(lockfileDir, `${name}.lock`)

    return fse.readFile(lockfilePath, "utf8")
  } catch (err) {
    return Promise.resolve(null)
  }
}

export const getServices = async (programPath: string): Promise<any> => {
  const hash = hashString(programPath)
  const lockfileDir = path.join(globalConfigPath, `gatsby`, `sites`, hash)

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
