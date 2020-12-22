const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const path = require(`path`)
const fs = require(`fs-extra`)

const functionDir = path.join(__dirname, `worker-tasks`)

exports.runTask = ({ handler, args }) => {
  // Write out the function
  const handlerHash = murmurhash(handler) + `.js`
  const handlerPath = path.join(functionDir, handlerHash)
  console.log({ handlerPath })
  fs.ensureDirSync(path.parse(handlerPath).dir)
  fs.writeFileSync(handlerPath, `module.exports = ${handler}`)

  let taskRunner = require(handlerPath)
  console.log(taskRunner)
  if (taskRunner.default) {
    taskRunner = taskRunner.default
  }
  console.time(`runTask`)
  const result = taskRunner(args)
  console.timeEnd(`runTask`)
  return result
}

exports.warmup = () => {}
