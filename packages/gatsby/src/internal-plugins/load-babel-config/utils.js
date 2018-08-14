const addDefaultPluginsPresets = (
  actions,
  { stage = ``, browserslist = {} }
) => {
  let targets
  if (stage === `build-html`) {
    targets = { node: `current` }
  } else {
    targets = { browsers: browserslist }
  }
  // Presets
  actions.setBabelPreset({
    name: `@babel/preset-env`,
    stage,
    options: {
      loose: true,
      modules: false,
      useBuiltIns: `usage`,
      targets,
    },
  })
  actions.setBabelPreset({
    name: `@babel/preset-react`,
    stage,
    options: {
      useBuiltIns: true,
      pragma: `React.createElement`,
      development: stage === `develop`,
    },
  })
  actions.setBabelPreset({ name: `@babel/preset-flow`, stage })

  // Plugins
  actions.setBabelPlugin({
    name: `@babel/plugin-proposal-class-properties`,
    stage,
    options: { loose: true },
  })
  actions.setBabelPlugin({
    name: `babel-plugin-remove-graphql-queries`,
    stage,
    options: { loose: true },
  })
  actions.setBabelPlugin({
    name: `@babel/plugin-syntax-dynamic-import`,
    stage,
  })
  actions.setBabelPlugin({
    name: `babel-plugin-macros`,
    stage,
  })
  // Polyfills the runtime needed for async/await and generators
  actions.setBabelPlugin({
    name: `@babel/plugin-transform-runtime`,
    stage,
    options: {
      helpers: true,
      regenerator: true,
      polyfill: false,
    },
  })
}

exports.addDefaultPluginsPresets = addDefaultPluginsPresets
