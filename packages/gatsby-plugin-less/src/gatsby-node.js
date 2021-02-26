import resolve from "./resolve"

exports.onCreateWebpackConfig = (
  { actions, stage, loaders },
  { cssLoaderOptions = {}, postCssPlugins, loaderOptions, lessOptions }
) => {
  const isSSR = [`develop-html`, `build-html`].includes(stage)
  const { setWebpackConfig } = actions

  const lessLoader = {
    loader: resolve(`less-loader`),
    options: {
      lessOptions: {
        ...lessOptions,
      },
      ...loaderOptions,
    },
  }

  const lessRule = {
    test: /\.less$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({ ...cssLoaderOptions, importLoaders: 2 }),
          loaders.postcss({ plugins: postCssPlugins }),
          lessLoader,
        ],
  }
  const lessRuleModules = {
    test: /\.module\.less$/,
    use: [
      !isSSR && loaders.miniCssExtract({ modules: true }),
      loaders.css({ ...cssLoaderOptions, modules: true, importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      lessLoader,
    ].filter(Boolean),
  }

  const configRules = [
    {
      oneOf: [lessRuleModules, lessRule],
    },
  ]

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}
