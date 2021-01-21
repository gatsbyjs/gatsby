const path = require(`path`)
const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const webpack = require(`webpack`)

const mode = `production`
module.exports = {
  entry: path.join(__dirname, `app.js`),
  mode,
  output: {
    path: path.join(__dirname, `..`, `..`),
    filename: `./app.js`,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.js$/,
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
                  modules: `commonjs`,
                  useBuiltIns: `usage`,
                  targets: [`>0.25%`, `not dead`],
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
      template: path.resolve(__dirname, `index.ejs`),
      filename: `index.html`,
      inject: false,
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(mode),
    }),
  ],
  stats: {
    warnings: false,
  },
}
