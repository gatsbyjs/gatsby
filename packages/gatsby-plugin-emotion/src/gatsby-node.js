exports.onCreateBabelConfig = ({ actions }, pluginOptions) => {
  actions.setBabelPlugin({
    name: `babel-plugin-emotion`,
    options: {
      sourceMap: process.env.NODE_ENV === `production` ? false : true,
      ...(pluginOptions ? pluginOptions : {}),
    },
  })
}
