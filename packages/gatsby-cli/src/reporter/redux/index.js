const Redux = require(`redux`)
const reducer = require(`./reducer`)

const { ActivityTypes, Actions } = require(`../constants`)

let store = Redux.createStore(
  Redux.combineReducers({
    logs: reducer,
  }),
  {}
)

const storeSwapListeners = []
const onLogActionListeners = new Set()

const isInternalAction = action => {
  if (
    [
      Actions.PendingActivity,
      Actions.CancelActivity,
      Actions.ActivityErrored,
    ].includes(action.type)
  ) {
    return true
  }

  if ([Actions.StartActivity, Actions.EndActivity].includes(action.type)) {
    return action.payload.type === ActivityTypes.Hidden
  }

  return false
}

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

    if (isInternalAction(action)) {
      // consumers (ipc, yurnalist, json logger) shouldn't have to
      // deal with actions needed just for internal tracking of status
      return
    }
    for (const fn of onLogActionListeners) {
      fn(action)
    }
  },
  onStoreSwap: fn => {
    storeSwapListeners.push(fn)
  },
  onLogAction: fn => {
    onLogActionListeners.add(fn)
    return () => {
      onLogActionListeners.delete(fn)
    }
  },
  setStore: s => {
    s.dispatch({
      type: Actions.SetLogs,
      payload: store.getState().logs,
    })
    store = s
    storeSwapListeners.forEach(fn => fn(store))
  },
}

module.exports = iface
