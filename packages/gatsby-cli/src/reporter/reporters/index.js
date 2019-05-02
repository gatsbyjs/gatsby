const semver = require(`semver`)

console.trace(`loading ink =====================`)
if (semver.satisfies(process.version, `>=8`)) {
  module.exports = require(`./ink`).default
} else {
  module.exports = require(`./yurnalist`)
}
