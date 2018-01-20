const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const HtmlWebpackIncludeAssetsPlugin = require(`html-webpack-include-assets-plugin`)
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)

function plugins(stage) {
  const commonPlugins = [
    // Output /admin/index.html
    new HtmlWebpackPlugin({
      title: `Content Manager`,
      filename: `admin/index.html`,
      chunks: [`cms`],
    }),

    // Include the identity widget script in the html file
    new HtmlWebpackIncludeAssetsPlugin({
      assets: [`https://identity.netlify.com/v1/netlify-identity-widget.js`],
      append: false,
      publicPath: false,
    }),
  ]

  switch (stage) {
    case `develop`:
      return commonPlugins
    case `build-javascript`:
      return [...commonPlugins, new ExtractTextPlugin(`cms.css`)]
    default:
      return []
  }
}

function module(config, stage) {
  switch (stage) {
    case `build-javascript`:
      // Exclude Netlify CMS styles from Gatsby CSS bundle. This relies on
      // Gatsby using webpack-configurator for webpack config extension, and
      // also on the target loader key being named "css" in Gatsby's webpack
      // config.
      config.loader(`css`, {
        exclude: [/\/node_modules\/netlify-cms\//],
      })

      // Exclusively extract Netlify CMS styles to /cms.css (filename configured
      // above with plugin instantiation).
      config.loader(`cms-css`, {
        test: /\.css$/,
        include: [/\/node_modules\/netlify-cms\//],
        loader: ExtractTextPlugin.extract([`css`]),
      })
      return config
    default:
      return config
  }
}

exports.modifyWebpackConfig = (
  { config, stage },
  { modulePath = `${__dirname}/cms.js` }
) => {
  config.merge({
    entry: {
      cms: modulePath,
    },
    plugins: plugins(stage),
  })

  module(config, stage)

  return config
}
