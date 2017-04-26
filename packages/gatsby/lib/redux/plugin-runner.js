// Invoke plugins for certain actions.

const { store } = require("./index")
const apiRunnerNode = require("../utils/api-runner-node")

store.subscribe(() => {
  const state = store.getState()
  // console.log("last action", state.lastAction.type)
  if (
    state.lastAction.type === "CREATE_NODE" &&
    state.lastAction.payload.logical !== true
  ) {
    const node = state.nodes[state.lastAction.payload.id]
    apiRunnerNode(`onNodeCreate`, { node })
  }

  if (state.lastAction.type === "UPSERT_PAGE") {
    const page = state.nodes[state.lastAction.payload]
    apiRunnerNode(`onUpsertPage`, { page })
  }
})
