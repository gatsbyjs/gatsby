const r = require(`./resolver`)

function preset(context, options = {}) {
  const { browser = false, debug = false, nodeVersion = `8.0` } = options
  const { NODE_ENV, BABEL_ENV } = process.env

  const IS_PRODUCTION = (BABEL_ENV || NODE_ENV) === `production`
  const IS_TEST  = (BABEL_ENV || NODE_ENV) === `test`

  const browserConfig = {
    useBuiltIns: false,
    targets: {
      browsers: IS_PRODUCTION
        ? [`last 4 versions`, `safari >= 7`, `ie >= 9`]
        : [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
    },
  }

  const nodeConfig = {
    targets: {
      node: IS_PRODUCTION ? nodeVersion : `current`,
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
            modules: `commonjs`,
          },
          browser ? browserConfig : nodeConfig
        ),
      ],
      [r(`@babel/preset-react`), { development: !IS_PRODUCTION }],
      r(`@babel/preset-flow`),
    ],
    plugins: [
      r(`@babel/plugin-proposal-class-properties`),
      r(`@babel/plugin-proposal-optional-chaining`),
      r(`@babel/plugin-transform-runtime`),
      r(`@babel/plugin-syntax-dynamic-import`),
      IS_TEST && r(`babel-plugin-dynamic-import-node`)
    ].filter(Boolean),
  }
}

module.exports = preset
