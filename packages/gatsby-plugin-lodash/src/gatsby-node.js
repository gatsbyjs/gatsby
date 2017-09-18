const webpackLodashPlugin = require(`lodash-webpack-plugin`)

// Add Lodash webpack plugin
exports.modifyWebpackConfig = ({ config, stage }) => {
  if (stage === `build-javascript`) {
    config.plugin(`Lodash`, webpackLodashPlugin, null)
  }

  return
}

// Add Lodash Babel plugin
exports.modifyBabelrc = ({ babelrc }) => {
  return {
    ...babelrc,
    plugins: babelrc.plugins.concat([`lodash`]),
  }
}
