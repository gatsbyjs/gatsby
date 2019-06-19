// @flow
const util = require(`util`)
const { stripIndent } = require(`common-tags`)
const chalk = require(`chalk`)
const { trackError } = require(`gatsby-telemetry`)
const tracer = require(`opentracing`).globalTracer()
const { getErrorFormatter } = require(`./errors`)
const reporterInstance = require(`./reporters`)
const stackTrace = require(`stack-trace`)
const { errorMap, defaultError } = require(`../util/error-map`)
const { errorSchema } = require(`../util/error-schema`)
const Joi = require(`joi`)
const errorFormatter = getErrorFormatter()
import { get } from "lodash"

import type { ActivityTracker, ActivityArgs, Reporter } from "./types"

// Merge partial error details with information from the errorMap
// Validate the constructed object against an error schema
const createRichError = params => {
  const { details } = params
  const result = (details.id && errorMap[details.id]) || defaultError

  // merge details and lookedup error
  const richError = {
    ...details,
    ...result,
    text: get(details, `text`) || result.text(details.context),
    stack: stackTrace.parse(details.error),
  }

  // validate against schema
  const { error } = Joi.validate(richError, errorSchema)
  if (error !== null) {
    // TODO: something better here
    console.log(`JOI ERROR VALIDATING ERROR SCHEMA ERROR!`)
    console.log(error)
    return false
  }

  return richError
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

  error(errorMeta, error) {
    let details

    // Three paths to retain backcompat
    // string and Error
    if (arguments.length === 2) {
      details.context.error = errorMeta
      details.text = errorMeta.message
      // just an Error
    } else if (arguments.length === 1 && errorMeta instanceof Error) {
      details.context.error = errorMeta
      details.text = error.message
      // object with partial error info
    } else if (arguments.length === 1 && typeof errorMeta === `object`) {
      details = Object.assign({}, errorMeta)
    }

    const richError = createRichError({ details })
    if (richError) reporterInstance.error(richError)

    // TODO: remove this once Error component can render this info
    // log formatted stacktrace
    if (richError.error) this.log(errorFormatter.render(richError.error))
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

    const activity = reporterInstance.createActivity(name)

    return {
      ...activity,
      end() {
        span.finish()
        activity.end()
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
