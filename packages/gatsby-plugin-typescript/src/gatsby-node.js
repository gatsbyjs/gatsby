const { tsPresetsFromJsPresets } = require(`./`)

const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateWebpackConfig({ actions, loaders, stage }) {
  const jsLoader = loaders.js()
  if (
    !(
      jsLoader &&
      jsLoader.loader &&
      jsLoader.options &&
      jsLoader.options.presets
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
              options: {
                ...jsLoader.options,
                presets: tsPresetsFromJsPresets(jsLoader.options.presets),
              },
            },
          ],
        },
      ],
    },
  })
}
exports.onCreateWebpackConfig = onCreateWebpackConfig
exports.resolvableExtensions = resolvableExtensions
