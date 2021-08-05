const path = require("path")

module.exports = {
  sourceType: "module",
  plugins: [
    [path.resolve(__dirname, "../../src/babel-transform-compiler-flags.ts"),
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
