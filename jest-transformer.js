const babelPreset = require(`babel-preset-gatsby`)()
module.exports = require(`babel-jest`).createTransformer(babelPreset)
