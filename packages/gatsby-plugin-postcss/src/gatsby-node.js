const CSS_PATTERN = /\.css$/
const MODULE_CSS_PATTERN = /\.module\.css$/

const isBuiltInCssRule = rule =>
  rule.test &&
  (rule.test.toString() === CSS_PATTERN.toString() ||
    rule.test.toString() === MODULE_CSS_PATTERN.toString())

exports.onCreateWebpackConfig = (
  { actions, stage, loaders, getConfig },
  { postcss: postcssOptions = {} } = {}
) => {
  const isProduction = stage !== `develop`
  const isSSR = stage.includes(`html`)
  const originalConfig = getConfig()

  originalConfig.module.rules = originalConfig.module.rules.filter(
    rule =>
      Array.isArray(rule.oneOf)
        ? rule.oneOf.every(x => !isBuiltInCssRule(x))
        : true
  )

  actions.replaceWebpackConfig(originalConfig)

  const postcssLoader = {
    loader: `postcss-loader`,
    options: { sourceMap: !isProduction, ...postcssOptions },
  }

  const postcssRule = {
    test: CSS_PATTERN,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({ importLoaders: 1 }),
          postcssLoader,
        ],
  }

  const postcssModule = {
    test: MODULE_CSS_PATTERN,
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
