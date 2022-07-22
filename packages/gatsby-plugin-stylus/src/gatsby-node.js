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
  { actions, stage, loaders },
  { cssLoaderOptions = {}, postCssPlugins, ...stylusOptions }
) => {
  const isSSR = [`develop-html`, `build-html`].includes(stage)
  const { setWebpackConfig } = actions

  const stylusLoader = {
    loader: resolve(`stylus-loader`),
    options: {
      ...stylusOptions,
    },
  }

  const stylusRule = {
    test: /\.styl$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({
            importLoaders: 2,
            ...cssLoaderOptions,
            modules: false,
          }),
          loaders.postcss({ plugins: postCssPlugins }),
          stylusLoader,
        ],
  }

  const stylusRuleModules = {
    test: /\.module\.styl$/,
    use: [
      !isSSR &&
        loaders.miniCssExtract({
          modules: {
            namedExport: cssLoaderOptions.modules?.namedExport ?? true,
          },
        }),
      loaders.css({
        ...cssLoaderOptions,
        importLoaders: 1,
        modules: cssLoaderOptions.modules ?? true,
      }),
      loaders.postcss({ plugins: postCssPlugins }),
      stylusLoader,
    ].filter(Boolean),
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
