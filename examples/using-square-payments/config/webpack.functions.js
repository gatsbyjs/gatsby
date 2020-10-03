const webpack = require("webpack")
module.exports = {
  plugins: [new webpack.DefinePlugin({ "global.GENTLY": false })],
}
