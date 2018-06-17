import resolve from "./resolve"

exports.onCreateWebpackConfig = (
  { actions, stage, rules, plugins, loaders },
  { postCssPlugins, ...lessOptions }
) => {
  const { setWebpackConfig } = actions
  const PRODUCTION = stage !== `develop`
  const isSSR = stage.includes(`html`)

  const lessLoader = {
    loader: resolve(`less-loader`),
    options: {
      sourceMap: !PRODUCTION,
      ...lessOptions,
    },
  }

  const lessRule = {
    test: /\.less$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({ importLoaders: 1 }),
          loaders.postcss({ plugins: postCssPlugins }),
          lessLoader,
        ],
  }
  const lessRuleModules = {
    test: /\.module\.less$/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ modules: true, importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      lessLoader,
    ],
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-javascript`:
    case `build-html`:
    case `develop-html`:
      configRules = configRules.concat([
        {
          oneOf: [lessRuleModules, lessRule],
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
