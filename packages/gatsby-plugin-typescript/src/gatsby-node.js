const {transpileModule} = require(`typescript`)
const path = require(`path`)

const test = /\.tsx?$/
const compilerDefaults = {
  target: `esnext`,
  experimentalDecorators: true,
  jsx: `preserve`,
}

module.exports.resolvableExtensions = () => [`.ts`, `.tsx`]

module.exports.modifyWebpackConfig = ({config}, {compilerOptions}) => {
  // CommonJS to keep Webpack happy.
  const copts = Object.assign({}, compilerDefaults, compilerOptions, {
    module: `commonjs`,
  })

  let tsConfig = {}
  // let babelCfg = {};

  try {
    const tsConfigPath = path.resolve(__dirname, '../../tsconfig.json')
    tsConfig = require(tsConfigPath)
  } catch (e) {
    console.error('no tsconfig found')
  }

  // try {
  //   const babelRcPath = path.resolve(__dirname, '../../.babelrc');
  //   babelCfg = require(babelRcPath);
  // } catch (e) {
  //   console.error('no babelrc fond');
  // }

  // React-land is rather undertyped; nontrivial TS projects will most likely
  // error (i.e., not build) at something or other.
  const opts = Object.assign(
    {},
    {compilerOptions: copts, transpileOnly: true},
    tsConfig
  )

  // Load gatsby babel plugin to extract graphql query
  const extractQueryPlugin = path.resolve(
    __dirname,
    `../../node_modules/gatsby/dist/utils/babel-plugin-extract-graphql.js`
  )

  config.loader(`typescript`, {
    test,
    loaders: [
      `babel?${JSON.stringify({plugins: [extractQueryPlugin]})}`,
      `awesome-typescript-loader?${JSON.stringify(opts)}`,
    ],
  })

  config.preLoader(`typescript`, {
    test,
    loaders: [`tslint-loader`],
  })
}

module.exports.preprocessSource = ({contents, filename}, {compilerOptions}) => {
  // overwrite defaults with custom compiler options
  const copts = Object.assign({}, compilerDefaults, compilerOptions, {
    target: `es2015`,
    module: `es6`,
  })
  // return the transpiled source if it's TypeScript, otherwise null
  return test.test(filename)
    ? transpileModule(contents, {compilerOptions: copts}).outputText
    : null
}
