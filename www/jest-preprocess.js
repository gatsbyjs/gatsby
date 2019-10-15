const babelOptions = {
  presets: [`babel-preset-gatsby`],
  plugins: [`emotion`],
}

module.exports = require(`babel-jest`).createTransformer(babelOptions)
