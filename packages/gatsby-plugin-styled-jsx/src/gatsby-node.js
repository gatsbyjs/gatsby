// Add babel plugin
exports.onCreateBabelConfig = ({ actions }, { jsxPlugins }) => {
  actions.setBabelPlugin({
    name: `styled-jsx/babel`,
    options: {
      plugins: jsxPlugins || [],
    },
  })
}
