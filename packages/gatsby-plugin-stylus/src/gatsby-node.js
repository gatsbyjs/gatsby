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
const { extractTextPlugin } = require(`gatsby-1-config-extract-plugin`)
const { cssModulesConfig } = require(`gatsby-1-config-css-modules`)

exports.modifyWebpackConfig = ({ config, stage }, options = {}) => {
  // Pass in stylus options regardless of stage.
  config.merge(function (current) {
    current.stylus = options
    return current
  })

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
        loader: extractTextPlugin(stage).extract(`style`, [
          `css?minimize`,
          `postcss`,
          `stylus`,
        ]),
      })
      config.loader(`stylusModules`, {
        test: stylusModulesFiles,
        loader: extractTextPlugin(stage).extract(`style`, [
          cssModulesConfig(stage),
          `postcss`,
          `stylus`,
        ]),
      })
      return config
    }

    case `develop-html`:
    case `build-html`: {
      const moduleLoader = extractTextPlugin(stage).extract(`style`, [
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
      const moduleLoader = extractTextPlugin(stage).extract(`style`, [
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
