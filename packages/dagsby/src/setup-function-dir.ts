const fs = require(`fs-extra`)
const execa = require(`execa`)
const path = require(`path`)
const _ = require(`lodash`)

const funcDirs = new Set()

module.exports = async function setupFunctionDir({
  task,
  functionDir,
  parentMessages,
  emit,
}) {
  const funcDir = path.join(functionDir, task.digest.toString())
  const funcPath = path.join(functionDir, task.digest.toString(), `index.js`)
  if (!funcDirs.has(funcDir)) {
    fs.ensureDirSync(funcDir)
    funcDirs.add(funcDir)
  }

  console.log(`setting up function ${funcPath}`)
  console.time(`setting up function ${funcPath}`)
  fs.writeFileSync(funcPath, `module.exports = ${task.func}`)
  if (task.dependencies) {
    const output = await execa(`npm`, [`init`, `--yes`], {
      cwd: funcDir,
    })
    // console.log({ output })
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

  emit({ cmd: `broadcast`, msg: `taskSetup-${task.digest}` })
  console.timeEnd(`setting up function ${funcPath}`)

  return { funcPath, funcDir }
}
