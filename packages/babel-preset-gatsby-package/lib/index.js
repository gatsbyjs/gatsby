const path = require(`path`)
const r = require(`./resolver`)

function preset(_context, options = {}) {
  const {
    browser = false,
    debug = false,
    nodeVersion = `14.15.0`,
    esm = false,
    availableCompilerFlags = [`GATSBY_MAJOR`],
    absoluteRuntime = false,
  } = options
  const {
    NODE_ENV,
    BABEL_ENV,
    COMPILER_OPTIONS = `GATSBY_MAJOR=4`,
  } = process.env

  const IS_TEST = (BABEL_ENV || NODE_ENV) === `test`

  const browserConfig = {
    useBuiltIns: false,
  }

  if (browser) {
    if (esm) {
      browserConfig.targets = {
        esmodules: true,
      }
    } else {
      browserConfig.targets = {
        browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
      }
    }
  }

  const nodeConfig = {
    corejs: 3,
    useBuiltIns: `entry`,
    targets: {
      node: nodeVersion,
    },
  }

  const absoluteRuntimePath = absoluteRuntime
    ? path.dirname(r("@babel/runtime/package.json"))
    : undefined

  let parsedCompilerOptions = {}
  if (COMPILER_OPTIONS) {
    // COMPILER_OPTIONS syntax is key=value,key2=value2
    parsedCompilerOptions = COMPILER_OPTIONS.split(`,`).reduce((acc, curr) => {
      const [key, value] = curr.split(`=`)

      if (key) {
        acc[key] = value
      }

      return acc
    }, Object.create(null))
  }

  return {
    presets: [
      [
        r(`@babel/preset-env`),
        Object.assign(
          {
            loose: true,
            debug: !!debug,
            shippedProposals: true,
            modules: esm ? false : `commonjs`,
            bugfixes: esm,
          },
          browser ? browserConfig : nodeConfig
        ),
      ],
      [r(`@babel/preset-react`)],
      r(`@babel/preset-flow`),
    ],
    plugins: [
      r(`@babel/plugin-proposal-nullish-coalescing-operator`),
      r(`@babel/plugin-proposal-optional-chaining`),
      [
        r(`@babel/plugin-transform-runtime`),
        {
          absoluteRuntime: absoluteRuntimePath
        }
      ],
      r(`@babel/plugin-syntax-dynamic-import`),
      IS_TEST && r(`babel-plugin-dynamic-import-node`),
      [
        r(`./babel-transform-compiler-flags`),
        {
          flags: parsedCompilerOptions,
          availableFlags: availableCompilerFlags,
        },
      ],
    ].filter(Boolean),
    overrides: [
      {
        test: [`**/*.ts`, `**/*.tsx`],
        plugins: [[`@babel/plugin-transform-typescript`, { isTSX: true }]],
      },
    ],
  }
}

module.exports = preset
