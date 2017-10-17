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
 *       import: []
 *     },
 *   },
 * ],
 */
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)
const { cssModulesConfig } = require(`gatsby-1-config-css-modules`)

exports.modifyWebpackConfig = ({ config, stage }, options = {}) => {
  // Pass in stylus options regardless of stage.
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
  if (Array.isArray(options.import)) {
    config.merge(current => {
      current.stylus = {
        import: options.import,
      }
      return current
    })
  } else if (options.import) {
    throw new Error(
      `gatsby-plugin-stylus "import" option passed with ${options.import}. Pass an array of filenames instead`
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
        loaders: [`style`, cssModulesConfig(stage), `postcss`, `stylus`],
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
          cssModulesConfig(stage),
          `postcss`,
          `stylus`,
        ]),
      })
      return config
    }

    case `develop-html`:
    case `build-html`: {
      const moduleLoader = ExtractTextPlugin.extract(`style`, [
        cssModulesConfig(stage),
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
        cssModulesConfig(stage),
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
