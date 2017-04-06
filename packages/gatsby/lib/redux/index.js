const Redux = require("redux")
const _ = require("lodash")
const { composeWithDevTools } = require("remote-redux-devtools")
const apiRunnerNode = require("../utils/api-runner-node")

// Reducers
const reducers = require("./reducers")

const initialState = {}

const composeEnhancers = composeWithDevTools({
  realtime: true,
  port: 19999,
  name: `gatsby-redux`,
})

const store = Redux.createStore(
  Redux.combineReducers({ ...reducers }),
  initialState,
  composeEnhancers(Redux.applyMiddleware())
)

exports.store = store
exports.getNodes = () => {
  return _.values(store.getState().nodes)
}
const getNode = id => {
  return store.getState().nodes[id]
}
exports.getNode = getNode

exports.getNodeAndSavePathDependency = (id, path) => {
  const node = getNode(id)
  store.dispatch({
    type: `ADD_PAGE_DEPENDENCY`,
    payload: {
      path,
      nodeId: id,
    },
  })
  return node
}

// Start plugin runner which listens to the store
// and invokes Gatsby API based on actions.
require("./plugin-runner")
