const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateBabelConfig({ actions }, options) {
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-typescript`),
    options,
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
  
  if (stage === "develop") {
    const builtInEslintRule = getConfig().module.rules.find(rule => {
      if (rule.enforce === `pre`) {
        return rule.use.some(use => {
          return /eslint-loader/.test(use.loader)
        })
      }
      return false
    });

    if (builtInEslintRule) {
      const typescriptEslintRule = {
        ...builtInEslintRule,
        test: /\.tsx?$/,
      };
      actions.setWebpackConfig({
        module: {
          rules: [typescriptEslintRule],
        }
      });
    }
  }
}

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
exports.onCreateWebpackConfig = onCreateWebpackConfig
