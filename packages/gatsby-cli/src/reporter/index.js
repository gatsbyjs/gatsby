// @flow
const util = require(`util`)
const { stripIndent } = require(`common-tags`)
const chalk = require(`chalk`)
const { trackError } = require(`gatsby-telemetry`)
const tracer = require(`opentracing`).globalTracer()
const { getErrorFormatter } = require(`./errors`)
const reporterInstance = require(`./reporters`)

const errorFormatter = getErrorFormatter()

import type { ActivityTracker, ActivityArgs, Reporter } from "./types"

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
  setVerbose: (isVerbose = true) => reporterInstance.setVerbose(isVerbose),
  /**
   * Turn off colors in error output.
   * @param {boolean} [isNoColor=false]
   */
  setNoColor(isNoColor = false) {
    reporterInstance.setColors(isNoColor)

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

    reporterInstance.error(message)
    if (error) this.log(errorFormatter.render(error))
  },
  /**
   * Set prefix on uptime.
   * @param {string} prefix - A string to prefix uptime with.
   */
  uptime(prefix) {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  },

  success: reporterInstance.success,
  verbose: reporterInstance.verbose,
  info: reporterInstance.info,
  warn: reporterInstance.warn,
  log: reporterInstance.log,

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

    const activity = reporterInstance.createActivity({
      type: `spinner`,
      id: name,
      status: ``,
    })

    return {
      start() {
        activity.update({
          startTime: process.hrtime(),
        })
      },
      setStatus(status) {
        activity.update({
          status: status,
        })
      },
      end() {
        span.finish()
        activity.done()
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
    let current = start
    const activity = reporterInstance.createActivity({
      type: `progress`,
      id: name,
      current,
      total,
    })

    return {
      start() {
        if (hasStarted) {
          return
        }

        hasStarted = true
        activity.update({
          startTime: process.hrtime(),
        })
      },
      setStatus(status) {
        activity.update({
          status: status,
        })
      },
      tick() {
        activity.update({
          current: ++current,
        })
      },
      done() {
        span.finish()
        activity.done()
      },
      set total(value) {
        total = value
        activity.update({
          total: value,
        })
      },
      span,
    }
  },
  // Make private as we'll probably remove this in a future refactor.
  _setStage(stage) {
    if (reporterInstance.setStage) {
      reporterInstance.setStage(stage)
    }
  },
}

console.log = (...args) => reporter.log(util.format(...args))
console.warn = (...args) => reporter.log(util.format(...args))
console.info = (...args) => reporter.log(util.format(...args))
console.error = (...args) => reporter.log(util.format(...args))

module.exports = reporter
