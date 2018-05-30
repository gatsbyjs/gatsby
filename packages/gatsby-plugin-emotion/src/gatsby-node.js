exports.modifyBabelrc = ({ babelrc }, pluginOptions) => {
  if (process.env.NODE_ENV !== `production`) {
    return {
      plugins: [
        [
          require.resolve(`babel-plugin-emotion`),
          {
            sourceMap: true,
            ...(pluginOptions ? pluginOptions : {}),
          },
        ],
      ].concat(babelrc.plugins),
    }
  }
  return {
    plugins: [require.resolve(`babel-plugin-emotion`)].concat(babelrc.plugins),
  }
}
