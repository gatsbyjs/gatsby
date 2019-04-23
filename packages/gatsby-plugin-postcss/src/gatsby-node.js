import resolve from "./resolve"

const CSS_PATTERN = /\.css$/
const MODULE_CSS_PATTERN = /\.module\.css$/

const getOptions = pluginOptions => {
  const options = { ...pluginOptions }

  delete options.plugins

  const postcssPlugins = options.postCssPlugins

  if (postcssPlugins) {
    options.plugins = postcssPlugins
  }

  delete options.postCssPlugins

  return options
}

const isCssRules = rule =>
  rule.test &&
  (rule.test.toString() === CSS_PATTERN.toString() ||
    rule.test.toString() === MODULE_CSS_PATTERN.toString())

const findCssRules = config =>
  config.module.rules.find(
    rule => Array.isArray(rule.oneOf) && rule.oneOf.every(isCssRules)
  )

exports.onCreateWebpackConfig = (
  { actions, stage, loaders, getConfig },
  pluginOptions
) => {
  const isProduction = !stage.includes(`develop`)
  const isSSR = stage.includes(`html`)
  const config = getConfig()
  const cssRules = findCssRules(config)
  const postcssOptions = getOptions(pluginOptions)

  const generateCssLoaderOptions = options =>
    Object.assign(
      { importLoaders: 1 },
      options,
      pluginOptions.cssLoaderOptions || {}
    )

  const postcssLoader = {
    loader: resolve(`postcss-loader`),
    options: { sourceMap: !isProduction, ...postcssOptions },
  }
  const postcssRule = {
    test: CSS_PATTERN,
    use: isSSR
      ? [loaders.null()]
      : [loaders.css(generateCssLoaderOptions()), postcssLoader],
  }
  const postcssRuleModules = {
    test: MODULE_CSS_PATTERN,
    use: [
      loaders.css(generateCssLoaderOptions({ modules: true })),
      postcssLoader,
    ],
  }

  if (!isSSR) {
    postcssRule.use.unshift(loaders.miniCssExtract())
    postcssRuleModules.use.unshift(loaders.miniCssExtract({ hmr: false }))
  }

  const postcssRules = { oneOf: [] }

  switch (stage) {
    case `develop`:
    case `build-javascript`:
    case `build-html`:
    case `develop-html`:
      postcssRules.oneOf.push(...[postcssRuleModules, postcssRule])
      break
  }

  if (cssRules) {
    cssRules.oneOf.unshift(...postcssRules.oneOf)

    actions.replaceWebpackConfig(config)
  } else {
    actions.setWebpackConfig({ module: { rules: [postcssRules] } })
  }
}
