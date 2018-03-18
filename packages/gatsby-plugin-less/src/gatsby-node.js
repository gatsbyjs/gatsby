const MiniCssExtractPlugin = require(`mini-css-extract-plugin`)

exports.onCreateWebpackConfig = (
  { actions, stage, rules, plugins, loaders },
  { postCssPlugins, ...lessOptions }
) => {
  const { setWebpackConfig } = actions
  const PRODUCTION = stage !== `develop`

  const lessLoader = {
    loader: require.resolve(`less-loader`),
    options: {
      sourceMap: !PRODUCTION,
      ...lessOptions,
    },
  }

  const lessRule = {
    test: /\.less$/,
    exclude: /\.module\.less$/,
    use: [
      MiniCssExtractPlugin.loader,
      loaders.css({ importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      lessLoader,
    ],
  }
  const lessRuleModules = {
    test: /\.module\.less$/,
    use: [
      MiniCssExtractPlugin.loader,
      loaders.css({ modules: true, importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      lessLoader,
    ],
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-css`:
    case `build-javascript`:
      configRules = configRules.concat([lessRule, lessRuleModules])
      break

    case `build-html`:
    case `develop-html`:
      configRules = configRules.concat([
        {
          ...lessRule,
          use: [loaders.null()],
        },
        lessRuleModules,
      ])
      break
  }

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}
