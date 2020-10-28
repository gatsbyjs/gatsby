import { execSync } from "child_process"
import execa from "execa"
import fs from "fs-extra"
import path from "path"
import { updateSiteMetadata } from "gatsby-core-utils"
import { reporter } from "./reporter"
import { getConfigStore } from "gatsby-core-utils"

type PackageManager = "yarn" | "npm"

const packageMangerConfigKey = `cli.packageManager`

export const getPackageManager = (): PackageManager =>
  getConfigStore().get(packageMangerConfigKey)

export const setPackageManager = (packageManager: PackageManager): void => {
  getConfigStore().set(packageMangerConfigKey, packageManager)
}

const spawnWithArgs = (
  file: string,
  args: Array<string>,
  options?: execa.Options
): execa.ExecaChildProcess =>
  execa(file, args, { stdio: `inherit`, preferLocal: false, ...options })

const spawn = (
  cmd: string,
  options?: execa.Options
): execa.ExecaChildProcess => {
  const [file, ...args] = cmd.split(/\s+/)
  return spawnWithArgs(file, args, options)
}
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

const isAlreadyGitRepository = async (): Promise<boolean> => {
  try {
    return await spawn(`git rev-parse --is-inside-work-tree`, {
      stdio: `pipe`,
    }).then(output => output.stdout === `true`)
  } catch (err) {
    return false
  }
}

// Initialize newly cloned directory as a git repo
const gitInit = async (
  rootPath: string
): Promise<execa.ExecaReturnBase<string>> => {
  reporter.info(`Initialising git in ${rootPath}`)

  return await spawn(`git init`, { cwd: rootPath })
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

  await spawn(`git add -A`, { cwd: rootPath })
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
const install = async (rootPath: string): Promise<void> => {
  const prevDir = process.cwd()

  reporter.info(`Installing packages...`)
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
    if (getPackageManager() === `yarn` && checkForYarn()) {
      if (await fs.pathExists(`package-lock.json`)) {
        if (!(await fs.pathExists(`yarn.lock`))) {
          await spawn(`yarnpkg import`)
        }
        await fs.remove(`package-lock.json`)
      }
      await spawn(`yarnpkg --silent`)
    } else {
      await fs.remove(`yarn.lock`)
      await spawn(`npm install --silent`)
    }
  } catch (e) {
    reporter.error(e)
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

  reporter.info(`Creating new site from git: ${url}`)

  const args = [
    `clone`,
    ...branchProps,
    url,
    rootPath,
    `--recursive`,
    `--depth=1`,
  ].filter(arg => Boolean(arg))

  await spawnWithArgs(`git`, args)

  reporter.success(`Created starter directory layout`)

  await fs.remove(path.join(rootPath, `.git`))

  await install(rootPath)
  const isGit = await isAlreadyGitRepository()
  if (!isGit) {
    await gitInit(rootPath)
  }
  await maybeCreateGitIgnore(rootPath)
  if (!isGit) {
    await createInitialGitCommit(rootPath)
  }
}

interface IGetPaths {
  starterPath: string
  rootPath: string
  selectedOtherStarter: boolean
}

const successMessage = (): void => {
  reporter.info(`
Your new Gatsby site has been successfully bootstrapped. Start developing it by running:
  gatsby develop
`)
}

export async function installPlugins(
  plugins: Array<string>,
  rootPath: string
): Promise<void> {
  const command = require.resolve(`gatsby-cli/lib/create-cli`, {
    paths: [rootPath],
  })

  if (!command) {
    reporter.error(`Did not install Gatsby`)
    return void 0
  }
  const { createCli } = require(command)
  return createCli([process.argv[0], command, `plugin`, `add`, ...plugins])
}

/**
 * Main function that clones or copies the starter.
 */
export async function initStarter(
  starter: string,
  rootPath: string
): Promise<void> {
  const sitePath = path.resolve(rootPath)

  await clone(starter, sitePath)

  //   await installPlugins(
  //     [`gatsby-plugin-image`, `gatsby-transformer-sharp`],
  //     sitePath
  //   )

  const sitePackageJson = await fs
    .readJSON(path.join(sitePath, `package.json`))
    .catch(() => {
      reporter.verbose(
        `Could not read "${path.join(sitePath, `package.json`)}"`
      )
    })

  await updateSiteMetadata(
    {
      name: sitePackageJson?.name || rootPath,
      sitePath,
      lastRun: Date.now(),
    },
    false
  )

  successMessage()
  // trackCli(`NEW_PROJECT_END`);
}
