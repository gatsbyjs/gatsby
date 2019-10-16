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
  { actions, stage, rules, plugins, loaders },
  { postCssPlugins, ...stylusOptions }
) => {
  const { setWebpackConfig } = actions
  const PRODUCTION = stage !== `develop`
  const isSSR = stage.includes(`html`)

  const stylusLoader = {
    loader: resolve(`stylus-loader`),
    options: {
      sourceMap: !PRODUCTION,
      ...stylusOptions,
    },
  }

  const stylusRule = {
    test: /\.styl$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({ importLoaders: 2 }),
          loaders.postcss({ plugins: postCssPlugins }),
          stylusLoader,
        ],
  }

  const stylusRuleModules = {
    test: /\.module\.styl$/,
    use: [
      !isSSR && loaders.miniCssExtract({ hmr: false }),
      loaders.css({ modules: true, importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      stylusLoader,
    ].filter(Boolean),
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-javascript`:
    case `build-html`:
    case `develop-html`:
      configRules = configRules.concat([
        {
          oneOf: [stylusRuleModules, stylusRule],
        },
      ])
      break
  }

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}
