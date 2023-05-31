// This being a babel.config.js file instead of a .babelrc file allows the
// packages in `internal-plugins` to be compiled with the rest of the source.
// Ref: https://github.com/babel/babel/pull/7358
module.exports = {
  sourceMaps: true,
  presets: [["babel-preset-gatsby-package", {
    keepDynamicImports: [
      `./src/utils/feedback.ts`,

      // These files use dynamic imports to load gatsby-config, gatsby-node, and subPlugins so esm works
      `./src/bootstrap/get-config-file.ts`,
      `./src/bootstrap/resolve-module-exports.ts`,
      `./src/bootstrap/load-plugins/validate.ts`,
      `./src/utils/adapter/init.ts`,
      `./src/utils/import-gatsby-plugin.ts`,
    ]
  }]],
}
