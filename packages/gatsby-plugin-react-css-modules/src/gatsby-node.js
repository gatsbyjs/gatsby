exports.onCreateBabelConfig = ({ actions }, pluginOptions) => {
  const isDevelopment = process.env.NODE_ENV !== `production`

  if (pluginOptions.plugins) {
    delete pluginOptions.plugins
  }

  actions.setBabelPlugin({
    name: `babel-plugin-react-css-modules`,
    options: {
      generateScopedName: isDevelopment
        ? `[name]--[local]--[hash:base64:5]`
        : `[hash:base64:5]`,
      webpackHotModuleReloading: process.env.NODE_ENV !== `production`,
      ...pluginOptions,
    },
  })
}
