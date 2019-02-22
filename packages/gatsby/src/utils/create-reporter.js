const uuid = require(`uuid/v4`)
const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)

const { log } = actions
const { dispatch } = store

// Create a proxy for the existing reporter that sends messages into the redux
// store

const reporter = {
  success: message => dispatch(log({ message, level: `success` })),
  info: message => dispatch(log({ message, level: `info` })),
  log: message => dispatch(log({ message, level: `log` })),
  error: message => dispatch(log({ message, level: `error` })),
  warn: message => dispatch(log({ message, level: `warn` })),
  panic: message => dispatch(log({ message, level: `panic` })),
  panicOnBuild: message => dispatch(log({ message, level: `panicOnBuild` })),
  activityTimer: message => {
    let id = null
    return {
      start: () => {
        id = uuid()(
          dispatch(
            log({
              message,
              level: `activityTimerStart`,
              id,
            })
          )
        )
      },
      end: () => {
        dispatch(log({ message, level: `activityTimerEnd`, id }))
      },
    }
  },
}

module.exports = reporter
