const r = m => require.resolve(m)

function preset(context, options = {}) {
  let { targets = null } = options

  const stage = process.env.GATSBY_BUILD_STAGE || `test`

  if (!targets) {
    if (stage === `build-html`) {
      targets = {
        node: `current`,
      }
    } else {
      targets = {
        browsers: [`>0.25%`, `not dead`],
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
