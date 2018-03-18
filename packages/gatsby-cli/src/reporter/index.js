// @flow

const { createReporter } = require(`yurnalist`)
const { stripIndent } = require(`common-tags`)
const convertHrtime = require(`convert-hrtime`)
const { getErrorFormatter } = require(`./errors`)

const VERBOSE = process.env.gatsby_log_level === `verbose`

const errorFormatter = getErrorFormatter()
const reporter = createReporter({ emoji: true, verbose: VERBOSE })
const base = Object.getPrototypeOf(reporter)

/* Reporter module.
 * @module reporter
 */

module.exports = Object.assign(reporter, {
  /**
   * Strip initial indentation template function.
   */
  stripIndent,
  /**
   * Toggle verbosity.
   * @param {boolean} [isVerbose=true]
   */
  setVerbose(isVerbose = true) {
    this.isVerbose = !!isVerbose
  },
  /**
   * Turn off colors in error output.
   * @param {boolean} [isNoColor=false]
   */
  setNoColor(isNoColor = false) {
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
    process.exit(1)
  },
  /**
   * Log error messages to console.
   * If one argument is passed it is assumed to be an Error object.
   * @param {object|string} message - A message string or Error object.
   * @param {object} error - Error object.
   */
  error(message, error) {
    if (arguments.length === 1 && typeof message !== `string`) {
      error = message
      message = error.message
    }
    base.error.call(this, message)
    if (error) console.log(errorFormatter.render(error))
  },
  /**
   * Set prefix on uptime.
   * @param {string} prefix - A string to prefix uptime with.
   */
  uptime(prefix: string) {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  },
  /**
   * Time an activity.
   * @param {string} name - Name of activity.
   * @returns {string} The elapsed time of activity.
   */
  activityTimer(name) {
    const spinner = reporter.activity()
    const start = process.hrtime()

    const elapsedTime = () => {
      var elapsed = process.hrtime(start)
      return `${convertHrtime(elapsed)[`seconds`].toFixed(3)} s`
    }

    return {
      start: () => {
        spinner.tick(name)
      },
      end: () => {
        reporter.success(`${name} — ${elapsedTime()}`)
        spinner.end()
      },
    }
  },
})
