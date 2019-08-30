const merge = require(`webpack-merge`)

function copy(el) {
  return Array.isArray(el) ? [...el] : { ...el }
}

function deleteImportantConfigs(config) {
  const newConfig = copy(config)
  delete newConfig.entry
  delete newConfig.output
  delete newConfig.target
  delete newConfig.resolveLoaders
  return newConfig
}

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `SET_WEBPACK_CONFIG`: {
      let nextConfig = Array.isArray(action.payload)
        ? action.payload.map(deleteImportantConfigs)
        : deleteImportantConfigs(action.payload)

      return merge(state, nextConfig)
    }

    case `REPLACE_WEBPACK_CONFIG`:
      return copy(action.payload)

    default:
      return state
  }
}
