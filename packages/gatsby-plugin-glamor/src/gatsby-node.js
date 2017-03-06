const webpack = require("webpack")

// Add Glamor support
exports.modifyWebpackConfig = ({ args }) => {
  const { config } = args
  return config.plugin(`Glamor`, webpack.ProvidePlugin, [
    {
      Glamor: `glamor/react`,
    },
  ])
}

// Add Glamor support
exports.modifyBabelrc = ({ args }) => {
  const { babelrc } = args
  babelrc.plugins.push([
    `transform-react-jsx`,
    { pragma: `Glamor.createElement` },
  ])
  babelrc.plugins.push(`glamor/babel-hoist`)

  return babelrc
}
