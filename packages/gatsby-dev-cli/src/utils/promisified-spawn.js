const execa = require(`execa`)

const defaultSpawnArgs = {
  cwd: process.cwd(),
  stdio: process.env.DEBUG ? `inherit` : `ignore`,
}

exports.promisifiedSpawn = ([cmd, args = [], spawnArgs = {}]) =>
  execa(cmd, args, {
    ...defaultSpawnArgs,
    ...spawnArgs,
  })
