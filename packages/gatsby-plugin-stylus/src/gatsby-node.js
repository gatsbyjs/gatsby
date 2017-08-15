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
exports.modifyWebpackConfig = (
  { boundActionCreators, stage, rules, plugins, loaders },
  { postCssPlugins, ...stylusOptions }
) => {
  const { setWebpackConfig } = boundActionCreators
  const PRODUCTION = stage !== `develop`

  const stylusLoader = {
    loader: require.resolve(`stylus-loader`),
    options: {
      sourceMap: !PRODUCTION,
      ...stylusOptions,
    },
  }

  const stylusRule = {
    test: /\.styl$/,
    exclude: /\.module\.styl$/,
    use: plugins.extractText.extract({
      fallback: loaders.style,
      use: [
        loaders.css({ importLoaders: 1 }),
        loaders.postcss({ plugins: postCssPlugins }),
        stylusLoader,
      ],
    }),
  }

  const stylusRuleModules = {
    test: /\.module\.styl$/,
    use: plugins.extractText.extract({
      fallback: loaders.style,
      use: [
        loaders.css({ modules: true, importLoaders: 1 }),
        loaders.postcss({ plugins: postCssPlugins }),
        stylusLoader,
      ],
    }),
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-css`:
    case `build-javascript`:
      configRules = configRules.concat([stylusRule, stylusRuleModules])
      break

    case `build-html`:
    case `develop-html`:
      configRules = configRules.concat([
        {
          ...stylusRule,
          use: loaders.null,
        },
        stylusRuleModules,
      ])
      break
  }

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}
