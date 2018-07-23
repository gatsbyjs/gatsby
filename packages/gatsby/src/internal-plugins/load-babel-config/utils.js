const _ = require(`lodash`)

/**
 * Convert a babelrc from a .babelrc file or package.json
 * to actions to add it to the store.
 */
const actionifyBabelrc = (babelrc, actions) => {
  const { presets, plugins, ...options } = babelrc
  if (presets && _.isArray(presets)) {
    presets.forEach(p => {
      let name
      let options = {}
      if (_.isArray(p)) {
        name = p[0]
        options = p[1]
      } else {
        name = p
      }
      actions.setBabelPreset({
        name,
        options,
      })
    })
  }
  if (plugins && _.isArray(plugins)) {
    plugins.forEach(p => {
      let name
      let options = {}
      if (_.isArray(p)) {
        name = p[0]
        options = p[1]
      } else {
        name = p
      }
      actions.setBabelPlugin({
        name,
        options,
      })
    })
  }

  if (_.isObject(options) && !_.isEmpty(options)) {
    actions.setBabelOptions({ options })
  }
}

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
    name: `@babel/plugin-syntax-dynamic-import`,
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
exports.actionifyBabelrc = actionifyBabelrc
