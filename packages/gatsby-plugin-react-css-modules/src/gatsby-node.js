exports.onCreateBabelConfig = ({ actions }, pluginOptions) => {
  if (pluginOptions.plugins) {
    delete pluginOptions.plugins
  }

  actions.setBabelPlugin({
    name: `babel-plugin-react-css-modules`,
    options: {
      generateScopedName: `[name]--[local]--[hash:base64:5]`,
      webpackHotModuleReloading: process.env.NODE_ENV !== `production`,
      ...pluginOptions,
    },
  })
}
