
exports.modifyWebpackConfig = ({ boundActionCreators, stage, rules, plugins, loaders }) => {
  const { setWebpackConfig } = boundActionCreators
  const PRODUCTION = stage !== `develop`

  const sassLoader = {
    loader: require.resolve(`sass-loader`),
    options: { sourceMap: !PRODUCTION },
  }

  const sassRule = {
    test: /\.s(a|c)ss$/,
    exclude: /\.module\.s(a|c)ss$/,
    use: plugins.extractText.extract({
      fallback: loaders.style,
      use: [loaders.css({ importLoaders: 1 }), loaders.postcss(), sassLoader],
    }),
  }
  const sassRuleModules = {
    test: /\.module\.s(a|c)ss$/,
    use: plugins.extractText.extract({
      fallback: loaders.style,
      use: [
        loaders.css({ modules: true, importLoaders: 1 }),
        loaders.postcss(),
        sassLoader,
      ],
    }),
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-css`:
    case `build-javascript`:
      configRules = configRules.concat([sassRule, sassRuleModules])
      break

    case `build-html`:
    case `develop-html`:
      configRules = configRules.concat([
        {
          ...sassRule,
          use: loaders.null,
        },
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
