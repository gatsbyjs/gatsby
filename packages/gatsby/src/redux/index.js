const Redux = require(`redux`)
const _ = require(`lodash`)

const mitt = require(`mitt`)

// Create event emitter for actions
const emitter = mitt()

// Reducers
const reducers = require(`./reducers`)
const { writeToCache, readFromCache } = require(`./persist`)

// Read old node data from cache.
let initialState = {}
try {
  initialState = readFromCache()
  if (initialState.nodes) {
    // re-create nodesByType
    initialState.nodesByType = new Map()
    initialState.nodes.forEach(node => {
      const { type } = node.internal
      if (!initialState.nodesByType.has(type)) {
        initialState.nodesByType.set(type, new Map())
      }
      initialState.nodesByType.get(type).set(node.id, node)
    })
  }
} catch (e) {
  // ignore errors.
}

const store = Redux.createStore(
  Redux.combineReducers({ ...reducers }),
  initialState,
  Redux.applyMiddleware(function multi({ dispatch }) {
    return next => action =>
      Array.isArray(action)
        ? action.filter(Boolean).map(dispatch)
        : next(action)
  })
)

// Persist state.
function saveState() {
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

exports.saveState = saveState

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})

/** Event emitter */
exports.emitter = emitter

/** Redux store */
exports.store = store
