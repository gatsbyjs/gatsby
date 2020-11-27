import { execSync } from "child_process"
import execa, { Options } from "execa"
import fs from "fs-extra"
import path from "path"
import { reporter } from "./reporter"
import { spin } from "tiny-spin"
import { getConfigStore } from "./get-config-store"
type PackageManager = "yarn" | "npm"
import c from "ansi-colors"

const packageManagerConfigKey = `cli.packageManager`

const kebabify = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, `$1-$2`)
    .replace(/[^a-zA-Z]+/g, `-`)
    .toLowerCase()

export const getPackageManager = (): PackageManager =>
  getConfigStore().get(packageManagerConfigKey)

export const setPackageManager = (packageManager: PackageManager): void => {
  getConfigStore().set(packageManagerConfigKey, packageManager)
}

const ESC = `\u001b`

export const clearLine = (count = 1): Promise<boolean> =>
  new Promise(resolve => {
    // First move the cursor up one line...
    process.stderr.moveCursor(0, -count, () => {
      // ... then clear that line. This is the ANSI escape sequence for "clear whole line"
      // List of escape sequences: http://ascii-table.com/ansi-escape-sequences.php
      process.stderr.write(`${ESC}[2K`)
      resolve()
    })
  })
// Checks the existence of yarn package
// We use yarnpkg instead of yarn to avoid conflict with Hadoop yarn
// Refer to https://github.com/yarnpkg/yarn/issues/673
const checkForYarn = (): boolean => {
  try {
    execSync(`yarnpkg --version`, { stdio: `ignore` })
    return true
  } catch (e) {
    return false
  }
}

// Initialize newly cloned directory as a git repo
const gitInit = async (
  rootPath: string
): Promise<execa.ExecaReturnBase<string>> =>
  await execa(`git`, [`init`], { cwd: rootPath })

// Create a .gitignore file if it is missing in the new directory
const maybeCreateGitIgnore = async (rootPath: string): Promise<void> => {
  if (fs.existsSync(path.join(rootPath, `.gitignore`))) {
    return
  }

  await fs.writeFile(
    path.join(rootPath, `.gitignore`),
    `.cache\nnode_modules\npublic\n`
  )
}

// Create an initial git commit in the new directory
const createInitialGitCommit = async (rootPath: string): Promise<void> => {
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

const setNameInPackage = async (
  sitePath: string,
  name: string
): Promise<void> => {
  const packageJsonPath = path.join(sitePath, `package.json`)
  const packageJson = await fs.readJSON(packageJsonPath)
  packageJson.name = kebabify(name)
  packageJson.description = `My Gatsby site`
  try {
    const result = await execa(`git`, [`config`, `user.name`])
    if (result.failed) {
      delete packageJson.author
    } else {
      packageJson.author = result.stdout
    }
  } catch (e) {
    delete packageJson.author
  }

  await fs.writeJSON(packageJsonPath, packageJson)
}

// Executes `npm install` or `yarn install` in rootPath.
const install = async (
  rootPath: string,
  packages: Array<string>
): Promise<void> => {
  const prevDir = process.cwd()

  reporter.info(`${c.blueBright(c.symbols.pointer)} Installing Gatsby...`)

  process.chdir(rootPath)

  const npmConfigUserAgent = process.env.npm_config_user_agent

  try {
    if (!getPackageManager()) {
      if (npmConfigUserAgent?.includes(`yarn`)) {
        setPackageManager(`yarn`)
      } else {
        setPackageManager(`npm`)
      }
    }
    const options: Options = {
      stderr: `inherit`,
    }

    const config = [`--loglevel`, `error`, `--color`, `always`]

    if (getPackageManager() === `yarn` && checkForYarn()) {
      await fs.remove(`package-lock.json`)
      const args = packages.length
        ? [`add`, `--silent`, ...packages]
        : [`--silent`]
      await execa(`yarnpkg`, args, options)
    } else {
      await fs.remove(`yarn.lock`)

      await execa(`npm`, [`install`, ...config], options)
      await clearLine()
      reporter.success(`Installed Gatsby`)
      reporter.info(`${c.blueBright(c.symbols.pointer)} Installing plugins...`)
      await execa(`npm`, [`install`, ...config, ...packages], options)
      await clearLine()
      reporter.success(`Installed plugins`)
    }
  } catch (e) {
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
  ].filter(arg => Boolean(arg))

  try {
    await execa(`git`, args)
  } catch (err) {
    reporter.panic(err.message)
  }
  stop()
  reporter.success(`Created site from template`)
  await fs.remove(path.join(rootPath, `.git`))
}

export async function gitSetup(rootPath: string): Promise<void> {
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

  await setNameInPackage(sitePath, rootPath)

  await install(rootPath, packages)

  // trackCli(`NEW_PROJECT_END`);
}
