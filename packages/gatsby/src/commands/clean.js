const fs = require(`fs-extra`)
const { execSync } = require(`child_process`)
const execa = require(`execa`)
const path = require(`path`)

const YARN_COMMAND = `yarnpkg`

const spawn = cmd => {
  const [file, ...args] = cmd.split(/\s+/)
  return execa(file, args, { stdio: `inherit` })
}

const shouldUseYarn = () => {
  try {
    execSync(`${YARN_COMMAND} --version`, { stdio: `ignore` })
    return true
  } catch (e) {
    return false
  }
}

// Executes `npm install` or `yarn install` in rootPath.
const install = async ({ directory: rootPath, report }) => {
  const prevDir = process.cwd()

  report.info(`Installing packages...`)
  process.chdir(rootPath)

  try {
    let cmd = shouldUseYarn() ? spawn(YARN_COMMAND) : spawn(`npm install`)
    await cmd
  } finally {
    process.chdir(prevDir)
  }
}

module.exports = async function clean(args) {
  const { directory, report } = args

  const directories = [`.cache`, `public`, `node_modules`]

  report.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  report.info(`Successfully deleted local directories`)

  await install(args)
}
