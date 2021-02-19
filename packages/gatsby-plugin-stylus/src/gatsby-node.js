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

const resolve = require(`./resolve`)

exports.onCreateWebpackConfig = (
  { actions, loaders },
  { postCssPlugins, ...stylusOptions }
) => {
  const { setWebpackConfig } = actions

  const stylusLoader = {
    loader: resolve(`stylus-loader`),
    options: {
      ...stylusOptions,
    },
  }

  const stylusRule = {
    test: /\.styl$/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      stylusLoader,
    ],
  }

  const stylusRuleModules = {
    test: /\.module\.styl$/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ modules: true, importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      stylusLoader,
    ],
  }

  const configRules = [
    {
      oneOf: [stylusRuleModules, stylusRule],
    },
  ]

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}
