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
 *       use: [],
 *     },
 *   },
 * ],
 */
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)

exports.modifyWebpackConfig = ({ config, stage }, options = {}) => {
  const cssModulesConfProd = `css?modules&minimize&importLoaders=1`
  const cssModulesConfDev = `css?modules&importLoaders=1&localIdentName=[name]---[local]---[hash:base64:5]`

  // Pass in stylus plugins regardless of stage.
  if (Array.isArray(options.use)) {
    config.merge(current => {
      current.stylus = {
        use: options.use,
      }
      return current
    })
  } else if (options.use) {
    throw new Error(
      `gatsby-plugin-stylus "use" option passed with ${options.use}. Pass an array of stylus plugins instead`
    )
  }

  const stylusFiles = /\.styl$/
  const stylusModulesFiles = /\.module\.styl$/

  switch (stage) {
    case `develop`: {
      config.loader(`stylus`, {
        test: stylusFiles,
        exclude: stylusModulesFiles,
        loaders: [`style`, `css`, `postcss`, `stylus`],
      })
      config.loader(`stylusModules`, {
        test: stylusModulesFiles,
        loaders: [`style`, cssModulesConfDev, `postcss`, `stylus`],
      })
      return config
    }

    case `build-css`: {
      config.loader(`stylus`, {
        test: stylusFiles,
        exclude: stylusModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          `css?minimize`,
          `postcss`,
          `stylus`,
        ]),
      })
      config.loader(`stylusModules`, {
        test: stylusModulesFiles,
        loader: ExtractTextPlugin.extract(`style`, [
          cssModulesConfProd,
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
        test: stylusFiles,
        exclude: stylusModulesFiles,
        loader: `null`,
      })
      config.loader(`stylusModules`, {
        test: stylusModulesFiles,
        loader: moduleLoader,
      })
      return config
    }

    case `build-javascript`: {
      const moduleLoader = ExtractTextPlugin.extract(`style`, [
        cssModulesConfProd,
        `stylus`,
      ])
      config.loader(`stylus`, {
        test: stylusFiles,
        exclude: stylusModulesFiles,
        loader: `null`,
      })
      config.loader(`stylusModules`, {
        test: stylusModulesFiles,
        loader: moduleLoader,
      })

      return config
    }

    default: {
      return config
    }
  }
}
