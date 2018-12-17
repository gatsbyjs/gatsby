function onCreateBabelConfig({ actions }, pluginOptions) {
  actions.setBabelPreset({
    name: `@babel/preset-flow`,
  })
}

exports.onCreateBabelConfig = onCreateBabelConfig
