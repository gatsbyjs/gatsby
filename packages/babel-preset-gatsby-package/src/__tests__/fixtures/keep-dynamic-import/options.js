const path = require("path")

// "babel-plugin-dynamic-import-node" is used in tests, so we force not a test environment
process.env.BABEL_ENV = `not-a-test`

module.exports = {
  sourceType: "module",
  presets: [
    [path.resolve(__dirname, "../../../index.js"),
      {
        keepDynamicImports: [`./packages/babel-preset-gatsby-package/lib/__tests__/fixtures/keep-dynamic-import/with-override/input.js`]
      }
    ],
  ],
  babelrc: false,
  configFile: false,
}
