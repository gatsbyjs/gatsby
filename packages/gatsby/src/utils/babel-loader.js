const babelLoader = require(`babel-loader`)

module.exports = ({ stage, browserslist, resolve = require.resolve }) => {
  console.log({ stage, browserslist, babelLoader })
  return babelLoader.custom(babel => {
    const presetEnv = babel.createConfigItem({
      value: resolve(`@babel/preset-env`),
      type: `preset`,
      options: {
        loose: true,
        modules: false,
        useBuiltIns: `usage`,
        targets:
          stage === `build-html`
            ? {
                node: `current`,
              }
            : {
                browsers: browserslist,
              },
      },
    })
    const presetReact = babel.createConfigItem({
      value: resolve(`@babel/preset-react`),
      type: `preset`,
      options: {
        useBuiltIns: true,
        pragma: `React.createElement`,
        development: stage === `develop`,
      },
    })
    const presetFlow = babel.createConfigItem({
      value: resolve(`@babel/preset-flow`),
      type: `preset`,
    })
    const classProperties = babel.createConfigItem({
      value: resolve(`@babel/plugin-proposal-class-properties`),
      type: `plugin`,
    })
    const dynamicImport = babel.createConfigItem({
      value: resolve(`@babel/plugin-syntax-dynamic-import`),
      type: `plugin`,
    })
    const dynamicImportNode = babel.createConfigItem({
      value: resolve(`babel-plugin-dynamic-import-node`),
      type: `plugin`,
    })
    const runtime = babel.createConfigItem({
      value: resolve(`@babel/plugin-transform-runtime`),
      type: `plugin`,
    })
    const hotLoader = babel.createConfigItem({
      value: resolve(`react-hot-loader/babel`),
      type: `plugin`,
    })
    const graphqlQueries = babel.createConfigItem({
      value: resolve(`babel-plugin-remove-graphql-queries`),
      type: `plugin`,
    })

    const toReturn = {
      // Passed the loader options.
      customOptions(options) {
        return {
          loader: {
            cacheDirectory: true,
            babelrc: false,
            sourceType: `unambiguous`,
            ...options,
          },
        }
      },

      // Passed Babel's 'PartialConfig' object.
      config(partialConfig) {
        // TODO: we should run partialConfig through the gatsby babel API plugin
        // The problem there is this is sync and the API run is async :/
        let { options } = partialConfig

        console.log({
          options,
        })

        // If there is no filesystem config present add more defaults
        // TODO: maybe this should be stricter, like checkks if there are no plugins or presets?
        // TODO: this could be in an internal plugin like it is currently
        if (!partialConfig.hasFilesystemConfig()) {
          options = {
            ...options,
            presets: [presetEnv, presetReact, presetFlow],
            plugins: [classProperties, dynamicImport, runtime],
          }
        }

        let plugins = options.plugins == null ? [] : [...options.plugins]

        if (stage === `develop`) plugins.unshift(hotLoader)

        // Make dynamic imports work during SSR.
        if (stage === `build-html` || stage === `develop-html`) {
          plugins.unshift(dynamicImportNode)
        }
        plugins.unshift(graphqlQueries)

        return {
          ...options,
          plugins,
        }
      },
    }

    console.log(toReturn)
    return toReturn
  })
}
