const fs = require(`fs-extra`)
const path = require(`path`)
const JestWorker = require(`jest-worker`).default
const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)

const workerPool = new JestWorker(require.resolve(`./run-task`), {
  exposedMethods: [`runTask`, `warmup`],
  numWorkers: 2,
  forkOptions: { silent: false },
})

// jest-worker is lazy with forking but we want to fork immediately so the user
// doesn't have to wait.
// @ts-ignore
workerPool.warmup()

function _getCallerFile() {
  var originalFunc = Error.prepareStackTrace

  var callerfile
  try {
    var err = new Error()
    var currentfile

    Error.prepareStackTrace = function (err, stack) {
      return stack
    }

    currentfile = err.stack.shift().getFileName()

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName()

      if (currentfile !== callerfile) break
    }
  } catch (e) {}

  Error.prepareStackTrace = originalFunc

  return callerfile
}

const functionSetup = new Map()
const setupFunctionFile = handler => {
  if (functionSetup.get(handler)) {
    return functionSetup.get(handler)
  } else {
    const { store } = require(`../redux`)
    const program = store.getState().program
    const cacheDir = path.join(
      program.directory,
      `.cache`,
      `caches`,
      `worker-tasks`
    )

    const callerFile = _getCallerFile()

    fs.ensureDirSync(cacheDir)

    // Write out the function
    const functionHash = murmurhash(handler) + `.js`
    const functionPath = path.join(cacheDir, functionHash)
    fs.writeFileSync(
      functionPath,
      `// called by ${callerFile}\nmodule.exports = ${handler}`
    )
    functionSetup.set(handler, functionPath)
    return functionPath
  }
}

export async function runTask(handler, ...args) {
  let result
  if (typeof handler === `function`) {
    const pathToHandler = setupFunctionFile(handler.toString())
    return await workerPool.runTask(pathToHandler, ...args)
    // return require(pathToHandler)(...args)
  } else {
    // Worker
    return await workerPool.runTask(handler, ...args)

    // in-process
    // let taskRunner = require(handler)
    // if (taskRunner.default) {
    // taskRunner = taskRunner.default
    // }
    // return taskRunner(...args)
  }
}
