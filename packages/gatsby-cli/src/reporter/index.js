// @flow

const semver = require(`semver`)
const { isCI } = require(`ci-info`)
const reporterActions = require(`./redux/actions`)

let inkExists = false
try {
  inkExists = require.resolve(`ink`)
  // eslint-disable-next-line no-empty
} catch (err) {}

if (!process.env.gatsby_logger) {
  // process.env.gatsby_logger = `yurnalist`
  if (inkExists && semver.satisfies(process.version, `>=8`) && !isCI) {
    process.env.gatsby_logger = `ink`
  } else {
    process.env.gatsby_logger = `yurnalist`
  }
}
// if child process - use ipc logger
if (process.send) {
  // process.env.FORCE_COLOR = `0`

  require(`./loggers/ipc`)
}

if (process.env.gatsby_logger.includes(`json`)) {
  require(`./loggers/json`)
} else if (process.env.gatsby_logger.includes(`yurnalist`)) {
  require(`./loggers/yurnalist`)
} else {
  require(`./loggers/ink`)
}

const util = require(`util`)
const { stripIndent } = require(`common-tags`)
const chalk = require(`chalk`)
const { trackError } = require(`gatsby-telemetry`)
const tracer = require(`opentracing`).globalTracer()
// const convertHrtime = require(`convert-hrtime`)

const { getErrorFormatter } = require(`./errors`)
const { /*dispatch,*/ getStore } = require(`./redux`)
const constructError = require(`../structured-errors/construct-error`)

// const getElapsedTimeMS = activity => {
//   const elapsed = process.hrtime(activity.startTime)
//   return convertHrtime(elapsed)[`seconds`].toFixed(3)
// }

// const getActivity = name => getStore().getState().logs.activities[name]

const errorFormatter = getErrorFormatter()
// const { trackCli } = require(`gatsby-telemetry`)

// const convertHrtime = require(`convert-hrtime`)

import type { ActivityTracker, ActivityArgs, Reporter } from "./types"

const addMessage = level => text => reporterActions.createLog({ level, text })

let isVerbose = false

const prematureEnd = () => {
  const { activities } = getStore().getState().logs
  Object.keys(activities).forEach(activityId => {
    const activity = activities[activityId]
    if (
      activity.status === `IN_PROGRESS` ||
      activity.status === `NOT_STARTED`
    ) {
      reporter.completeActivity(activityId, `INTERRUPTED`)
      // process.stdout.write(`INTERRUPTING ${activityId}\n`)
    }
  })
  // process.stdout.write(`EXITING wat\n`)
  process.exit(1)
}

/**
 * Reporter module.
 * @module reporter
 */
const reporter: Reporter = {
  /**
   * Strip initial indentation template function.
   */
  stripIndent,
  format: chalk,
  /**
   * Toggle verbosity.
   * @param {boolean} [isVerbose=true]
   */
  setVerbose: (_isVerbose = true) => {
    isVerbose = _isVerbose
  },
  /**
   * Turn off colors in error output.
   * @param {boolean} [isNoColor=false]
   */
  setNoColor(isNoColor = false) {
    // reporterInstance.setColors(isNoColor)

    if (isNoColor) {
      errorFormatter.withoutColors()
    }

    // disables colors in popular terminal output coloring packages
    //  - chalk: see https://www.npmjs.com/package/chalk#chalksupportscolor
    //  - ansi-colors: see https://github.com/doowb/ansi-colors/blob/8024126c7115a0efb25a9a0e87bc5e29fd66831f/index.js#L5-L7
    if (isNoColor) {
      process.env.FORCE_COLOR = `0`
    }
  },
  /**
   * Log arguments and exit process with status 1.
   * @param {*} args
   */
  panic(...args) {
    const error = this.error(...args)
    trackError(`GENERAL_PANIC`, { error })
    prematureEnd()
  },

  panicOnBuild(...args) {
    const error = this.error(...args)
    trackError(`BUILD_PANIC`, { error })
    if (process.env.gatsby_executing_command === `build`) {
      prematureEnd()
    }
  },

  error(errorMeta, error) {
    let details = {}
    // Many paths to retain backcompat :scream:
    if (arguments.length === 2) {
      if (Array.isArray(error)) {
        return error.map(errorItem => this.error(errorMeta, errorItem))
      }
      details.error = error
      details.context = {
        sourceMessage: errorMeta + ` ` + error.message,
      }
    } else if (arguments.length === 1 && errorMeta instanceof Error) {
      details.error = errorMeta
      details.context = {
        sourceMessage: errorMeta.message,
      }
    } else if (arguments.length === 1 && Array.isArray(errorMeta)) {
      // when we get an array of messages, call this function once for each error
      return errorMeta.map(errorItem => this.error(errorItem))
    } else if (arguments.length === 1 && typeof errorMeta === `object`) {
      details = Object.assign({}, errorMeta)
    } else if (arguments.length === 1 && typeof errorMeta === `string`) {
      details.context = {
        sourceMessage: errorMeta,
      }
    }

    if (error) this.log(errorFormatter.render(error))
    const structuredError = constructError({ details })
    if (structuredError) {
      reporterActions.createLog(structuredError)
    }

    // TODO: remove this once Error component can render this info
    // log formatted stacktrace
    if (structuredError.error) {
      this.log(errorFormatter.render(structuredError.error))
    }
    return structuredError
  },

  /**
   * Set prefix on uptime.
   * @param {string} prefix - A string to prefix uptime with.
   */
  uptime(prefix) {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  },

  // statefulMessage(payload) {
  //   const error = constructError({ details: payload })
  //   reporterActions.createStatefulLog(error)
  //   // dispatch({
  //   //   type: `STATEFUL_LOG`,
  //   //   payload: error,
  //   // })
  //   if (error.panicOnBuild) {
  //     trackError(`BUILD_PANIC`, { error })
  //     if (process.env.gatsby_executing_command === `build`) {
  //       prematureEnd()
  //     }
  //   }
  // },

  // clearStatefulMessage: reporterActions.clearStatefulLogs,

  // clearStatefulMessage(group) {
  //   reporterActions.clearStatefulLogs(group)
  //   // dispatch({
  //   //   type: `CLEAR_STATEFUL_LOG`,
  //   //   payload,
  //   // })
  // },

  verbose: text => {
    if (isVerbose) {
      reporterActions.createLog({
        level: `DEBUG`,
        text,
      })
      // dispatch({
      //   type: `LOG`,
      //   payload: {
      //     level: `DEBUG`,
      //     text,
      //   },
      // })
    }
  },

  success: addMessage(`SUCCESS`),
  info: addMessage(`INFO`),
  warn: addMessage(`WARNING`),
  log: addMessage(`LOG`),

  // pendingActivity(id: string) {
  //   reporterActions.createPendingActivity(id)

  //   // dispatch({
  //   //   type: `STRUCTURED_ACTIVITY_START`,
  //   //   payload: {
  //   //     id,
  //   //     name: id,
  //   //     type: `pending`,
  //   //     state: `NOT_STARTED`,
  //   //     dontShowSuccess: true,
  //   //   },
  //   // })
  // },
  pendingActivity: reporterActions.createPendingActivity,
  // pendingActivity: (id: string) => {
  //   reporterActions.startActivity({
  //     id,
  //     status: `NOT_STARTED`,
  //     type: `pending`,
  //     dontShowSuccess: true,
  //   })
  // },
  completeActivity: (id: string, status: string = `SUCCESS`) => {
    reporterActions.endActivity({ id, status })
    // dispatch({
    //   type: `STRUCTURED_ACTIVITY_END`,
    //   payload: {
    //     id,
    //     state,
    //     // elapsedTime: (duration / 1000).toFixed(3),
    //   },
    // })
  },
  // completeActivity: reporterActions.completeActivity,

  // completeActivity: (id: string, state: string = `SUCCESS`) {
  //   dispatch({
  //     type: `STRUCTURED_ACTIVITY_END`,
  //     payload: {
  //       id,
  //       state,
  //       // elapsedTime: (duration / 1000).toFixed(3),
  //     },
  //   })

  // dispatch({
  //   type: `STRUCTURED_ACTIVITY_START`,
  //   payload: {
  //     id,
  //     name: id,
  //     type: `pending`,
  //     state: `NOT_STARTED`,
  //     dontShowSuccess: true,
  //   },
  // })
  // },

  /**
   * Time an activity.
   * @param {string} name - Name of activity.
   * @param {ActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  activityTimer(
    text: string,
    activityArgs: ActivityArgs = {}
  ): ActivityTracker {
    let { parentSpan, dontShowSuccess, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return {
      start: () => {
        reporterActions.startActivity({
          id,
          text,
          type: `spinner`,
          dontShowSuccess,
        })

        // dispatch({
        //   type: `STRUCTURED_ACTIVITY_START`,
        //   payload: {
        //     id,
        //     name,
        //     type: `spinner`,
        //     dontShowSuccess,
        //   },
        // })
      },
      setStatus: statusText => {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
        // dispatch({
        //   type: `STRUCTURED_ACTIVITY_UPDATE`,
        //   payload: {
        //     id,
        //     name,
        //     status,
        //   },
        // })
      },
      end(success = true) {
        span.finish()

        reporterActions.endActivity({
          id,
          status: success ? `SUCCESS` : `FAILED`,
        })

        // let activity = getActivity(id)
        // if (activity) {
        //   const duration = getElapsedTimeMS(activity)

        //   trackCli(`ACTIVITY_DURATION`, {
        //     name: name,
        //     duration,
        //   })

        //   dispatch({
        //     type: `STRUCTURED_ACTIVITY_END`,
        //     payload: {
        //       state: success ? `SUCCESS` : `FAILED`,
        //       id,
        //       elapsedTime: (duration / 1000).toFixed(3),
        //     },
        //   })
        // }
      },
      span,
    }
  },

  /**
   * Create a progress bar for an activity
   * @param {string} name - Name of activity.
   * @param {number} total - Total items to be processed.
   * @param {number} start - Start count to show.
   * @param {ActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  createProgress(
    text: string,
    total = 0,
    start = 0,
    activityArgs: ActivityArgs = {}
  ): ActivityTracker {
    let { parentSpan, dontShowSuccess, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }
    const span = tracer.startSpan(text, spanArgs)
    // let hasStarted = false

    return {
      start: () => {
        reporterActions.startActivity({
          id,
          text,
          type: `progress`,
          dontShowSuccess,
          current: start,
          total,
        })

        // if (hasStarted) {
        //   return
        // }

        // hasStarted = true

        // dispatch({
        //   type: `STRUCTURED_ACTIVITY_START`,
        //   payload: {
        //     id,
        //     name,
        //     type: `progress`,
        //     current: start,
        //     total,
        //     dontShowSuccess,
        //   },
        // })
      },
      setStatus: statusText => {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
        // dispatch({
        //   type: `STRUCTURED_ACTIVITY_UPDATE`,
        //   payload: {
        //     id,
        //     status,
        //   },
        // })
      },
      tick: (increment = 1) => {
        reporterActions.activityTick({ id, increment })
        // dispatch({
        //   type: `STRUCTURED_ACTIVITY_TICK`,
        //   payload: {
        //     id,
        //     increment,
        //   },
        // })
      },
      done: (success = true) => {
        span.finish()
        reporterActions.endActivity({
          id,
          status: success ? `SUCCESS` : `FAILED`,
        })

        // let activity = getActivity(id)
        // if (activity) {
        //   const duration = getElapsedTimeMS(activity)
        //   dispatch({
        //     type: `STRUCTURED_ACTIVITY_END`,
        //     payload: {
        //       state: success ? `SUCCESS` : `FAILED`,
        //       id,
        //       elapsedTime: (duration / 1000).toFixed(3),
        //     },
        //   })
        // }
      },
      set total(value) {
        reporterActions.setActivityTotal({ id, total: value })
        // dispatch({
        //   type: `STRUCTURED_ACTIVITY_UPDATE`,
        //   payload: {
        //     id,
        //     total: value,
        //   },
        // })
      },
      span,
    }
  },
}

console.log = (...args) => reporter.log(util.format(...args))
console.warn = (...args) => reporter.log(util.format(...args))
console.info = (...args) => reporter.log(util.format(...args))
console.error = (...args) => reporter.log(util.format(...args))

module.exports = reporter
