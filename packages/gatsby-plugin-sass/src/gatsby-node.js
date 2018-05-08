import resolve from "./resolve"

exports.onCreateWebpackConfig = (
  { actions, stage, rules, plugins, loaders },
  { postCssPlugins, ...sassOptions }
) => {
  const { setWebpackConfig } = actions
  const PRODUCTION = stage !== `develop`

  const sassLoader = {
    loader: resolve(`sass-loader`),
    options: {
      sourceMap: !PRODUCTION,
      ...sassOptions,
    },
  }

  const sassRule = {
    test: /\.s(a|c)ss$/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      sassLoader,
    ],
  }
  const sassRuleModules = {
    test: /\.module\.s(a|c)ss$/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ modules: true, importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      sassLoader,
    ],
  }
  const sassRuleModulesSSR = {
    test: /\.module\.s(a|c)ss$/,
    use: [
      loaders.css({ modules: true, importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      sassLoader,
    ],
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-javascript`:
      configRules = configRules.concat([
        {
          oneOf: [sassRuleModules, sassRule],
        },
      ])
      break

    case `build-html`:
    case `develop-html`:
      configRules = configRules.concat([
        {
          oneOf: [
            sassRuleModulesSSR,
            {
              ...sassRule,
              use: [loaders.null()],
            },
          ],
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
