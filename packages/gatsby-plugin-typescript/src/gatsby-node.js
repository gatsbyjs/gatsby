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

function onCreateWebpackConfig({
  actions,
  getConfig,
  loaders,
  stage,
  reporter,
}) {
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
    let isTypescriptDepAvailable
    try {
      isTypescriptDepAvailable = require.resolve(`typescript`)
    } catch (e) {
      reporter.warn(
        `"typescript" is not installed. Builtin ESLint won't be working on typescript files.`
      )
    }

    if (isTypescriptDepAvailable) {
      const builtInEslintRule = getConfig().module.rules.find(rule => {
        if (rule.enforce === `pre`) {
          if (rule.use) {
            return rule.use.some(use => /eslint-loader/.test(use.loader))
          } else {
            return /eslint-loader/.test(rule.loader)
          }
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
}

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
exports.onCreateWebpackConfig = onCreateWebpackConfig
