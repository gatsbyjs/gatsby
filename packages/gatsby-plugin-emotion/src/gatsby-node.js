exports.modifyBabelrc = ({ babelrc }) => {
  return {
    plugins: babelrc.plugins.concat([[`emotion/babel`, { inline: true }]]),
  }
}
