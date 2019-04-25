// @flow

const { createReporter } = require(`yurnalist`)
const convertHrtime = require(`convert-hrtime`)

const VERBOSE = process.env.gatsby_log_level === `verbose`
const reporter = createReporter({ emoji: true, verbose: VERBOSE })

/**
 * Reporter module.
 * @module reporter
 */
module.exports = {
  /**
   * Toggle verbosity.
   * @param {boolean} [isVerbose=true]
   */
  setVerbose(isVerbose = true) {
    reporter.isVerbose = !!isVerbose
  },
  /**
   * Turn off colors in error output.
   */
  setColors() {},

  success: reporter.success.bind(reporter),
  error: reporter.error.bind(reporter),
  verbose: reporter.verbose.bind(reporter),
  info: reporter.info.bind(reporter),
  warn: reporter.warn.bind(reporter),
  log: reporter.log.bind(reporter),
  /**
   * Time an activity.
   * @param {string} name - Name of activity.
   * @returns {string} The elapsed time of activity.
   */
  createActivity(name) {
    const spinner = reporter.activity()
    const start = process.hrtime()
    let status

    const elapsedTime = () => {
      var elapsed = process.hrtime(start)
      return `${convertHrtime(elapsed)[`seconds`].toFixed(3)} s`
    }

    return {
      start: () => {
        spinner.tick(name)
      },
      setStatus: s => {
        status = s
        spinner.tick(`${name} — ${status}`)
      },
      end: () => {
        const str = status
          ? `${name} — ${elapsedTime()} — ${status}`
          : `${name} — ${elapsedTime()}`
        reporter.success(str)
        spinner.end()
      },
    }
  },
}
