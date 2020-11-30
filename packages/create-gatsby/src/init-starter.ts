import { execSync } from "child_process"
import execa from "execa"
import fs from "fs-extra"
import path from "path"
import { reporter } from "./reporter"
import { spin } from "tiny-spin"
import { getConfigStore } from "./get-config-store"
type PackageManager = "yarn" | "npm"

const packageMangerConfigKey = `cli.packageManager`

export const packageManager = (npmConfigUserAgent?: string): PackageManager => {
  const configStore = getConfigStore()
  const actualPackageManager = configStore.get(packageMangerConfigKey)

  if (actualPackageManager) return actualPackageManager

  if (npmConfigUserAgent?.includes(`yarn`)) {
    configStore.set(packageMangerConfigKey, `yarn`)
    return `yarn`
  }

  configStore.set(packageMangerConfigKey, `npm`)
  return `npm`
}

// Checks the existence of yarn package
// We use yarnpkg instead of yarn to avoid conflict with Hadoop yarn
// Refer to https://github.com/yarnpkg/yarn/issues/673
const checkForYarn = (): boolean => {
  try {
    execSync(`yarnpkg --version`, { stdio: `ignore` })
    return true
  } catch (e) {
    reporter.info(
      `Woops! Yarn doesn't seem be installed on your machine. You can install it on https://yarnpkg.com/getting-started/install. As a fallback, we will run the next steps with npm.`
    )
    return false
  }
}

// Initialize newly cloned directory as a git repo
const gitInit = async (
  rootPath: string
): Promise<execa.ExecaReturnBase<string>> => {
  reporter.info(`Initialising git in ${rootPath}`)

  return await execa(`git`, [`init`], { cwd: rootPath })
}

// Create a .gitignore file if it is missing in the new directory
const maybeCreateGitIgnore = async (rootPath: string): Promise<void> => {
  if (fs.existsSync(path.join(rootPath, `.gitignore`))) {
    return
  }

  reporter.info(`Creating minimal .gitignore in ${rootPath}`)
  await fs.writeFile(
    path.join(rootPath, `.gitignore`),
    `.cache\nnode_modules\npublic\n`
  )
}

// Create an initial git commit in the new directory
const createInitialGitCommit = async (rootPath: string): Promise<void> => {
  reporter.info(`Create initial git commit in ${rootPath}`)

  await execa(`git`, [`add`, `-A`], { cwd: rootPath })
  // use execSync instead of spawn to handle git clients using
  // pgp signatures (with password)
  try {
    execSync(`git commit -m "Initial commit from gatsby"`, {
      cwd: rootPath,
    })
  } catch {
    // Remove git support if initial commit fails
    reporter.info(`Initial git commit failed - removing git support\n`)
    fs.removeSync(path.join(rootPath, `.git`))
  }
}

// Executes `npm install` or `yarn install` in rootPath.
const install = async (
  rootPath: string,
  packages: Array<string>
): Promise<void> => {
  const prevDir = process.cwd()
  const npmConfigUserAgent = process.env.npm_config_user_agent
  const silent = `--silent`

  let stop = spin(`Installing packages...`)

  process.chdir(rootPath)

  try {
    const pm = packageManager(npmConfigUserAgent)

    if (pm === `yarn` && checkForYarn()) {
      await fs.remove(`package-lock.json`)

      const args = packages.length ? [`add`, silent, ...packages] : [silent]

      await execa(`yarnpkg`, args)
    } else {
      await fs.remove(`yarn.lock`)
      await execa(`npm`, [`install`, silent])

      stop()
      stop = spin(`Installing plugins...`)

      await execa(`npm`, [`install`, silent, ...packages])
    }

    stop()
    reporter.success(`Installed packages`)
  } catch (e) {
    stop()
    reporter.panic(e.message)
  } finally {
    process.chdir(prevDir)
  }
}

// Clones starter from URI.
const clone = async (
  url: string,
  rootPath: string,
  branch?: string
): Promise<void> => {
  const branchProps = branch ? [`-b`, branch] : []
  const stop = spin(`Cloning site template`)
  const args = [
    `clone`,
    ...branchProps,
    url,
    rootPath,
    `--recursive`,
    `--depth=1`,
    `--quiet`,
  ].filter(Boolean)

  try {
    await execa(`git`, args)

    reporter.success(`Created site from template`)
  } catch (err) {
    reporter.panic(err.message)
  }

  stop()
  await fs.remove(path.join(rootPath, `.git`))
}

async function gitSetup(rootPath: string): Promise<void> {
  await gitInit(rootPath)
  await maybeCreateGitIgnore(rootPath)
  await createInitialGitCommit(rootPath)
}

/**
 * Main function that clones or copies the starter.
 */
export async function initStarter(
  starter: string,
  rootPath: string,
  packages: Array<string>
): Promise<void> {
  const sitePath = path.resolve(rootPath)

  await clone(starter, sitePath)
  await install(rootPath, packages)
  await gitSetup(rootPath)
  // trackCli(`NEW_PROJECT_END`);
}
