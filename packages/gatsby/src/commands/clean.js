const fs = require(`fs-extra`)
const execa = require(`execa`)
const path = require(`path`)

const YARN_COMMAND = `yarnpkg`

const install = async ({ directory: rootPath, report, useYarn }) => {
  const prevDir = process.cwd()

  report.info(`Installing packages...`)
  process.chdir(rootPath)

  try {
    let cmd = useYarn ? execa(YARN_COMMAND) : execa(`npm`, [`install`])
    const { stdout, stderr } = cmd
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
    await cmd
  } finally {
    process.chdir(prevDir)
  }
}

module.exports = async function clean(args) {
  const { directory, noInstall, report } = args

  const directories = [`.cache`, `public`, `node_modules`]

  report.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  report.info(`Successfully deleted directories`)

  if (!noInstall) {
    await install(args)
  }
}
