const babelJest = require(`babel-jest`)

module.exports = babelJest.default.createTransformer({
  presets: [`babel-preset-gatsby-package`],
  babelrcRoots: [
    // Keep the root as a root
    `.`,

    // Also consider monorepo packages "root" and load their .babelrc files.
    `./packages/*`,
  ],
})
