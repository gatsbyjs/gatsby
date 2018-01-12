const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const HtmlWebpackIncludeAssetsPlugin = require(`html-webpack-include-assets-plugin`)

exports.modifyWebpackConfig = (
  { config, stage },
  { modulePath = `${__dirname}/cms.js` }
) => {
  switch (stage) {
    case `develop`:
    case `build-javascript`:
      config.merge({
        entry: {
          cms: modulePath,
        },
        plugins: [
          new HtmlWebpackPlugin({
            title: `Content Manager`,
            filename: `admin/index.html`,
            chunks: [`cms`],
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [
              `https://identity.netlify.com/v1/netlify-identity-widget.js`,
            ],
            append: false,
            publicPath: false,
          }),
        ],
      })
      return config
    default:
      return config
  }
}
