exports.onCreateWebpackConfig = (
  { actions, stage, loaders, getConfig },
  { postcss: postcssOptions = {} } = {}
) => {
  const isProduction = stage !== `develop`
  const isSSR = stage.includes(`html`)
  const originalConfig = getConfig()

  originalConfig.module.rules = originalConfig.module.rules.filter(rule => {
    if (Array.isArray(rule.oneOf)) {
      return JSON.stringify(rule).indexOf(`postcss-loader`) === -1
    }

    return true
  })

  actions.replaceWebpackConfig(originalConfig)

  const postcssLoader = {
    loader: `postcss-loader`,
    options: { sourceMap: !isProduction, ...postcssOptions },
  }

  const postcssRule = {
    test: /\.css$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({ importLoaders: 1 }),
          postcssLoader,
        ],
  }

  const postcssModule = {
    test: /\.module\.css$/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ modules: true, importLoaders: 1 }),
      postcssLoader,
    ],
  }

  let rules = []

  switch (stage) {
    case `develop`:
    case `build-javascript`:
    case `build-html`:
    case `develop-html`:
      rules = rules.concat([
        {
          oneOf: [postcssModule, postcssRule],
        },
      ])
      break
  }

  actions.setWebpackConfig({ module: { rules } })
}
