// @flow

const semver = require(`semver`)
const { isCI } = require(`ci-info`)

let inkExists = false
try {
  inkExists = require.resolve(`ink`)
  // eslint-disable-next-line no-empty
} catch (err) {}

if (!process.env.gatsby_logger) {
  if (inkExists && semver.satisfies(process.version, `>=8`) && !isCI) {
    process.env.gatsby_logger = `ink`
  } else {
    process.env.gatsby_logger = `yurnalist`
  }
}
// inject logger
if (process.env.gatsby_logger === `json`) {
  // implied no-colors
  process.env.FORCE_COLOR = `0`
  require(`./loggers/json`)
} else if (process.env.gatsby_logger === `yurnalist`) {
  require(`./loggers/yurnalist`)
} else {
  require(`./loggers/ink`)
}

const util = require(`util`)
const { stripIndent } = require(`common-tags`)
const chalk = require(`chalk`)
const { trackError } = require(`gatsby-telemetry`)
const tracer = require(`opentracing`).globalTracer()
const convertHrtime = require(`convert-hrtime`)

const { getErrorFormatter } = require(`./errors`)
const { dispatch, getStore } = require(`./redux`)

const getElapsedTime = activity => {
  const elapsed = process.hrtime(activity.startTime)
  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}

const getActivity = name => getStore().getState().logs.activities[name]

const errorFormatter = getErrorFormatter()

import type { ActivityTracker, ActivityArgs, Reporter } from "./types"

const addMessage = type => text =>
  dispatch({
    type: `STRUCTURED_LOG`,
    payload: {
      type,
      text,
    },
  })

const addError = addMessage(`error`)

let isVerbose = false

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
  },
  /**
   * Log arguments and exit process with status 1.
   * @param {*} args
   */
  panic(...args) {
    this.error(...args)
    trackError(`GENERAL_PANIC`, { error: args })
    process.exit(1)
  },

  panicOnBuild(...args) {
    const [message, error] = args
    this.error(message, error)
    trackError(`BUILD_PANIC`, { error: args })
    if (process.env.gatsby_executing_command === `build`) {
      process.exit(1)
    }
  },

  error(message, error) {
    if (arguments.length === 1 && typeof message !== `string`) {
      error = message
      message = error.message
    }

    addError(message)
    if (error) this.log(errorFormatter.render(error))
  },
  /**
   * Set prefix on uptime.
   * @param {string} prefix - A string to prefix uptime with.
   */
  uptime(prefix) {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  },

  statefulMessage(payload) {
    dispatch({
      type: `STATEFUL_LOG`,
      payload,
    })
  },

  clearStatefulMessage(payload) {
    dispatch({
      type: `CLEAR_STATEFUL_LOG`,
      payload,
    })
  },

  // stateUpdate(update) {
  //   dispatch({
  //     type: `STATE_UPDATE`,
  //     payload: update,
  //   })
  // },

  verbose: text => {
    if (isVerbose) {
      dispatch({
        type: `STRUCTURED_LOG`,
        payload: {
          type: `verbose`,
          text,
        },
      })
    }
  },

  success: addMessage(`success`),
  info: addMessage(`info`),
  warn: addMessage(`warn`),
  log: addMessage(`log`),

  /**
   * Time an activity.
   * @param {string} name - Name of activity.
   * @param {ActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  activityTimer(
    name: string,
    activityArgs: ActivityArgs = {}
  ): ActivityTracker {
    const { parentSpan } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    const span = tracer.startSpan(name, spanArgs)

    return {
      start: () => {
        dispatch({
          type: `STRUCTURED_ACTIVITY_START`,
          payload: {
            name,
            type: `spinner`,
          },
        })
      },
      setStatus: status => {
        dispatch({
          type: `STRUCTURED_ACTIVITY_UPDATE`,
          payload: {
            name,
            status,
          },
        })
      },
      end: () => {
        span.finish()

        let activity = getActivity(name)
        if (activity) {
          const elapsedTime = getElapsedTime(activity)
          dispatch({
            type: `STRUCTURED_ACTIVITY_END`,
            payload: {
              ...activity,
              name,
              elapsedTime,
            },
          })
        }
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
    name: string,
    total,
    start = 0,
    activityArgs: ActivityArgs = {}
  ): ActivityTracker {
    const { parentSpan } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    const span = tracer.startSpan(name, spanArgs)
    let hasStarted = false

    return {
      start: () => {
        if (hasStarted) {
          return
        }

        hasStarted = true

        dispatch({
          type: `STRUCTURED_ACTIVITY_START`,
          payload: {
            name,
            type: `progress`,
            current: start,
            total,
          },
        })
      },
      setStatus: status => {
        dispatch({
          type: `STRUCTURED_ACTIVITY_UPDATE`,
          payload: {
            name,
            status,
          },
        })
      },
      tick: () => {
        dispatch({
          type: `STRUCTURED_ACTIVITY_TICK`,
          payload: {
            name,
          },
        })
      },
      done: () => {
        span.finish()
        let activity = getActivity(name)
        if (activity) {
          const elapsedTime = getElapsedTime(activity)
          dispatch({
            type: `STRUCTURED_ACTIVITY_END`,
            payload: {
              ...activity,
              name,
              elapsedTime,
            },
          })
        }
      },
      set total(value) {
        dispatch({
          type: `STRUCTURED_ACTIVITY_UPDATE`,
          payload: {
            name,
            total: value,
          },
        })
      },
      span,
    }
  },
}

console.log = (...args) => reporter.log(util.format(...args))
console.warn = (...args) => reporter.warn(util.format(...args))
console.info = (...args) => reporter.info(util.format(...args))
console.error = (...args) => reporter.error(util.format(...args))

module.exports = reporter
