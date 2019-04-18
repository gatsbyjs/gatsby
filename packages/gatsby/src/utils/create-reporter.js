const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)
const { stripIndent } = require(`common-tags`)
const chalk = require(`chalk`)

const { log } = actions

// Create a proxy for the existing reporter.

const reporter = [
  `success`,
  `info`,
  `log`,
  `error`,
  `warn`,
  `panic`,
  `panicOnBuild`,
  `activityTimer`,
].reduce((acc, type) => {
  acc[type] = message => store.dispatch(log({ message, type }))
  return acc
}, {})

reporter.stripIndent = stripIndent
reporter.format = chalk

module.exports = reporter
