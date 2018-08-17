// const { tsPresetsFromJsPresets } = require(`./`)

const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateBabelConfig({ actions }, pluginOptions) {
  actions.setBabelPreset({
    name: `@babel/preset-typescript`,
  })
}

function onCreateWebpackConfig({ actions, loaders, stage }) {
  const jsLoader = loaders.js()
  if (
    !(
      jsLoader &&
      jsLoader.loader
    )
  ) {
    return
  }
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: jsLoader.loader,
            },
          ],
        },
      ],
    },
  })
}

exports.onCreateWebpackConfig = onCreateWebpackConfig
exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
