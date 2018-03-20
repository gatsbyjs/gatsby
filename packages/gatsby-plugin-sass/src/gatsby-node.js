const MiniCssExtractPlugin = require(`mini-css-extract-plugin`)

exports.onCreateWebpackConfig = (
  { actions, stage, rules, plugins, loaders },
  { postCssPlugins, ...sassOptions }
) => {
  const { setWebpackConfig } = actions
  const PRODUCTION = stage !== `develop`

  const sassLoader = {
    loader: require.resolve(`sass-loader`),
    options: {
      sourceMap: !PRODUCTION,
      ...sassOptions,
    },
  }

  const sassRule = {
    test: /\.s(a|c)ss$/,
    exclude: /\.module\.s(a|c)ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      loaders.css({ importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      sassLoader,
    ],
  }
  const sassRuleModules = {
    test: /\.module\.s(a|c)ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      loaders.css({ modules: true, importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      sassLoader,
    ],
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-javascript`:
      configRules = configRules.concat([sassRule, sassRuleModules])
      break

    case `build-html`:
    case `develop-html`:
      configRules = configRules.concat([
        {
          ...sassRule,
          use: [loaders.null()],
        },
        // TODO (sokra): omit the MiniCssExtractPlugin.loader for server-rendering
        sassRuleModules,
      ])
      break
  }

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}
