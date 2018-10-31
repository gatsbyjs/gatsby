const Redux = require(`redux`)
const _ = require(`lodash`)
const fs = require(`fs`)
const mitt = require(`mitt`)
const stringify = require(`json-stream-stringify`)

// Create event emitter for actions
const emitter = mitt()

// Reducers
const reducers = require(`./reducers`)

const objectToMap = obj => {
  let map = new Map()
  Object.keys(obj).forEach(key => {
    map.set(key, obj[key])
  })
  return map
}

const mapToObject = map => {
  const obj = {}
  for (let [key, value] of map) {
    obj[key] = value
  }
  return obj
}

// Read from cache the old node data.
let initialState = {}
try {
  const file = fs.readFileSync(`${process.cwd()}/.cache/redux-state.json`)
  // Apparently the file mocking in node-tracking-test.js
  // can override the file reading replacing the mocked string with
  // an already parsed object.
  if (Buffer.isBuffer(file) || typeof file === `string`) {
    initialState = JSON.parse(file)
  }
  if (initialState.staticQueryComponents) {
    initialState.staticQueryComponents = objectToMap(
      initialState.staticQueryComponents
    )
  }
  if (initialState.components) {
    initialState.components = objectToMap(initialState.components)
  }
  if (initialState.nodes) {
    initialState.nodes = objectToMap(initialState.nodes)
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
const saveState = state => {
  const pickedState = _.pick(state, [
    `nodes`,
    `status`,
    `componentDataDependencies`,
    `jsonDataPaths`,
    `components`,
    `staticQueryComponents`,
  ])

  pickedState.staticQueryComponents = mapToObject(
    pickedState.staticQueryComponents
  )
  pickedState.components = mapToObject(pickedState.components)
  pickedState.nodes = mapToObject(pickedState.nodes)

  const writeStream = fs.createWriteStream(
    `${process.cwd()}/.cache/redux-state.json`
  )

  new stringify(pickedState, null, 2, true)
    .pipe(writeStream)
    .on(`finish`, () => {
      writeStream.destroy()
      writeStream.end()
    })
    .on(`error`, () => {
      writeStream.destroy()
      writeStream.end()
    })
}
const saveStateDebounced = _.debounce(saveState, 1000)

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})

// During development, once bootstrap is finished, persist state on changes.
let bootstrapFinished = false
if (process.env.gatsby_executing_command === `develop`) {
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
