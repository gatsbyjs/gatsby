const Redux = require(`redux`)
const _ = require(`lodash`)
const fs = require(`fs`)
const mitt = require(`mitt`)
const v8 = require(`v8`)
const stringify = require(`json-stringify-safe`)

// Create event emitter for actions
const emitter = mitt()

// Reducers
const reducers = require(`./reducers`)

const objectToMap = obj => {
  const map = new Map()
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

const jsonStringify = contents => {
  contents.staticQueryComponents = mapToObject(contents.staticQueryComponents)
  contents.components = mapToObject(contents.components)
  contents.nodes = mapToObject(contents.nodes)
  return stringify(contents, null, 2)
}

const jsonParse = buffer => {
  const parsed = JSON.parse(buffer.toString(`utf8`))
  parsed.staticQueryComponents = objectToMap(parsed.staticQueryComponents)
  parsed.components = objectToMap(parsed.components)
  parsed.nodes = objectToMap(parsed.nodes)
  return parsed
}

const useV8 = Boolean(v8.serialize)
const [serialize, deserialize] = useV8
  ? [v8.serialize, v8.deserialize]
  : [jsonStringify, jsonParse]

const readFileSync = file => deserialize(fs.readFileSync(file))

const writeFileSync = (file, contents) =>
  fs.writeFileSync(file, serialize(contents))

const file = `${process.cwd()}/.cache/redux.state`

// Read old node data from cache.
let initialState = {}
try {
  initialState = readFileSync(file)
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
  const state = store.getState()
  const pickedState = _.pick(state, [
    `nodes`,
    `status`,
    `componentDataDependencies`,
    `jsonDataPaths`,
    `components`,
    `staticQueryComponents`,
  ])

  writeFileSync(file, pickedState)
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
