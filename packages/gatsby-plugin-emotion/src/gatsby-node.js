const webpack = require(`webpack`)

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

  actions.setBabelPlugin({
    name: `babel-plugin-transform-react-jsx`,
    options: {
      pragma: `Emotion.jsx`,
    },
  })
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [
      new webpack.ProvidePlugin({
        Emotion: `@emotion/core`,
      }),
    ],
  })
}
