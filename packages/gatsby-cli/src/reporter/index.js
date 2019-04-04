// @flow

const util = require(`util`)
const { stripIndent } = require(`common-tags`)
const { trackError } = require(`gatsby-telemetry`)
const { getErrorFormatter } = require(`./errors`)
const inkReporter = require(`./ink`).default

const errorFormatter = getErrorFormatter()

type ActivityArgs = {
  parentSpan: Object,
}

/* Reporter module.
 * @module reporter
 */
const reporter = {
  /**
   * Strip initial indentation template function.
   */
  stripIndent,
  /**
   * Toggle verbosity.
   * @param {boolean} [isVerbose=true]
   */
  setVerbose: (...args) => inkReporter.setVerbose(...args),
  /**
   * Turn off colors in error output.
   * @param {boolean} [isNoColor=false]
   */
  setNoColor(isNoColor = false) {
    inkReporter.setColors(isNoColor)

    if (isNoColor) {
      errorFormatter.withoutColors()
    }
  },
  /**
   * Log arguments and exit process with status 1.
   * @param {*} [arguments]
   */
  panic(...args) {
    this.error(...args)
    trackError(`GENERAL_PANIC`, { error: args })
    process.exit(1)
  },

  panicOnBuild(...args) {
    this.error(...args)
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
    reporter.error.call(this, message)
    if (error) this.log(errorFormatter.render(error))
  },
  /**
   * Set prefix on uptime.
   * @param {string} prefix - A string to prefix uptime with.
   */
  uptime(prefix: string) {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  },
  success: (...args) => inkReporter.onSuccess(...args),
  verbose: (...args) => inkReporter.onVerbose(...args),
  info: (...args) => inkReporter.onInfo(...args),
  warn: (...args) => inkReporter.onWarn(...args),
  log: (...args) => inkReporter.onLog(...args),
  /**
   * Time an activity.
   * @param {string} name - Name of activity.
   * @param {activityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {string} The elapsed time of activity.
   */
  activityTimer(name, activityArgs: ActivityArgs = {}) {
    return inkReporter.createActivity(name, activityArgs)
  },
}

console.log = (...args) => reporter.log(util.format(...args))
console.warn = (...args) => reporter.warn(util.format(...args))
console.info = (...args) => reporter.info(util.format(...args))
console.error = (...args) => reporter.error(util.format(...args))

module.exports = reporter
