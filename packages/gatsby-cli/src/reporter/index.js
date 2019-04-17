// @flow

const { createReporter } = require(`yurnalist`)
const { stripIndent } = require(`common-tags`)
const convertHrtime = require(`convert-hrtime`)
const tracer = require(`opentracing`).globalTracer()
const { getErrorFormatter } = require(`./errors`)
const { trackError } = require(`gatsby-telemetry`)

const VERBOSE = process.env.gatsby_log_level === `verbose`

const errorFormatter = getErrorFormatter()
const reporter = createReporter({ emoji: true, verbose: VERBOSE })
const base = Object.getPrototypeOf(reporter)

type ActivityArgs = {
  parentSpan: Object,
}

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
   * @param {activityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {string} The elapsed time of activity.
   */
  activityTimer(name, activityArgs: ActivityArgs = {}) {
    const spinner = reporter.activity()
    const start = process.hrtime()
    let status

    const elapsedTime = () => {
      var elapsed = process.hrtime(start)
      return `${convertHrtime(elapsed)[`seconds`].toFixed(3)} s`
    }

    const { parentSpan } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    const span = tracer.startSpan(name, spanArgs)

    return {
      start: () => {
        spinner.tick(name)
      },
      setStatus: s => {
        status = s
        spinner.tick(`${name} — ${status}`)
      },
      end: () => {
        span.finish()
        const str = status
          ? `${name} — ${elapsedTime()} — ${status}`
          : `${name} — ${elapsedTime()}`
        reporter.success(str)
        spinner.end()
      },
      span: span,
    }
  },

  optionsSummary({ options, defaults = {}, errors = {} }) {
    // process data - for only simplest 1-level object
    const data = []
    const optionKeys = new Set(
      Object.keys(options)
        .concat(Object.keys(defaults))
        .concat(Object.keys(errors))
    )

    const head = [`Option name`, `Option value`]

    optionKeys.forEach(key => {
      if (key === `plugins`) {
        // skip plugins field automatically added by gatsby
        return
      }

      data.push([
        // option name
        key,

        // option value
        options[key] ? JSON.stringify(options[key]) : `Not defined`,

        // additional information
        errors[key] ||
          (options[key] === defaults[key] ? `(default value)` : ``),
      ])
    })

    base.table.call(this, head, data)
  },
})
