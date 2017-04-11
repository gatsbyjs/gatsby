// Invoke plugins for certain actions.

const { store } = require("./index")
const apiRunnerNode = require("../utils/api-runner-node")

store.subscribe(() => {
  const state = store.getState()
  if (state.lastAction.type === "CREATE_NODE") {
    const node = state.nodes[state.lastAction.payload.id]
    apiRunnerNode(`onNodeCreate`, { node })
  }
})
