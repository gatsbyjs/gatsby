const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateBabelConfig({ actions }, options) {
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-typescript`),
    options,
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-optional-chaining`),
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-nullish-coalescing-operator`),
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-numeric-separator`),
  })
}

function onCreateWebpackConfig({ actions, loaders }) {
  const jsLoader = loaders.js()

  if (!jsLoader) {
    return
  }

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: jsLoader,
        },
      ],
    },
  })
}

exports.pluginOptionsSchema = ({ Joi }) =>
  Joi.object({
    isTSX: Joi.boolean().description(`Enables jsx parsing.`).default(false),
    jsxPragma: Joi.string()
      .description(`Replace the function used when compiling JSX expressions.`)
      .default(`React`),
    allExtensions: Joi.boolean()
      .description(`Indicates that every file should be parsed as TS or TSX.`)
      .default(false)
      .when(`isTSX`, { is: true, then: Joi.valid(true) }),
  })

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
exports.onCreateWebpackConfig = onCreateWebpackConfig
