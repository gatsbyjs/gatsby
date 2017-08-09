// @flow
const PrettyError = require(`pretty-error`)
const { createReporter } = require(`yurnalist`)
const { stripIndent } = require(`common-tags`)
const convertHrtime = require(`convert-hrtime`)

const prettyError = new PrettyError()

prettyError.skipNodeFiles()
prettyError.skipPackage(`regenerator-runtime`, `graphql`, `core-js`)
prettyError.skip((traceLine, ln) => {
  if (traceLine && traceLine.file === `asyncToGenerator.js`) return true
  return false
})

prettyError.appendStyle({
  'pretty-error': {
    marginTop: 1,
  },
})


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
    if (error) console.log(prettyError.render(error))
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
