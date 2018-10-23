let ignore = [`**/dist`]

// Jest needs to compile this code, but generally we don't want this copied
// to output folders
if (process.env.NODE_ENV !== `test`) {
  ignore.push(`**/__tests__`)
}

const presetAbsPath = require(`path`).join(__dirname, '.babel-preset.js')

module.exports = {
  sourceMaps: true,
  presets: [presetAbsPath],
  ignore,
}
