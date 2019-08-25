const nodeExternals = require('webpack-node-externals');

module.exports = {
  externals: [nodeExternals()],
  optimization: { minimize: false },
  devtool: 'source-map',
};
