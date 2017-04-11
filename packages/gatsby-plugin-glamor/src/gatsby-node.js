const webpack = require("webpack")

// Add Glamor support
exports.modifyWebpackConfig = ({ config }) => {
  return config.plugin(`Glamor`, webpack.ProvidePlugin, [
    {
      Glamor: `glamor-react`,
    },
  ])
}

// Add Glamor support
exports.modifyBabelrc = ({ babelrc }) => {
  babelrc.plugins.push([
    `transform-react-jsx`,
    { pragma: `Glamor.createElement` },
  ])
  babelrc.plugins.push(`babel-plugin-glamor`)

  return babelrc
}
