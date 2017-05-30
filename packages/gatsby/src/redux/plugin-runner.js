// Invoke plugins for certain actions.

const { store, emitter } = require(`./index`)
const apiRunnerNode = require(`../utils/api-runner-node`)

emitter.on(`CREATE_NODE`, action => {
  const node = store.getState().nodes[action.payload.id]
  apiRunnerNode(`onNodeCreate`, { node })
})

emitter.on(`CREATE_PAGE`, action => {
  const page = action.payload
  apiRunnerNode(`onCreatePage`, { page }, action.plugin.name)
})
