const { setBoundActionCreators } = require(`./index`)

exports.onPreInit = ({ actions }) => {
  setBoundActionCreators(actions)
}

// TODO
// exports.formatJobMessage = jobs => {
// return {
// progress: 40,
// message: `3/4`,
// }
// }
