const {
  setBoundActionCreators,
  setFailures,
  setPluginOptions,
} = require(`./index`)

let failures = new Set()

exports.onPreInit = ({ actions }, pluginOptions) => {
  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)
  setFailures(failures)
}

exports.onPostBootstrap = () => {
  if (failures.size) {
    const all = Array.from(failures).join(`\n`)

    console.log(`===============`)
    console.log(JSON.stringify(all, null, 2))
    console.log(`===============`)
  }
}

// TODO
// exports.formatJobMessage = jobs => {
// return {
// progress: 40,
// message: `3/4`,
// }
// }
