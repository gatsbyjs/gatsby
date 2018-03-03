exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `react-css-modules`,
    options: {
      generateScopedName: `[name]--[local]--[hash:base64:5]`,
      webpackHotModuleReloading: process.env.NODE_ENV !== `production`,
    },
  })
}
