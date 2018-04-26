const CssBlocks = require(`@css-blocks/jsx`)
const CssBlocksPlugin = require(`@css-blocks/webpack`).CssBlocksPlugin

const jsxCompilationOptions = {
  compilationOptions: {},
  optimization: {
    rewriteIdents: true,
    mergeDeclarations: true,
    removeUnusedStyles: true,
    conflictResolution: true,
    enabled: true,
  },
  aliases: {},
}

const CssBlockRewriter = new CssBlocks.Rewriter()

exports.onCreateWebpackConfig = (
  { actions, getConfig, stage, rules, plugins, loaders },
  { postCssPlugins, ...cssBlocksOptions }
) => {
  // TODO: Remove the line below
  console.log(getConfig().entry)

  const CssBlockAnalyzer = new CssBlocks.Analyzer(
    /* TODO: Fix this */ getConfig().entry,
    jsxCompilationOptions
  )

  const { setWebpackConfig } = actions

  const cssBlockLoaders = [
    {
      loader: require.resolve(`babel-loader`),
      options: {
        plugins: [
          require(`@css-blocks/jsx/dist/src/transformer/babel`).makePlugin({
            rewriter: CssBlockRewriter,
          }),
        ],
        cacheDirectory: true,
        compact: true,
        parserOpts: {
          plugins: [`jsx`],
        },
      },
    },

    // The JSX Webpack Loader halts loader execution until after all blocks have
    // been compiled and template analyses has been run. StyleMapping data stored
    // in shared `rewriter` object.
    {
      loader: require.resolve(`@css-blocks/webpack/dist/src/loader`),
      options: {
        analyzer: CssBlockAnalyzer,
        rewriter: CssBlockRewriter,
      },
    },
  ]

  const cssBlocksRule = {
    test: /\.[j|t]s(x?)$/,
    exclude: /node_modules/,
    use: [
      loaders.miniCssExtract(),
      loaders.css({ modules: true, importLoaders: 1 }),
      loaders.postcss({ plugins: postCssPlugins }),
      [...cssBlockLoaders],
    ],
  }

  let configRules = []

  switch (stage) {
    case `develop`:
    case `build-javascript`:
      configRules = configRules.concat(cssBlocksRule)
      break
  }

  setWebpackConfig({
    module: {
      rules: configRules,
    },

    plugins: [
      new CssBlocksPlugin({
        analyzer: CssBlockAnalyzer,
        outputCssFile: `blocks.css`,
        name: `css-blocks`,
        compilationOptions: jsxCompilationOptions.compilationOptions,
        optimization: jsxCompilationOptions.optimization,
      }),
    ],
  })
}
