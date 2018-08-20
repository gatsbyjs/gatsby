const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateBabelConfig({ actions }, pluginOptions) {
  actions.setBabelPreset({
    name: `@babel/preset-typescript`,
  })
}

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
