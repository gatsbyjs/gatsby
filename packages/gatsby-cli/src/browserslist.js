const browserslist = require(`browserslist/node`)
const _ = require(`lodash`)

module.exports = function getBrowsersList(directory, fallback) {
  return _.get(browserslist.findConfig(directory), `defaults`, fallback)
}
