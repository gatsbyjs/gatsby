import resolve from "./resolve"

exports.onCreateWebpackConfig = (
  { actions, loaders },
  { cssLoaderOptions = {}, postCssPlugins, loaderOptions, lessOptions }
) => {
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
    use: [
      loaders.miniCssExtract(),
      loaders.css({ ...cssLoaderOptions, importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      lessLoader,
    ],
  }
  const lessRuleModules = {
    test: /\.module\.less$/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ ...cssLoaderOptions, modules: true, importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      lessLoader,
    ],
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
