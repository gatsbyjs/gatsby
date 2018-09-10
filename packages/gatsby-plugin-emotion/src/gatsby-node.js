exports.onCreateBabelConfig = ({ actions }, pluginOptions) => {
  actions.setBabelPlugin({
    name: `babel-plugin-emotion`,
    options: {
      sourceMap: process.env.NODE_ENV !== `production`,
      autoLabel: process.env.NODE_ENV !== `production`,
      hoist: process.env.NODE_ENV === `production`,
      ...(pluginOptions ? pluginOptions : {}),
    },
  })
}
