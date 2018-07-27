const babelLoader = require(`babel-loader`)

module.exports = ({ stage, browserslist, resolve = require.resolve }) =>
  babelLoader.customLoader(babel => {
    const presetEnv = babel.createConfigItem([
      resolve(`@babel/preset-env`),
      {
        loose: true,
        modules: false,
        useBuiltIns: `usage`,
        targets:
          stage === `build-html`
            ? { node: `current` }
            : { browsers: browserslist },
      },
    ])
    const presetReact = babel.createConfigItem([
      resolve(`@babel/preset-react`),
      {
        useBuiltIns: true,
        pragma: `React.createElement`,
        development: stage === `develop`,
      },
    ])
    const presetFlow = babel.createConfigItem(resolve(`@babel/preset-flow`))
    const classProperties = babel.createConfigItem(
      resolve(`@babel/plugin-proposal-class-properties`)
    )
    const dynamicImport = babel.createConfigItem(
      resolve(`@babel/plugin-syntax-dynamic-import`)
    )
    const dynamicImportNode = babel.createConfigItem(
      resolve(`babel-plugin-dynamic-import-node`)
    )
    const runtime = babel.createConfigItem(
      resolve(`@babel/plugin-transform-runtime`)
    )
    const hotLoader = babel.createConfigItem(resolve(`react-hot-loader/babel`))
    const graphqlQueries = babel.createConfigItem(
      resolve(`babel-plugin-remove-graphql-queries`)
    )

    return {
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

        return { ...options, plugins }
      },
    }
  })
