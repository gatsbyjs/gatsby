const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.js',
  target: 'node',
  mode: 'production',
  externals: [
    nodeExternals({
      whitelist: ['react', 'graphql', 'urql', '@urql/core', '@mdx-js/react']
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'recipes.js',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/react']
          }
        }
      }
    ]
  }
}
