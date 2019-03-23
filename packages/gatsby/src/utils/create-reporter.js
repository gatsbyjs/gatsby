const uuid = require(`uuid/v4`)
const { boundActionCreators } = require(`../redux/actions`)
const logAction = boundActionCreators.log

// Create a proxy for the existing reporter that sends messages into the redux
// store

const reporter = {
  success: msg => logAction({ message: msg, type: `success` }),
  info: msg => logAction({ message: msg, type: `info` }),
  log: msg => logAction({ message: msg, type: `log` }),
  error: msg => logAction({ message: msg, type: `error` }),
  warn: msg => logAction({ message: msg, type: `warn` }),
  panic: msg => logAction({ message: msg, type: `panic` }),
  panicOnBuild: msg => logAction({ message: msg, type: `panicOnBuild` }),
  activityTimer: msg => {
    let id = null
    // I haven't tried this. It probably doesn't work!
    return {
      start: () => {
        id = uuid()
        logAction({
          message: msg,
          type: `activityTimerStart`,
          id,
        })
      },
      end: () => {
        logAction({ message: msg, type: `activityTimerEnd`, id })
      },
    }
  },
}

module.exports = reporter
