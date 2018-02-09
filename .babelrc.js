let ignore = ["dist"]

if (process.env !== "test") {
  ignore = ignore.concat(["__tests__", "dist"])
}

module.exports = {
  sourceMaps: true,
  presets: ["./.babel-preset.js"],
  ignore,
}
