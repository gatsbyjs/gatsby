let ignore = [`**/dist/**`]

// Jest needs to compile this code, but generally we don't want this copied
// to output folders
if (process.env.NODE_ENV !== `test`) {
  ignore.push(`**/__tests__/**`)
}

module.exports = {
  sourceMaps: true,
  presets: [`./.babel-preset.js`],
  ignore,
}
