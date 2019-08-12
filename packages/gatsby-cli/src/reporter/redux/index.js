const Redux = require(`redux`)
const reducer = require(`./reducer`)

let store = Redux.createStore(
  Redux.combineReducers({
    logs: reducer,
  }),
  {}
)

const storeSwapListeners = []
const onLogActionListeners = []

const iface = {
  getStore: () => store,
  dispatch: action => {
    if (!action) {
      return
    }

    if (Array.isArray(action)) {
      action.forEach(item => iface.dispatch(item))
      return
    }

    store.dispatch(action)
    onLogActionListeners.forEach(fn => fn(action))
  },
  onStoreSwap: fn => {
    storeSwapListeners.push(fn)
  },
  onLogAaction: fn => {
    onLogActionListeners.push(fn)
  },
  setStore: s => {
    s.dispatch({
      type: `SET_LOGS`,
      payload: store.getState().logs,
    })
    store = s
    storeSwapListeners.forEach(fn => fn(store))
  },
}

module.exports = iface
