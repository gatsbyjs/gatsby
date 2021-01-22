const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const avro = require("avsc")
const processFiles = require(`./prepare-files`)

async function createTask(taskDef) {
  const task = {}

  // Stringifiy the function
  const funcStr = taskDef.func.toString()
  task.func = funcStr
  const funcDigest = parseInt(murmurhash(funcStr).toString().slice(0, 5), 10)
  task.funcDigest = funcDigest

  // Set the task digest
  if (!task.digest) {
    const TASK_DIGEST_KEY = funcStr + taskDef.dependencies?.toString() || ``
    const taskDigest = parseInt(
      String(murmurhash(TASK_DIGEST_KEY)).slice(0, 5),
      10
    )
    task.digest = taskDigest
  }
  console.log({ digest: task.digest })

  // Validate the args schema
  if (taskDef.argsSchema) {
    const schema = avro.Type.forSchema({
      type: `array`,
      items: {
        type: `record`,
        fields: [
          {
            name: `id`,
            type: `int`,
          },
          {
            name: `args`,
            type: {
              type: `record`,
              fields: taskDef.argsSchema,
            },
          },
        ],
      },
    })
    task.argsSchema = schema.toJSON()
  }

  // Process files
  const files = await processFiles(taskDef.files)
  if (files) {
    task.files = files
  }

  // Copy over dependencies
  if (taskDef.dependencies) {
    task.dependencies = { ...taskDef.dependencies }
  }

  return task
}

module.exports = createTask
