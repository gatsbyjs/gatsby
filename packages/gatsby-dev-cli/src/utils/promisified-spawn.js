const execa = require(`execa`)

const defaultSpawnArgs = {
  cwd: process.cwd(),
  stdio: `inherit`,
}

exports.setDefaultSpawnStdio = stdio => {
  defaultSpawnArgs.stdio = stdio
}

exports.promisifiedSpawn = async ([cmd, args = [], spawnArgs = {}]) => {
  const spawnOptions = {
    ...defaultSpawnArgs,
    ...spawnArgs,
  }
  try {
    return await execa(cmd, args, spawnOptions)
  } catch (e) {
    if (spawnOptions.stdio === `ignore`) {
      console.log(
        `\nCommand "${cmd} ${args.join(
          ` `
        )}" failed.\nTo see details of failed command, rerun "gatsby-dev" without "--quiet" or "-q" switch\n`
      )
    }
    throw e
  }
}
