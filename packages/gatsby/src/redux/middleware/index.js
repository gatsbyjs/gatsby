const thunk = require(`redux-thunk`).default

const multi = store => next => action =>
  Array.isArray(action)
    ? action.filter(Boolean).map(store.dispatch)
    : next(action)

const log = store => next => action => {
  // We could also log every action here if we wanted to.
  // Maybe also add a timestamp to the payload here.
  if (action.type === `LOG_MESSAGE`) {
    const { log } = store.getState()
    return log(action.payload)
  }

  return next(action)
}

module.exports = [thunk, multi, log]
