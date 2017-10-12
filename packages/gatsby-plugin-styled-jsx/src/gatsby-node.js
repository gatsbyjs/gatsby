// Add babel plugin
exports.modifyBabelrc = ({ babelrc }) => {
  return {
    ...babelrc,
    plugins: babelrc.plugins.concat([`styled-jsx/babel`]),
  }
}
