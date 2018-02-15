// @flow

const { createReporter } = require(`yurnalist`)
const { stripIndent } = require(`common-tags`)
const convertHrtime = require(`convert-hrtime`)
const { getErrorFormatter } = require(`./errors`)

const VERBOSE = process.env.gatsby_log_level === `verbose`

const errorFormatter = getErrorFormatter()
const reporter = createReporter({ emoji: true, verbose: VERBOSE })
const base = Object.getPrototypeOf(reporter)

module.exports = Object.assign(reporter, {
  stripIndent,

  setVerbose(isVerbose = true) {
    this.isVerbose = !!isVerbose
  },
  setNoColor(isNoColor = false) {
    if (isNoColor) {
      errorFormatter.withoutColors()
    }
  },
  panic(...args) {
    this.error(...args)
    process.exit(1)
  },

  panicOnBuild(...args) {
    this.error(...args)
    if (process.env.gatsby_executing_command !== `build`) {
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

  uptime(prefix: string) {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  },

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
