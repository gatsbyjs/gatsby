const { setBoundActionCreators, setPluginOptions } = require(`./index`)

exports.onPreInit = ({ actions }, pluginOptions) => {
  setBoundActionCreators(actions)
  setPluginOptions(pluginOptions)
}

// TODO
// exports.formatJobMessage = jobs => {
// return {
// progress: 40,
// message: `3/4`,
// }
// }
