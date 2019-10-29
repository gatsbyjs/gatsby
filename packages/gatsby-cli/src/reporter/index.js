// @flow

const semver = require(`semver`)
const { isCI } = require(`gatsby-core-utils`)
const signalExit = require(`signal-exit`)
const reporterActions = require(`./redux/actions`)

const { LogLevels, ActivityStatuses, ActivityTypes } = require(`./constants`)

let inkExists = false
try {
  inkExists = require.resolve(`ink`)
  // eslint-disable-next-line no-empty
} catch (err) {}

if (!process.env.GATSBY_LOGGER) {
  if (
    inkExists &&
    semver.satisfies(process.version, `>=8`) &&
    !isCI() &&
    typeof jest === `undefined`
  ) {
    process.env.GATSBY_LOGGER = `ink`
  } else {
    process.env.GATSBY_LOGGER = `yurnalist`
  }
}
// if child process - use ipc logger
if (process.send) {
  // process.env.FORCE_COLOR = `0`

  require(`./loggers/ipc`)
}

if (process.env.GATSBY_LOGGER.includes(`json`)) {
  require(`./loggers/json`)
} else if (process.env.GATSBY_LOGGER.includes(`yurnalist`)) {
  require(`./loggers/yurnalist`)
} else {
  require(`./loggers/ink`)
}

const util = require(`util`)
const { stripIndent } = require(`common-tags`)
const chalk = require(`chalk`)
const { trackError } = require(`gatsby-telemetry`)
const tracer = require(`opentracing`).globalTracer()

const { getErrorFormatter } = require(`./errors`)
const { getStore } = require(`./redux`)
const constructError = require(`../structured-errors/construct-error`)

const errorFormatter = getErrorFormatter()

import type { ActivityTracker, ActivityArgs, Reporter } from "./types"

const addMessage = level => text => reporterActions.createLog({ level, text })

let isVerbose = false

const interuptActivities = () => {
  const { activities } = getStore().getState().logs
  Object.keys(activities).forEach(activityId => {
    const activity = activities[activityId]
    if (
      activity.status === ActivityStatuses.InProgress ||
      activity.status === ActivityStatuses.NotStarted
    ) {
      reporter.completeActivity(activityId, ActivityStatuses.Interrupted)
    }
  })
}

const prematureEnd = () => {
  // hack so at least one activity is surely failed, so
  // we are guaranteed to generate FAILED status
  // if none of activity did explicitly fail
  reporterActions.createPendingActivity({
    id: `panic`,
    status: ActivityStatuses.Failed,
  })

  interuptActivities()
}

signalExit((code, signal) => {
  if (code !== 0 && signal !== `SIGINT` && signal !== `SIGTERM`) prematureEnd()
  else interuptActivities()
})

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
    if (isNoColor) {
      errorFormatter.withoutColors()
    }

    // disables colors in popular terminal output coloring packages
    //  - chalk: see https://www.npmjs.com/package/chalk#chalksupportscolor
    //  - ansi-colors: see https://github.com/doowb/ansi-colors/blob/8024126c7115a0efb25a9a0e87bc5e29fd66831f/index.js#L5-L7
    if (isNoColor) {
      process.env.FORCE_COLOR = `0`
      // chalk determines color level at import time. Before we reach this point,
      // chalk was already imported, so we need to retroactively adjust level
      chalk.level = 0
    }
  },
  /**
   * Log arguments and exit process with status 1.
   * @param {*} args
   */
  panic(...args) {
    const error = reporter.error(...args)
    trackError(`GENERAL_PANIC`, { error })
    prematureEnd()
    process.exit(1)
  },

  panicOnBuild(...args) {
    const error = reporter.error(...args)
    trackError(`BUILD_PANIC`, { error })
    if (process.env.gatsby_executing_command === `build`) {
      prematureEnd()
      process.exit(1)
    }
    return error
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

  verbose: text => {
    if (isVerbose) {
      reporterActions.createLog({
        level: LogLevels.Debug,
        text,
      })
    }
  },

  success: addMessage(LogLevels.Success),
  info: addMessage(LogLevels.Info),
  warn: addMessage(LogLevels.Warning),
  log: addMessage(LogLevels.Log),

  pendingActivity: reporterActions.createPendingActivity,

  completeActivity: (id: string, status: string = ActivityStatuses.Success) => {
    reporterActions.endActivity({ id, status })
  },

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
    let { parentSpan, id } = activityArgs
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
          type: ActivityTypes.Spinner,
        })
      },
      setStatus: statusText => {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
      },
      panicOnBuild(...args) {
        span.finish()

        reporterActions.setActivityErrored({
          id,
        })

        return reporter.panicOnBuild(...args)
      },
      panic(...args) {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Failed,
        })

        return reporter.panic(...args)
      },
      end() {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      span,
    }
  },

  /**
   * Create an Activity that is not visible to the user
   *
   * During the lifecycle of the Gatsby process, sometimes we need to do some
   * async work and wait for it to complete. A typical example of this is a job.
   * This work should set the status of the process to `in progress` while running and
   * `complete` (or `failure`) when complete. Activities do just this! However, they
   * are visible to the user. So this function can be used to create a _hidden_ activity
   * that while not displayed in the CLI, still triggers a change in process status.
   *
   * @param {string} name - Name of activity.
   * @param {ActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  phantomActivity(
    text: string,
    activityArgs: ActivityArgs = {}
  ): ActivityTracker {
    let { parentSpan, id } = activityArgs
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
          type: ActivityTypes.Hidden,
        })
      },
      end() {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
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
    let { parentSpan, id } = activityArgs
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
          type: ActivityTypes.Progress,
          current: start,
          total,
        })
      },
      setStatus: statusText => {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
      },
      tick: (increment = 1) => {
        reporterActions.activityTick({ id, increment })
      },
      panicOnBuild(...args) {
        span.finish()

        reporterActions.setActivityErrored({
          id,
        })

        return reporter.panicOnBuild(...args)
      },
      panic(...args) {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Failed,
        })

        return reporter.panic(...args)
      },
      done: () => {
        span.finish()
        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      set total(value) {
        reporterActions.setActivityTotal({ id, total: value })
      },
      span,
    }
  },
  // This method was called in older versions of gatsby, so we need to keep it to avoid
  // "reporter._setStage is not a function" error when gatsby@<2.16 is used with gatsby-cli@>=2.8
  _setStage() {},
}

console.log = (...args) => reporter.log(util.format(...args))
console.warn = (...args) => reporter.warn(util.format(...args))
console.info = (...args) => reporter.info(util.format(...args))
console.error = (...args) => reporter.error(util.format(...args))

module.exports = reporter
