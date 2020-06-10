import resolve from "./resolve"

exports.onCreateWebpackConfig = (
  { actions, stage, rules, plugins, loaders },
  { cssLoaderOptions = {}, postCssPlugins, loaderOptions, lessOptions }
) => {
  const { setWebpackConfig } = actions
  const PRODUCTION = stage !== `develop`
  const isSSR = stage.includes(`html`)

  const lessLoader = {
    loader: resolve(`less-loader`),
    options: {
      sourceMap: !PRODUCTION,
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
      !isSSR && loaders.miniCssExtract({ hmr: false }),
      loaders.css({ ...cssLoaderOptions, modules: true, importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      lessLoader,
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
