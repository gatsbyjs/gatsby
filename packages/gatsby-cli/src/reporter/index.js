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
if (process.env.gatsby_logger && process.env.gatsby_logger.includes(`ipc`)) {
  // process.env.FORCE_COLOR = `0`
  require(`./loggers/ipc`)
}
if (process.env.gatsby_logger && process.env.gatsby_logger.includes(`json`)) {
  // implied no-colors
  // process.env.FORCE_COLOR = `0`
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
const constructError = require(`../structured-errors/construct-error`)

const getElapsedTimeMS = activity => {
  const elapsed = process.hrtime(activity.startTime)
  return convertHrtime(elapsed)[`seconds`].toFixed(3)
}

const getActivity = name => getStore().getState().logs.activities[name]

const errorFormatter = getErrorFormatter()
const { trackCli } = require(`gatsby-telemetry`)
// const convertHrtime = require(`convert-hrtime`)

import type { ActivityTracker, ActivityArgs, Reporter } from "./types"

const addMessage = level => text =>
  dispatch({
    type: `STRUCTURED_LOG`,
    payload: {
      level,
      text,
    },
  })

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
    const error = this.error(...args)
    trackError(`GENERAL_PANIC`, { error })
    process.exit(1)
  },

  panicOnBuild(...args) {
    const error = this.error(...args)
    trackError(`BUILD_PANIC`, { error })
    if (process.env.gatsby_executing_command === `build`) {
      process.exit(1)
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
      dispatch({
        type: `STRUCTURED_LOG`,
        payload: structuredError,
      })
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

  statefulMessage(payload) {
    const e = constructError({ details: payload })
    dispatch({
      type: `STATEFUL_LOG`,
      payload: e,
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
          level: `DEBUG`,
          text,
        },
      })
    }
  },

  success: addMessage(`SUCCESS`),
  info: addMessage(`INFO`),
  warn: addMessage(`WARNING`),
  log: addMessage(`LOG`),

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
    const { parentSpan, dontShowSuccess } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    const span = tracer.startSpan(name, spanArgs)
    let startTime = 0

    return {
      start: () => {
        dispatch({
          type: `STRUCTURED_ACTIVITY_START`,
          payload: {
            name,
            type: `spinner`,
            dontShowSuccess,
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
      end() {
        span.finish()

        let activity = getActivity(name)
        if (activity) {
          const duration = getElapsedTimeMS(activity)

          trackCli(`ACTIVITY_DURATION`, {
            name: name,
            duration,
          })

          dispatch({
            type: `STRUCTURED_ACTIVITY_END`,
            payload: {
              ...activity,
              name,
              elapsedTime: (duration / 1000).toFixed(3),
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
    total = 0,
    start = 0,
    activityArgs: ActivityArgs = {}
  ): ActivityTracker {
    const { parentSpan, dontShowSuccess } = activityArgs
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
            dontShowSuccess,
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
          const duration = getElapsedTimeMS(activity)
          dispatch({
            type: `STRUCTURED_ACTIVITY_END`,
            payload: {
              ...activity,
              name,
              elapsedTime: (duration / 1000).toFixed(3),
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
console.warn = (...args) => reporter.log(util.format(...args))
console.info = (...args) => reporter.log(util.format(...args))
console.error = (...args) => reporter.log(util.format(...args))

module.exports = reporter
