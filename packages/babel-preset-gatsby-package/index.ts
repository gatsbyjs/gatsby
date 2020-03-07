const resolve = (m: string): string => require.resolve(m)

type Preset = string | string[] | Array<string | object>
interface IOptions {
  browser?: boolean
  debug?: boolean
  nodeVersion?: string
}
export default (
  _?: unknown,
  { browser = false, debug = false, nodeVersion = `8.0` }: IOptions = {}
): { presets: Preset[]; plugins: string[] } => {
  const { NODE_ENV, BABEL_ENV } = process.env

  const IS_TEST = (BABEL_ENV || NODE_ENV) === `test`

  const browserConfig = {
    useBuiltIns: false,
    targets: {
      browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
    },
  }

  const nodeConfig = {
    corejs: 2,
    useBuiltIns: `entry`,
    targets: {
      node: nodeVersion,
    },
  }

  return {
    presets: [
      [
        resolve(`@babel/preset-env`),
        {
          loose: true,
          debug,
          shippedProposals: true,
          modules: `commonjs`,
          ...(browser ? browserConfig : nodeConfig),
        },
      ],
      [resolve(`@babel/preset-react`)],
      resolve(`@babel/preset-flow`),
    ],
    plugins: [
      resolve(`@babel/plugin-proposal-class-properties`),
      resolve(`@babel/plugin-proposal-nullish-coalescing-operator`),
      resolve(`@babel/plugin-proposal-optional-chaining`),
      resolve(`@babel/plugin-transform-runtime`),
      resolve(`@babel/plugin-syntax-dynamic-import`),
      IS_TEST && resolve(`babel-plugin-dynamic-import-node`),
    ].filter(Boolean),
  }
}
