const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateBabelConfig({ actions }, options) {
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-typescript`),
    options,
  })
}

function onCreateWebpackConfig({ actions, loaders }) {
  const { schema } = store.getState();

  const jsLoader = loaders.js();
  const eslintLoader = loaders.eslint(schema);

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
        {
          enforce: `pre`,
          test: /\.tsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: eslintLoader
        },
      ],
    },
  })
}

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
exports.onCreateWebpackConfig = onCreateWebpackConfig
