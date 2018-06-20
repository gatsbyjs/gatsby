// Add babel plugin
exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `styled-jsx/babel`,
  })
}
