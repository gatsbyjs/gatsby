const path = require("path")

module.exports = {
  sourceType: "module",
  plugins: [
    [path.resolve(__dirname, "../../../babel-transform-compiler-flags.js"),
      {
        availableFlags: ['MAJOR'],
        flags: {
          MAJOR: '4',
        }
      }
    ],
  ],
  babelrc: false,
  configFile: false,
}
