/* @flow */
const { execSync } = require(`child_process`)
const execa = require(`execa`)
const hostedGitInfo = require(`hosted-git-info`)
const fs = require(`fs-extra`)
const sysPath = require(`path`)
const report = require(`./reporter`)
const url = require(`url`)
const existsSync = require(`fs-exists-cached`).sync

const spawn = (cmd: string, options: any) => {
  const [file, ...args] = cmd.split(/\s+/)
  return execa(file, args, { stdio: `inherit`, ...options })
}

// Checks the existence of yarn package
// We use yarnpkg instead of yarn to avoid conflict with Hadoop yarn
// Refer to https://github.com/yarnpkg/yarn/issues/673
//
// Returns true if yarn exists, false otherwise
const shouldUseYarn = () => {
  try {
    execSync(`yarnpkg --version`, { stdio: `ignore` })
    return true
  } catch (e) {
    return false
  }
}

// Initialize newly cloned directory as a git repo
const gitInit = async rootPath => {
  report.info(`Initialising git in ${rootPath}`)

  return await spawn(`git init`, { cwd: rootPath })
}

// Create a .gitignore file if it is missing in the new directory
const maybeCreateGitIgnore = async rootPath => {
  if (existsSync(sysPath.join(rootPath, `.gitignore`))) {
    return
  }

  report.info(`Creating minimal .gitignore in ${rootPath}`)
  await fs.writeFile(
    sysPath.join(rootPath, `.gitignore`),
    `.cache\nnode_modules\npublic\n`
  )
}

// Create an initial git commit in the new directory
const createInitialGitCommit = async (rootPath, starterUrl) => {
  report.info(`Create initial git commit in ${rootPath}`)

  await spawn(`git add -A`, { cwd: rootPath })
  // use execSync instead of spawn to handle git clients using
  // pgp signatures (with password)
  execSync(`git commit -m "Initial commit from gatsby: (${starterUrl})"`, {
    cwd: rootPath,
  })
}

// Executes `npm install` or `yarn install` in rootPath.
const install = async rootPath => {
  const prevDir = process.cwd()

  report.info(`Installing packages...`)
  process.chdir(rootPath)

  try {
    let cmd = shouldUseYarn() ? spawn(`yarnpkg`) : spawn(`npm install`)
    await cmd
  } finally {
    process.chdir(prevDir)
  }
}

const ignored = path => !/^\.(git|hg)$/.test(sysPath.basename(path))

// Copy starter from file system.
const copy = async (starterPath: string, rootPath: string) => {
  // Chmod with 755.
  // 493 = parseInt('755', 8)
  await fs.mkdirp(rootPath, { mode: 493 })

  if (!existsSync(starterPath)) {
    throw new Error(`starter ${starterPath} doesn't exist`)
  }

  if (starterPath === `.`) {
    throw new Error(
      `You can't create a starter from the existing directory. If you want to
      create a new site in the current directory, the trailing dot isn't
      necessary. If you want to create a new site from a local starter, run
      something like "npx gatsby new new-gatsby-site ../my-gatsby-starter"`
    )
  }

  report.info(`Creating new site from local starter: ${starterPath}`)

  report.log(`Copying local starter to ${rootPath} ...`)

  await fs.copy(starterPath, rootPath, { filter: ignored })

  report.success(`Created starter directory layout`)

  await install(rootPath)

  return true
}

// Clones starter from URI.
const clone = async (hostInfo: any, rootPath: string) => {
  let url
  // Let people use private repos accessed over SSH.
  if (hostInfo.getDefaultRepresentation() === `sshurl`) {
    url = hostInfo.ssh({ noCommittish: true })
    // Otherwise default to normal git syntax.
  } else {
    url = hostInfo.https({ noCommittish: true, noGitPlus: true })
  }

  const branch = hostInfo.committish ? `-b ${hostInfo.committish}` : ``

  report.info(`Creating new site from git: ${url}`)

  await spawn(`git clone ${branch} ${url} ${rootPath} --single-branch`)

  report.success(`Created starter directory layout`)

  await fs.remove(sysPath.join(rootPath, `.git`))

  await install(rootPath)
  await gitInit(rootPath)
  await maybeCreateGitIgnore(rootPath)
  await createInitialGitCommit(rootPath, url)
}

type InitOptions = {
  rootPath?: string,
}

/**
 * Main function that clones or copies the starter.
 */
module.exports = async (starter: string, options: InitOptions = {}) => {
  const rootPath = options.rootPath || process.cwd()

  const urlObject = url.parse(rootPath)
  if (urlObject.protocol && urlObject.host) {
    report.panic(
      `It looks like you forgot to add a name for your new project. Try running instead "npx gatsby new new-gatsby-project ${rootPath}"`
    )
    return
  }

  if (existsSync(sysPath.join(rootPath, `package.json`))) {
    report.panic(`Directory ${rootPath} is already an npm project`)
    return
  }

  const hostedInfo = hostedGitInfo.fromUrl(starter)
  if (hostedInfo) await clone(hostedInfo, rootPath)
  else await copy(starter, rootPath)
}
