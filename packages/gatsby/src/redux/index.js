const { createStore, combineReducers, applyMiddleware } = require(`redux`)
const _ = require(`lodash`)

const mitt = require(`mitt`)
const reducers = require(`./reducers`)
const middleware = require(`./middleware`)

// Create event emitter for actions
const emitter = mitt()

const { writeToCache, readFromCache } = require(`./persist`)

// Read old node data from cache.
const readState = () => {
  try {
    const state = readFromCache()
    if (state.nodes) {
      // re-create nodesByType
      state.nodesByType = new Map()
      state.nodes.forEach(node => {
        const { type } = node.internal
        if (!state.nodesByType.has(type)) {
          state.nodesByType.set(type, new Map())
        }
        state.nodesByType.get(type).set(node.id, node)
      })
    }
    return state
  } catch (e) {
    // ignore errors.
  }
  return {}
}

// Persist state
const saveState = () => {
  if (process.env.DANGEROUSLY_DISABLE_OOM) {
    return Promise.resolve()
  }

  const state = store.getState()
  const pickedState = _.pick(state, [
    `nodes`,
    `status`,
    `componentDataDependencies`,
    `jsonDataPaths`,
    `components`,
    `staticQueryComponents`,
  ])

  return writeToCache(pickedState)
}

const configureStore = initialState =>
  createStore(
    combineReducers(reducers),
    initialState,
    applyMiddleware(...middleware)
  )

const store = configureStore(readState())

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})

module.exports = {
  emitter,
  store,
  configureStore,
  readState,
  saveState,
}
