const Redux = require("redux")
const Promise = require("bluebird")
const _ = require("lodash")
const { composeWithDevTools } = require("remote-redux-devtools")
const fs = require("fs")

// Reducers
const reducers = require("./reducers")

// Read from cache the old node data.
let initialState = {}
try {
  initialState = JSON.parse(
    fs.readFileSync(`${process.cwd()}/.cache/redux-state.json`)
  )
} catch (e) {
  // ignore errors.
}

const composeEnhancers = composeWithDevTools({
  realtime: true,
  port: 19999,
  name: `gatsby-redux`,
})

let store
// Don't try connecting to devtools server if testing or building.
if (process.env.NODE_ENV === `test` || process.env.NODE_ENV === `production`) {
  store = Redux.createStore(
    Redux.combineReducers({ ...reducers }),
    initialState
  )
} else {
  store = Redux.createStore(
    Redux.combineReducers({ ...reducers }),
    initialState,
    composeEnhancers(Redux.applyMiddleware())
  )
}

// Persist state.
const saveState = _.debounce(state => {
  console.log("===============saving redux state")
  const pickedState = _.pick(state, [
    "nodes",
    "pages",
    "pageDataDependencies",
    "pageComponents",
  ])
  fs.writeFile(
    `${process.cwd()}/.cache/redux-state.json`,
    JSON.stringify(pickedState, null, 2)
  )
}, 1000)

store.subscribe(() => {
  saveState(store.getState())
})

exports.store = store
exports.getNodes = () => {
  return _.values(store.getState().nodes)
}
const getNode = id => {
  return store.getState().nodes[id]
}
exports.getNode = getNode
exports.hasNodeChanged = (id, digest) => {
  const node = store.getState().nodes[id]
  return node.contentDigest !== digest
}

exports.loadNodeContent = node => {
  if (node.content) {
    return Promise.resolve(node.content)
  } else {
    return new Promise(resolve => {
      // Load plugin's loader function
      const plugin = store
        .getState()
        .flattenedPlugins.find(plug => plug.name === node.pluginName)
      const { loadNodeContent } = require(plugin.resolve)
      return loadNodeContent(node).then(content => {
        // TODO update node's content field here.
        resolve(content)
      })
    })
  }
}

exports.getNodeAndSavePathDependency = (id, path) => {
  const { addPageDependency } = require("./actions/add-page-dependency")
  const node = getNode(id)
  addPageDependency({ path, nodeId: id })
  return node
}

// Start plugin runner which listens to the store
// and invokes Gatsby API based on actions.
require("./plugin-runner")
