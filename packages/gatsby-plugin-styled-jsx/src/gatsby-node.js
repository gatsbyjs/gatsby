// Add babel plugin
exports.onCreateBabelConfig = ({ actions }, pluginOptions) => {
  const {
    jsxPlugins: plugins,
    optimizeForSpeed,
    sourceMaps,
    vendorPrefixes,
  } = pluginOptions

  actions.setBabelPlugin({
    name: `styled-jsx/babel`,
    options: {
      optimizeForSpeed,
      sourceMaps,
      vendorPrefixes,
      ...(plugins ? { plugins } : {}),
    },
  })
}
