const execa = require(`execa`)
const path = require(`path`)
const signalExit = require(`signal-exit`)

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

const cleanupTasks = new Set()

exports.registerCleanupTask = taskFn => {
  cleanupTasks.add(taskFn)
  return () => {
    const result = taskFn()
    cleanupTasks.delete(taskFn)
    return result
  }
}

signalExit(() => {
  if (cleanupTasks.size) {
    console.log(`Process exitted in middle of publishing - cleaning up`)
    cleanupTasks.forEach(taskFn => taskFn())
  }
})
