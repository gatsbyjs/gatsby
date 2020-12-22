exports.runTask = (handlerPath, args) => {
  // console.log({ handlerPath, args })
  let taskRunner = require(handlerPath)
  // console.log(taskRunner)
  if (taskRunner.default) {
    taskRunner = taskRunner.default
  }
  return taskRunner(args)
}

exports.warmup = () => {}
