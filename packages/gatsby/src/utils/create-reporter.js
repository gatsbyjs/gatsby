const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)

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

module.exports = reporter
