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
  // below are temporary aliases that link to not yet published upcoming graphiql feature ( https://github.com/graphql/graphiql/pull/1750 )
  resolve: {
    alias: {
      graphiql: `/Users/misiek/dev/graphiql/packages/graphiql`,
      "codemirror-graphql": `/Users/misiek/dev/graphiql/packages/codemirror-graphql`,
      "graphql-language-service-interface": `/Users/misiek/dev/graphiql/packages/graphql-language-service-interface`,
      "graphql-language-service": `/Users/misiek/dev/graphiql/packages/graphql-language-service`,
      // just to fix "Cannot use GraphQLSchema "[object GraphQLSchema]" from another module or realm" as some pieces of the app
      // use graphql from monorepo (I'm guessing explorer), while rest will use graphql instance from graphiql monorepo
      graphql: path.dirname(require.resolve(`graphql/package.json`)),
    },
  },
}
