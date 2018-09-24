exports.onCreateBabelConfig = ({ actions }, pluginOptions) => {
  const isDevelopment = process.env.NODE_ENV !== `production`
  const longNames = `[name]--[local]--[hash:base64:5]`
  const shortNames = `[hash:base64:5]`
  const minifyClassNames = pluginOptions.minifyClassNames || false

  delete pluginOptions.minifyClassNames
  //Let's delete minifyClassNames option as it is not needed by babel-plugin-react-css-modules

  actions.setBabelPlugin({
    name: `babel-plugin-react-css-modules`,
    options: {
      generateScopedName: isDevelopment ? longNames : (minifyClassNames ? shortNames : longNames) ,
      webpackHotModuleReloading: process.env.NODE_ENV !== `production`,
      ...pluginOptions,
    },
  })
}
