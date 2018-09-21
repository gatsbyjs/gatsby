const presetAbsPath = require(`path`).join(__dirname, `.babel-preset.js`)
const babelPreset = require(presetAbsPath)()
module.exports = require(`babel-jest`).createTransformer(babelPreset)
