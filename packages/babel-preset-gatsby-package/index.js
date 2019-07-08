const r = require(`./resolver`)

const modernConfig = {
  loose: true,
  targets: {
    esmodules: true,
  },
  useBuiltIns: false,
}

function preset(_, options = {}) {
  const { browser = false, debug = false, nodeVersion = `8.0`, modern = process.env.MODERN } = options
  const { NODE_ENV, BABEL_ENV } = process.env

  const PRODUCTION = (BABEL_ENV || NODE_ENV) === `production`

  const browserConfig = modern ? modernConfig : {
    useBuiltIns: false,
    targets: {
      browsers: PRODUCTION
        ? [`last 4 versions`, `safari >= 7`, `ie >= 9`]
        : [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
    },
  }

  const nodeConfig = {
    targets: {
      node: PRODUCTION ? nodeVersion : `current`,
    },
  }

  return {
    presets: [
      [
        r(`@babel/preset-env`),
        Object.assign(
          {
            loose: true,
            debug: !!debug,
            useBuiltIns: `entry`,
            shippedProposals: true,
            modules: modern ? false : `commonjs`,
          },
          browser ? browserConfig : nodeConfig
        ),
      ],
      [r(`@babel/preset-react`), { development: !PRODUCTION }],
      r(`@babel/preset-flow`),
    ],
    plugins: [
      r(`@babel/plugin-proposal-class-properties`),
      r(`@babel/plugin-proposal-optional-chaining`),
      r(`@babel/plugin-syntax-dynamic-import`),
    ].concat(modern ? [] : r(`@babel/plugin-transform-runtime`))
  }
}

module.exports = preset
