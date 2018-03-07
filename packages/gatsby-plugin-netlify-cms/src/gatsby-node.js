const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)

function plugins(stage) {
  const commonPlugins = [
    // Output /admin/index.html
    new HtmlWebpackPlugin({
      title: `Content Manager`,
      filename: `admin/index.html`,
      chunks: [`cms`],
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

/**
 * Exclude Netlify CMS styles from Gatsby CSS bundle. This relies on Gatsby
 * using webpack-configurator for webpack config extension, and also on the
 * target loader key being named "css" in Gatsby's webpack config.
 */
function excludeFromLoader(key, config) {
  config.loader(key, ({ exclude, ...configRest }) => {
    const regex = /\/node_modules\/netlify-cms\//
    if (!exclude) {
      return { ...configRest, exclude: regex }
    }
    if (Array.isArray(exclude)) {
      return { ...configRest, exclude: [...exclude, regex] }
    }
    return { ...configRest, exclude: [exclude, regex] }
  })
}

function module(config, stage) {
  switch (stage) {
    case `build-css`:
      excludeFromLoader(`css`, config)
      return config
    case `build-javascript`:
      excludeFromLoader(`css`, config)

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

exports.onCreateWebpackConfig = ({ config, stage }, { modulePath }) => {
  config.merge({
    entry: {
      cms: [`${__dirname}/cms.js`, modulePath].filter(p => p),
    },
    plugins: plugins(stage),
  })

  module(config, stage)

  return config
}
