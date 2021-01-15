const lockfile = require("proper-lockfile")
const pEvent = require("p-event")
const fs = require("fs-extra")
const execa = require(`execa`)
const path = require(`path`)
const _ = require(`lodash`)

const knownTaskFunctions = new Set()
const funcDirs = new Set()

module.exports = async function setupFunctionDir({
  task,
  functionDir,
  parentMessages,
  emit,
}) {
  // Hash the func + dependencies (you can pass in dynamic dependencies).
  const funcDir = path.join(functionDir, task.digest.toString())
  const funcPath = path.join(functionDir, task.digest.toString(), `index.js`)
  if (!funcDirs.has(funcDir)) {
    fs.ensureDirSync(funcDir)
    funcDirs.add(funcDir)
  }

  // Check if SETUP file exists
  if (!knownTaskFunctions.has(funcPath)) {
    if (fs.existsSync(path.join(funcDir, `SETUP`))) {
      knownTaskFunctions.add(funcPath)
    }
  }

  // Check if the function folder is setup (with special file).
  // If not, try to get a lock to set it up
  // if that fails, listen for the event that it's ready.
  if (!knownTaskFunctions.has(funcPath)) {
    // Am I the worker choosen to setup this task directory? Try to get the lockfile
    let lockRelease
    try {
      lockRelease = await lockfile.lock(funcDir, {
        lockFilePath: path.join(funcDir, `dir.lock`),
      })
    } catch {
      // ignore
    }

    if (lockRelease && task.func) {
      console.time(`setting up function ${funcPath}`)
      fs.writeFileSync(funcPath, `module.exports = ${task.func}`)
      if (task.dependencies) {
        const output = await execa(`npm`, [`init`, `--yes`], {
          cwd: funcDir,
        })
        const output2 = await execa(
          `npm`,
          [
            `install`,
            ..._.toPairs(task.dependencies).map(
              ([name, version]) => `${name}@${version}`
            ),
            `--legacy-peer-deps`,
          ],
          { cwd: funcDir }
        )
        // console.log({ output2 })
      }

      fs.writeFileSync(path.join(funcDir, `SETUP`), `true`)
      knownTaskFunctions.add(funcPath)

      emit({ cmd: `broadcast`, msg: `taskSetup-${task.digest}` })
      console.timeEnd(`setting up function ${funcPath}`)
      lockRelease()
    } else {
      // Ok, nope, just wait for it to be setup.
      await pEvent(parentMessages, `taskSetup-${task.digest}`)
      knownTaskFunctions.add(funcPath)
    }
  }

  return { funcPath, funcDir }
}
