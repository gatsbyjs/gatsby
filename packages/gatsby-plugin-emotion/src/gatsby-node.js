exports.modifyBabelrc = ({ babelrc }, pluginOptions) => {
  if (process.env.NODE_ENV !== `production`) {
    return {
      plugins: [
        [
          require.resolve(`babel-plugin-emotion`),
          pluginOptions ? pluginOptions : { sourceMap: true, autoLabel: true },
        ],
      ].concat(babelrc.plugins),
    }
  }
  return {
    plugins: [require.resolve(`babel-plugin-emotion`)].concat(babelrc.plugins),
  }
}
