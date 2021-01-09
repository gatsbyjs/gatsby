exports.runTask = function runTask({ handlerPath, args, files, traceId }) {
  let taskRunner = require(handlerPath)
  if (taskRunner.default) {
    taskRunner = taskRunner.default
  }

  return Promise.resolve(taskRunner(args, { traceId, files }))
}
