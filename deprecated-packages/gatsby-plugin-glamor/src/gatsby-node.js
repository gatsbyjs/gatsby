// Add Glamor support
exports.onCreateWebpackConfig = ({ actions, plugins }) =>
  actions.setWebpackConfig({
    plugins: [
      plugins.provide({
        Glamor: `glamor/react`,
      }),
    ],
  })

// Add Glamor babel plugin
exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: require.resolve(`glamor/babel-hoist`),
  })
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-react`),
    options: {
      pragma: `Glamor.createElement`,
    },
  })
}

exports.pluginOptionsSchema = ({ Joi }) => Joi.object({})
