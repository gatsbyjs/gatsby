const semver = require(`semver`)

if (semver.satisfies(process.version, `>=8`)) {
  console.info(`loading ink =====================`)
  module.exports = require(`./yurnalist`)
} else {
  module.exports = require(`./yurnalist`)
}
