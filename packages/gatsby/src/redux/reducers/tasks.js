// TODO: Ensure this is not persisted to disk since tasks are ephemeral
const initialState = {
  tasks: new Map(),
}

const runTask = task => {
  //   process.stdout.write(task)
  const { id, name, plugin, args, deferred } = task
  const pluginName = plugin.name
  // TODO: This might want to check package.json to figure out where the entry point is
  const worker = require.resolve(`${pluginName}/worker`)
  // console.log(`worker`, worker)
  try {
    const workerFn = require(worker)[name]
    Promise.resolve(workerFn(args))
      .then(deferred.resolve)
      .catch(error => {
        // TODO: This should be a structured Error
        // process.stdout.write(error)
        deferred.reject(error)
      })
      .finally(() => {
        initialState.tasks.delete(id)
      })
  } catch (error) {
    // TODO: This should be a structured Error
    // process.stdout.write(error)
    deferred.reject(error)
  } finally {
    // initialState.tasks.delete(id)
  }
}

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case `CREATE_TASK`: {
      const { tasks } = state
      const { id, name, args, plugin, deferred } = action
      const payload = {
        id,
        name,
        args,
        plugin,
      }
      tasks.set(id, payload)
      process.stdout.write(JSON.stringify(payload))
      runTask({
        ...payload,
        deferred,
      })
      return state
    }
    case `END_TASK`: {
      const { id } = action
      state.tasks.delete(id)
      return state
    }
  }

  return state
}
