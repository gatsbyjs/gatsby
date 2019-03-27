const execa = require(`execa`)
const path = require(`path`)

const defaultSpawnArgs = {
  cwd: process.cwd(),
  stdio: process.env.DEBUG ? `inherit` : `ignore`,
}

exports.promisifiedSpawn = ([cmd, args = [], spawnArgs = {}]) =>
  execa(cmd, args, {
    ...defaultSpawnArgs,
    ...spawnArgs,
  })

exports.getMonorepoPackageJsonPath = ({ packageName, root }) =>
  path.join(root, `packages`, packageName, `package.json`)
