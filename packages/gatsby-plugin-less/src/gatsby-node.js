
exports.modifyWebpackConfig = (
  { boundActionCreators, stage, rules, plugins, loaders },
  { postCssPlugins, ...lessOptions }
) => {
  const { setWebpackConfig } = boundActionCreators
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
    use: plugins.extractText.extract({
      fallback: loaders.style,
      use: [
        loaders.css({ importLoaders: 1 }),
        loaders.postcss({ plugins: postCssPlugins }),
        lessLoader,
      ],
    }),
  }
  const lessRuleModules = {
    test: /\.module\.less$/,
    use: plugins.extractText.extract({
      fallback: loaders.style,
      use: [
        loaders.css({ modules: true, importLoaders: 1 }),
        loaders.postcss({ plugins: postCssPlugins }),
        lessLoader,
      ],
    }),
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
          use: loaders.null,
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
