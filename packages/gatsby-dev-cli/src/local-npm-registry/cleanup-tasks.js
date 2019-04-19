const signalExit = require(`signal-exit`)

const cleanupTasks = new Set()

exports.registerCleanupTask = taskFn => {
  cleanupTasks.add(taskFn)
  return () => {
    const result = taskFn()
    cleanupTasks.delete(taskFn)
    return result
  }
}

signalExit(() => {
  if (cleanupTasks.size) {
    console.log(`Process exitted in middle of publishing - cleaning up`)
    cleanupTasks.forEach(taskFn => taskFn())
  }
})
