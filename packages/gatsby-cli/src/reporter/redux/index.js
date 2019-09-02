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
    } else if (typeof action === `function`) {
      action(iface.dispatch)
      return
    }

    action = {
      ...action,
      timestamp: new Date().toJSON(),
    }

    store.dispatch(action)

    if (
      action.type.startsWith(`ACTIVITY_`) &&
      action.payload.type === `hidden`
    ) {
      // consumers (ipc, yurnalist, json logger) shouldn't have to
      // deal with actions needed just for internal tracking of status
      return
    }
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
