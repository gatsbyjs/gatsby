const MyLocalPlugin = require(`./local-webpack-plugin`)

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [new MyLocalPlugin()],
  })
}
