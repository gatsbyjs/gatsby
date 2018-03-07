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

module.exports.onCreateWebpackConfig = (
  { actions, loaders },
  { compilerOptions, ...options }
) => {
  // Gatsby removes graphql queries from source code because they queries are
  // run ahead of time. We need to do that here as well in order to avoid
  // extra dead code sitting in the typescript files.

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

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test,
          use: [
            loaders.js(),
            {
              loader: resolve(`ts-loader`),
              options: typescriptOptions,
            },
          ],
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
