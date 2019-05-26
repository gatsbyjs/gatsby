const semver = require(`semver`)
const { isCI } = require(`ci-info`)

if (semver.satisfies(process.version, `>=8`) && !isCI) {
  module.exports = require(`./ink`).default
} else {
  module.exports = require(`./yurnalist`)
}
