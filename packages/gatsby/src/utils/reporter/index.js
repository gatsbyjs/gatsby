// @flow

const { createReporter } = require(`yurnalist`)
const { stripIndent } = require(`common-tags`)
const convertHrtime = require(`convert-hrtime`)
const { getErrorFormatter } = require(`./errors`)

const errorFormatter = getErrorFormatter()
const reporter = createReporter({ emoji: true })
const base = Object.getPrototypeOf(reporter)

module.exports = Object.assign(reporter, {
  stripIndent,

  setVerbose(isVerbose) {
    this.isVerbose = true
  },

  panic(...args) {
    this.error(...args)
    process.exit(1)
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
