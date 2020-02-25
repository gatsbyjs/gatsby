const { runTask } = require("./cloud-function-task-runner")
const { processFile } = require("gatsby-plugin-sharp/process-file")

exports.processor = async (msg, context) => {
  await runTask(msg, async (file, event) => {
    const results = processFile(
      file,
      event.action.operations,
      event.action.pluginOptions
    )
    return Promise.all(results)
  })
}
