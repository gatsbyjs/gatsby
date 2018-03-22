const Redux = require(`redux`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const { composeWithDevTools } = require(`remote-redux-devtools`)
const fs = require(`fs`)
const mitt = require(`mitt`)
const stringify = require(`json-stringify-safe`)

// Create event emitter for actions
const emitter = mitt()

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
    composeEnhancers(
      Redux.applyMiddleware(function multi({ dispatch }) {
        return next => action =>
          Array.isArray(action)
            ? action.filter(Boolean).map(dispatch)
            : next(action)
      })
    )
  )
} else {
  store = Redux.createStore(
    Redux.combineReducers({ ...reducers }),
    initialState,
    Redux.applyMiddleware(function multi({ dispatch }) {
      return next => action =>
        Array.isArray(action)
          ? action.filter(Boolean).map(dispatch)
          : next(action)
    })
  )
}

// Persist state.
const saveState = _.debounce(state => {
  const pickedState = _.pick(state, [
    `nodes`,
    `status`,
    `componentDataDependencies`,
  ])
  fs.writeFile(
    `${process.cwd()}/.cache/redux-state.json`,
    stringify(pickedState, null, 2),
    () => {}
  )
}, 1000)

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})

emitter.on(`*`, () => {
  saveState(store.getState())
})

/** Event emitter */
exports.emitter = emitter

/** Redux store */
exports.store = store

/**
  * Get all nodes from redux store.
  *
  * @returns {Array}
  */
exports.getNodes = () => {
  let nodes = _.values(store.getState().nodes)
  return nodes ? nodes : []
}
const getNode = id => store.getState().nodes[id]

/** Get node by id from store.
  *
  * @param {string} id
  * @returns {Object}
  */
exports.getNode = getNode

/**
  * Determine if node has changed.
  *
  * @param {string} id
  * @param {string} digest
  * @returns {boolean}
  */
exports.hasNodeChanged = (id, digest) => {
  const node = store.getState().nodes[id]
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
}

/**
  * Get content for a node from the plugin that created it.
  *
  * @param {Object} node
  * @returns {promise}
  */
exports.loadNodeContent = node => {
  if (_.isString(node.internal.content)) {
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

/**
  * Get node and save path dependency.
  *
  * @param {string} id
  * @param {string} path
  * @returns {Object} node
  */
exports.getNodeAndSavePathDependency = (id, path) => {
  const { createPageDependency } = require(`./actions/add-page-dependency`)
  const node = getNode(id)
  createPageDependency({ path, nodeId: id })
  return node
}

// Start plugin runner which listens to the store
// and invokes Gatsby API based on actions.
require(`./plugin-runner`)
