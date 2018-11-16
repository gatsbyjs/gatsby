const { setBoundActionCreators } = require('./index')

exports.preInit = ({ actions }) => {
  setBoundActionCreators(actions)
}

// TODO
// exports.formatJobMessage = jobs => {
// return {
// progress: 40,
// message: `3/4`,
// }
// }
