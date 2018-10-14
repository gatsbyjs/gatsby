const path = require(`path`)

const r = m => require.resolve(m)

const loadCachedConfig = () => {
  let pluginBabelConfig = {}
  if (process.env.NODE_ENV !== `test`) {
    pluginBabelConfig = require(path.join(
      process.cwd(),
      `./.cache/babelState.json`
    ))
  }
  return pluginBabelConfig
}

function preset(context, options = {}) {
  let { targets = null } = options

  const pluginBabelConfig = loadCachedConfig()
  const stage = process.env.GATSBY_BUILD_STAGE || `test`

  if (!targets) {
    if (stage === `build-html`) {
      targets = {
        node: `current`,
      }
    } else {
      targets = {
        browsers: pluginBabelConfig.browserslist,
      }
    }
  }

  return {
    presets: [
      [
        r(`@babel/preset-env`),
        {
          loose: true,
          modules: false,
          useBuiltIns: `usage`,
          targets,
        },
      ],
      [
        r(`@babel/preset-react`),
        {
          useBuiltIns: true,
          pragma: `React.createElement`,
          development: stage === `develop`,
        },
      ],
    ],
    plugins: [
      [
        r(`@babel/plugin-proposal-class-properties`),
        {
          loose: true,
        },
      ],
      r(`babel-plugin-macros`),
      r(`@babel/plugin-syntax-dynamic-import`),
      [
        r(`@babel/plugin-transform-runtime`),
        {
          helpers: true,
          regenerator: true,
        },
      ],
    ],
  }
}

module.exports = preset
