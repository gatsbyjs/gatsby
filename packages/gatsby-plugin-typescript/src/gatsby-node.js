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

function onCreateWebpackConfig({ actions, getConfig, loaders, stage }) {
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

  if (stage === `develop`) {
    const builtInEslintRule = getConfig().module.rules.find(rule => {
      if (rule.enforce === `pre`) {
        return rule.use.some(use => /eslint-loader/.test(use.loader))
      }
      return false
    })

    if (builtInEslintRule) {
      const typescriptEslintRule = {
        ...builtInEslintRule,
        test: /\.tsx?$/,
      }
      actions.setWebpackConfig({
        module: {
          rules: [typescriptEslintRule],
        },
      })
    }
  }
}

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
exports.onCreateWebpackConfig = onCreateWebpackConfig
