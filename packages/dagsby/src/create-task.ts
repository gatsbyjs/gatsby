const XXH = require(`xxhashjs`)
const avro = require("avsc")
const prepareFiles = require(`./prepare-files`)

async function createTask(taskDef) {
  const task = {}

  // Stringifiy the function
  const funcStr = taskDef.func.toString()
  task.func = funcStr
  const funcDigest = parseInt(
    XXH.h32(funcStr, 0xabcd).toString().slice(0, 5),
    10
  )
  task.funcDigest = funcDigest

  // Set the task digest
  if (!task.digest) {
    const TASK_DIGEST_KEY = funcStr + taskDef.dependencies?.toString() || ``
    const taskDigest = parseInt(
      String(XXH.h32(TASK_DIGEST_KEY, 0xabcd)).slice(0, 5),
      10
    )
    task.digest = taskDigest
  }

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
  const files = await prepareFiles(taskDef.files)
  if (files) {
    task.files = files
  }

  // Copy over dependencies
  if (taskDef.dependencies) {
    task.dependencies = { ...taskDef.dependencies }
  }

  // Copy over returnOnlyErrors
  if (taskDef.returnOnlyErrors) {
    task.returnOnlyErrors = taskDef.returnOnlyErrors
  } else {
    task.returnOnlyErrors = false
  }

  return task
}

module.exports = createTask
