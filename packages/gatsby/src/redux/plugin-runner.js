// Invoke plugins for certain actions.

const { store, emitter } = require(`./index`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const _ = require(`lodash`)

emitter.on(`CREATE_NODE`, action => {
  const node = store.getState().nodes[action.payload.id]
  apiRunnerNode(`onCreateNode`, { node, traceId: action.traceId })
})

emitter.on(`CREATE_PAGE`, action => {
  const page = action.payload
  apiRunnerNode(
    `onCreatePage`,
    { page, traceId: action.traceId },
    action.plugin.name
  )
})

emitter.on(`CREATE_LAYOUT`, action => {
  const layout = action.payload
  apiRunnerNode(
    `onCreateLayout`,
    { layout, traceId: action.traceId },
    action.plugin.name
  )
})
