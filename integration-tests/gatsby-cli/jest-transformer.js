const babelPreset = require(`babel-preset-gatsby-package`)()
module.exports = require(`babel-jest`).createTransformer({
  ...babelPreset,
})
