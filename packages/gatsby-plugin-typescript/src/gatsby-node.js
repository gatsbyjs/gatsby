const babelPluginRemoveQueries = require(`babel-plugin-remove-graphql-queries`)
const { transpileModule } = require(`typescript`)
const resolve = require(`./resolve`)

const test = /\.tsx?$/
const compilerDefaults = {
  target: `esnext`,
  experimentalDecorators: true,
  jsx: `react`,
  module: `es6`,
}

module.exports.resolvableExtensions = () => [`.ts`, `.tsx`]

module.exports.modifyWebpackConfig = (
  { boundActionCreators, loaders },
  { compilerOptions, ...options }
) => {
  // gatsby removes graphql queries from source code since they are processed
  // and run ahead of time. We need to do that here as well in order to avoid
  // extra dead code.
  const jsLoader = loaders.js({ plugins: [babelPluginRemoveQueries] })

  const typescriptOptions = {
    // React-land is rather undertyped; nontrivial TS projects will most likely
    // error (i.e., not build) at something or other.
    transpileOnly: true,
    compilerOptions: {
      ...compilerDefaults,
      ...compilerOptions,
    },
    ...options,
  }

  boundActionCreators.setWebpackConfig({
    module: {
      rules: [
        {
          test,
          use: [jsLoader, {
            loader: resolve(`ts-loader`),
            options: typescriptOptions,
          }],
        },
      ],
    },
  })
}

module.exports.preprocessSource = (
  { contents, filename },
  { compilerOptions }
) => {
  const copts = { ...compilerDefaults, ...compilerOptions }

  // return the transpiled source if it's TypeScript, otherwise null
  return test.test(filename)
    ? transpileModule(contents, { compilerOptions: copts }).outputText
    : null
}
