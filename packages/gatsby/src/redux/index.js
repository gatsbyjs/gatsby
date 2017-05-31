const Redux = require(`redux`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const { composeWithDevTools } = require(`remote-redux-devtools`)
const fs = require(`fs`)
const EventEmitter = require(`eventemitter2`)

// Create event emitter for actions
const emitter = new EventEmitter()

// Reducers
const reducers = require(`./reducers`)

// Read from cache the old node data.
let initialState = {}
try {
  initialState = JSON.parse(
    fs.readFileSync(`${process.cwd()}/.cache/redux-state.json`)
  )
} catch (e) {
  // ignore errors.
}

let store
// Only setup the Redux devtools if explicitly enabled.
if (process.env.REDUX_DEVTOOLS === `true`) {
  const sitePackageJSON = require(`${process.cwd()}/package.json`)
  const composeEnhancers = composeWithDevTools({
    realtime: true,
    port: 19999,
    name: sitePackageJSON.name,
  })
  store = Redux.createStore(
    Redux.combineReducers({ ...reducers }),
    initialState,
    composeEnhancers(Redux.applyMiddleware())
  )
} else {
  store = Redux.createStore(
    Redux.combineReducers({ ...reducers }),
    initialState
  )
}

// Persist state.
const saveState = _.debounce(state => {
  const pickedState = _.pick(state, [`nodes`, `status`, `pageDataDependencies`])
  fs.writeFile(
    `${process.cwd()}/.cache/redux-state.json`,
    JSON.stringify(pickedState, null, 2),
    () => {
      console.log(`---saved redux state`)
    }
  )
}, 1000)

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})

emitter.onAny(() => {
  saveState(store.getState())
})

exports.emitter = emitter
exports.store = store
exports.getNodes = () => _.values(store.getState().nodes)
const getNode = id => store.getState().nodes[id]
exports.getNode = getNode
exports.hasNodeChanged = (id, digest) => {
  const node = store.getState().nodes[id]
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
}

exports.loadNodeContent = node => {
  if (node.internal.content) {
    return Promise.resolve(node.internal.content)
  } else {
    return new Promise(resolve => {
      // Load plugin's loader function
      const plugin = store
        .getState()
        .flattenedPlugins.find(plug => plug.name === node.internal.owner)
      const { loadNodeContent } = require(plugin.resolve)
      if (!loadNodeContent) {
        throw new Error(
          `Could not find function loadNodeContent for plugin ${plugin.name}`
        )
      }

      return loadNodeContent(node).then(content => {
        // TODO update node's content field here.
        resolve(content)
      })
    })
  }
}

exports.getNodeAndSavePathDependency = (id, path) => {
  const { createPageDependency } = require(`./actions/add-page-dependency`)
  const node = getNode(id)
  createPageDependency({ path, nodeId: id })
  return node
}

// Start plugin runner which listens to the store
// and invokes Gatsby API based on actions.
require(`./plugin-runner`)
