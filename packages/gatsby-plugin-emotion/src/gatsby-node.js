exports.onCreateBabelConfig = ({ actions }, pluginOptions) => {
  actions.setBabelPlugin({
    name: `babel-plugin-emotion`,
    options: {
      ...(process.env.NODE_ENV === `production` ? {
        hoist: true,
      } : {
        sourceMap: true,
        autoLabel: true,
      }),
      ...(pluginOptions ? pluginOptions : {}),
    },
  })
}
