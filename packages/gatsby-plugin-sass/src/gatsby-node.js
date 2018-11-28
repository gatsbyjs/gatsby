import resolve from "./resolve"

exports.onCreateWebpackConfig = (
  { actions, stage, rules, plugins, loaders },
  { cssLoaderOptions = {}, postCssPlugins, ...sassOptions }
) => {
  const { setWebpackConfig } = actions
  const PRODUCTION = stage !== `develop`
  const isSSR = stage.includes(`html`)

  const sassLoader = {
    loader: resolve(`sass-loader`),
    options: {
      sourceMap: !PRODUCTION,
      ...sassOptions,
    },
  }

  const sassRule = {
    test: /\.s(a|c)ss$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({ ...cssLoaderOptions, importLoaders: 2 }),
          loaders.postcss({ plugins: postCssPlugins }),
          sassLoader,
        ],
  }
  const sassRuleModules = {
    test: /\.module\.s(a|c)ss$/,
    use: [
      !isSSR && loaders.miniCssExtract(),
      loaders.css({ ...cssLoaderOptions, modules: true, importLoaders: 2 }),
      loaders.postcss({ plugins: postCssPlugins }),
      sassLoader,
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
          oneOf: [sassRuleModules, sassRule],
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
