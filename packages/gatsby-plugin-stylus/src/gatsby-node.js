/**
 * Usage:
 *
 * // gatsby-config.js
 * plugins: [
 *  `gatsby-plugin-stylus`,
 * ],
 *
 * // Usage with options:
 *
 * // gatsby-config.js
 * plugins: [
 *   {
 *     resolve: `gatsby-plugin-stylus`,
 *     options: {
 *       modules: true,
 *       use: [],
 *     },
 *   },
 * ],
 */
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)

exports.modifyWebpackConfig = ({ config, stage }, options = {}) => {
  const modules = Boolean(options.modules)
  const cssModulesConfProd = `css?modules&minimize&importLoaders=1`
  const cssModulesConfDev =
    `css?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]`

  // Pass in stylus plugins regardless of stage.
  if (Array.isArray(options.use)) {
    console.log(`WARNING: gatsby-plugin-stylus \`use\` option is not yet supported. See https://github.com/gatsbyjs/gatsby/issues/1432`)
    console.log()
    // config.merge(current => {
    //   current.stylus = {
    //     use: options.use,
    //   }
    //   return current
    // })
  } else if (options.use) {
    throw new Error(`gatsby-plugin-stylus "use" option passed with ${options.use}. Pass an array of stylus plugins instead`)
  }

  switch (stage) {
    case `develop`: {
      config.loader(`stylus`, {
        test: /\.styl$/,
        loaders: [`style`, modules ? cssModulesConfDev : `css`, `postcss`, `stylus`],
      })
      return config
    }

    case `build-css`: {
      config.loader(`stylus`, {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract(`style`, [
          modules ? cssModulesConfProd : `css?minimize`,
          `postcss`,
          `stylus`,
        ]),
      })
      return config
    }

    case `develop-html`:
    case `build-html`: {
      const moduleLoader = ExtractTextPlugin.extract(`style`, [
        cssModulesConfProd,
        `postcss`,
        `stylus`,
      ])

      config.loader(`stylus`, {
        test: /\.styl$/,
        loader: modules ? moduleLoader : `null`,
      })
      return config
    }

    case `build-javascript`: {
      const moduleLoader = ExtractTextPlugin.extract(`style`, [
        cssModulesConfProd,
        `stylus`,
      ])
      config.loader(`stylus`, {
        test: /\.styl$/,
        loader: modules ? moduleLoader : `null`,
      })

      return config
    }

    default: {
      return config
    }
  }
}
