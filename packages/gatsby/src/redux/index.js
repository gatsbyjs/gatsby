const Redux = require(`redux`)
const _ = require(`lodash`)
const fs = require(`fs`)
const mitt = require(`mitt`)
const v8 = require(`v8`)

const { trackObjects } = require(`../schema/utils/node-tracking`)

// Create event emitter for actions
const emitter = mitt()

// Reducers
const reducers = require(`./reducers`)

const readFileSync = filePath => v8.deserialize(fs.readFileSync(filePath))

const writeFileSync = (filePath, contents) =>
  fs.writeFileSync(filePath, v8.serialize(contents))

const filePath = `${process.cwd()}/.cache/redux-state.json`

// Read the old node data from cache.
let initialState = {}
try {
  initialState = readFileSync(filePath)
} catch (e) {
  // ignore errors.
}

if (initialState.nodes) {
  initialState.nodes.forEach(trackObjects)

  initialState.nodesByType = new Map()
  initialState.nodes.forEach(node => {
    const { type } = node.internal
    if (!initialState.nodesByType.has(type)) {
      initialState.nodesByType.set(type, new Map())
    }
    initialState.nodesByType.get(type).set(node.id, node)
  })
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

const saveState = state => {
  const pickedState = _.pick(state, [
    `nodes`,
    `status`,
    `componentDataDependencies`,
    `jsonDataPaths`,
    `components`,
    `staticQueryComponents`,
  ])
  writeFileSync(filePath, pickedState)
}
const saveStateDebounced = _.debounce(saveState, 1000)

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})

// During development, once bootstrap is finished, persist state on changes.
if (process.env.gatsby_executing_command === `develop`) {
  let bootstrapFinished = false
  emitter.on(`BOOTSTRAP_FINISHED`, () => {
    bootstrapFinished = true
    saveState(store.getState())
  })
  emitter.on(`*`, () => {
    if (bootstrapFinished) {
      saveStateDebounced(store.getState())
    }
  })
}

// During builds, persist state once bootstrap has finished.
if (process.env.gatsby_executing_command === `build`) {
  emitter.on(`BOOTSTRAP_FINISHED`, () => {
    saveState(store.getState())
  })
}

/** Event emitter */
exports.emitter = emitter

/** Redux store */
exports.store = store
