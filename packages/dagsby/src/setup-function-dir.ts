const lockfile = require("proper-lockfile")
const pEvent = require("p-event")
const fs = require("fs-extra")
const execa = require(`execa`)
const path = require(`path`)
const _ = require(`lodash`)

const knownTaskFunctions = new Set()

module.exports = async function setupFunctionDir({
  task,
  funcDir,
  funcPath,
  parentMessages,
}) {
  // Check if SETUP file exists
  if (!knownTaskFunctions.has(funcPath)) {
    if (fs.existsSync(path.join(funcDir, `SETUP`))) {
      knownTaskFunctions.add(funcPath)
    }
  }

  // Check if the function folder is setup (with special file).
  // If not, try to get a lock to set it up
  // if that fails, listen for the event that it's ready.
  // console.log(`SETUP exists`, fs.existsSync(path.join(funcDir, `SETUP`)))
  if (!knownTaskFunctions.has(funcPath)) {
    // Am I the worker choosen to setup this task directory?
    if (task.func) {
      console.log(`setup function`, funcPath, task.dependencies)
      console.time(`setting up function ${funcPath}`)
      fs.writeFileSync(funcPath, `module.exports = ${task.func}`)
      if (task.dependencies) {
        const output = await execa(`npm`, [`init`, `--yes`], {
          cwd: funcDir,
        })
        console.log({ output })
        console.log([
          `install`,
          ..._.toPairs(task.dependencies).map(
            ([name, version]) => `${name}@${version}`
          ),
          `--legacy-peer-deps`,
        ])
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
        console.log({ output2 })
      }

      fs.writeFileSync(path.join(funcDir, `SETUP`), `true`)
      knownTaskFunctions.add(funcPath)
      process.send({ cmd: `broadcast`, msg: `taskSetup-${task.digest}` })
      console.timeEnd(`setting up function ${funcPath}`)
    } else {
      // Ok, nope, just wait for it to be setup.
      await pEvent(parentMessages, `taskSetup-${task.digest}`)
      knownTaskFunctions.add(funcPath)
    }
  }
}
