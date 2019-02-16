const multi = store => next => action =>
  Array.isArray(action)
    ? action.filter(Boolean).map(store.dispatch)
    : next(action)

const log = store => next => action => {
  if (action.type === `LOG_MESSAGE`) {
    const { log } = store.getState()
    return log(action.payload)
  }

  return next(action)
}

module.exports = [multi, log]
