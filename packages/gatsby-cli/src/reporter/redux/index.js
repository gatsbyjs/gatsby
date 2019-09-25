const Redux = require(`redux`)
const reducer = require(`./reducer`)

const { ActivityTypes, Actions, LogLevels } = require(`../constants`)

let store = Redux.createStore(
  Redux.combineReducers({
    logs: reducer,
  }),
  {}
)

const storeSwapListeners = []
const onLogActionListeners = []

const isInternalAction = action => {
  if ([Actions.PendingActivity, Actions.CancelActivity].includes(action.type)) {
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

    if (action.type === Actions.Log) {
      // Don't emit Debug over IPC
      if ([LogLevels.Debug].includes(action.payload.level)) {
        return
      }
      // Override Success and Log types to Info over IPC
      if ([LogLevels.Success, LogLevels.Log].includes(action.payload.level)) {
        action.payload.level = LogLevels.Info
      }
    }

    store.dispatch(action)

    if (isInternalAction(action)) {
      // consumers (ipc, yurnalist, json logger) shouldn't have to
      // deal with actions needed just for internal tracking of status
      return
    }
    onLogActionListeners.forEach(fn => fn(action))
  },
  onStoreSwap: fn => {
    storeSwapListeners.push(fn)
  },
  onLogAction: fn => {
    onLogActionListeners.push(fn)
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
