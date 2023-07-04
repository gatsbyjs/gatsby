const path = require(`path`)
const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const webpack = require(`webpack`)

const mode = `production`

/** @type { import('webpack').Configuration } */
module.exports = {
  entry: path.join(__dirname, `app.jsx`),
  mode,
  output: {
    path: path.join(__dirname, `..`, `dist`),
    filename: `./app.js`,
    publicPath: `/___graphql`,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: `babel-loader`,
          options: {
            presets: [
              [
                `@babel/preset-env`,
                {
                  corejs: 3,
                  loose: true,
                  bugfixes: true,
                  modules: `commonjs`,
                  useBuiltIns: `entry`,
                  targets: [
                    `>0.25% and supports es6-module`,
                    `not dead and supports es6-module`,
                  ],
                },
              ],
              [
                `@babel/preset-react`,
                {
                  useBuiltIns: true,
                  pragma: `React.createElement`,
                  development: mode !== `production`,
                },
              ],
            ],
            plugins: [
              [
                `@babel/plugin-proposal-class-properties`,
                {
                  loose: true,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [{ loader: `style-loader` }, { loader: `css-loader` }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `index.html.ejs`),
      filename: `index.html`,
      inject: false,
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(mode),
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  optimization: {
    splitChunks: false,
  },
  stats: {
    warnings: false,
  },
}
