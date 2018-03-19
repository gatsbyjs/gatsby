/* eslint-env browser */

const Styletron = require(`styletron-engine-atomic`)
const createReactContext = require(`create-react-context`)
var instance

module.exports = function(options) {
  if (!instance) {
    if (typeof window !== `undefined` && window.document.createElement) {
      const styles = document.getElementsByClassName(`_styletron_hydrate_`)
      instance = new Styletron.Client({ hydrate: styles, ... options })
    } else {
      instance = new Styletron.Server(options)
    }
  }
  return createReactContext(instance)
}
