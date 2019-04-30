const semver = require(`semver`)

if (semver.satisfies(process.version, `>=8`)) {
  module.exports = require(`./ink`).default
} else {
  module.exports = require(`./yurnalist`)
}
