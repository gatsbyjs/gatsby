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
    name: `glamor/babel-hoist`,
  })
  actions.setBabelPreset({
    name: `@babel/preset-react`,
    options: {
      pragma: `Glamor.createElement`,
    },
  })
}
