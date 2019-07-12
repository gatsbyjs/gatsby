const babelPreset = require(`babel-preset-gatsby-package`)()
module.exports = require(`babel-jest`).createTransformer({
  ...babelPreset,
  plugins: [...babelPreset.plugins, `babel-plugin-dynamic-import-node`],
})
