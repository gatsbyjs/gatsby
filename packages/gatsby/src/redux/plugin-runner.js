// Invoke plugins for certain actions.

const { store, emitter } = require(`./index`)
const apiRunnerNode = require(`../utils/api-runner-node`)

emitter.on(`CREATE_NODE`, action => {
  const node = store.getState().nodes.get(action.payload.id)
  const traceTags = { nodeId: node.id, nodeType: node.internal.type }
  apiRunnerNode(`onCreateNode`, {
    node,
    traceId: action.traceId,
    parentSpan: action.parentSpan,
    traceTags,
  })
})

emitter.on(`CREATE_PAGE`, action => {
  const page = action.payload
  apiRunnerNode(
    `onCreatePage`,
    { page, traceId: action.traceId, parentSpan: action.parentSpan },
    action.plugin.name
  )
})
