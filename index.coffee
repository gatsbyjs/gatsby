# TODO switch to compiling server code with webpack.
require('node-cjsx').transform()
Hapi = require 'hapi'
Boom = require 'boom'
React = require 'react'
Router = require 'react-router'
program = require 'commander'
path = require 'path'
WebpackDevServer = require 'webpack-dev-server'
webpack = require 'webpack'
Negotiator = require 'negotiator'
StaticSiteGeneratorPlugin = require 'static-site-generator-webpack-plugin'

packageJson = require './package.json'
globPages = require './lib/utils/glob-pages'

program
  .version(packageJson.version)
  .option('-h, --host <url>', 'set host. defaults to 0.0.0.0', "0.0.0.0")
  .parse(process.argv)

relativeDirectory = program.args[0]
directory = path.resolve(relativeDirectory)

try
  HTML = require directory + '/html'
catch
  HTML = require './lib/isomorphic/html'

compilerConfig = {
  entry: [
    "webpack-dev-server/client?#{program.host}:8001",
    'webpack/hot/only-dev-server',
    "./web-entry"
  ],
  devtool: "eval",
  debug: true,
  output:
    path: directory
    publicPath: "http://#{program.host}:8001/"
  resolveLoader: {
    modulesDirectories: ['node_modules', 'lib/loaders']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    extensions: ['', '.js', '.cjsx', '.coffee', '.json', '.toml', '.yaml']
    modulesDirectories: [relativeDirectory, 'lib/isomorphic', 'node_modules']
  },
  module: {
    loaders: [
      { test: /\.css$/, loaders: ['style', 'css']},
      { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' }
      { test: /\.toml$/, loader: 'config', query: {
        directory: directory
      } }
      { test: /\.md$/, loader: 'markdown' }
      { test: /\.html$/, loader: 'raw' }
      { test: /\.json$/, loaders: ['config', 'json'] }
      { test: /\.png$/, loader: 'null' }
      { test: /\.jpg$/, loader: 'null' }
      { test: /\.ico$/, loader: 'null' }
      { test: /\.pdf$/, loader: 'null' }
      { test: /\.txt$/, loader: 'null' }
    ]
  }
}

#### Static site generation.
#globPages directory, (err, pages) ->
  #routes = pages.map (page) -> page.path
  #compilerConfig.plugins = [
    #new webpack.DefinePlugin({
      #"process.env": {
        #NODE_ENV: JSON.stringify("production")
      #}
    #})
    #new webpack.optimize.DedupePlugin()
    #new webpack.optimize.UglifyJsPlugin()
    ##new StaticSiteGeneratorPlugin('bundle.js', routes)
  #]
  ##compilerConfig.output.libraryTarget = 'umd'
  #compilerConfig.entry = directory + '/entry'
  #compilerConfig.output.path = directory + '/public'
  #compilerConfig.output.publicPath = null

  #console.log compilerConfig
  #webpack(compilerConfig).run (err, stats) ->
    #console.log 'done'
    #console.log err, stats

compiler = webpack(compilerConfig)

jsServer = new WebpackDevServer(compiler, {
  contentBase: directory
  hot: true
  quiet: true
  host: program.host
})

# Start webpack-dev-server
jsServer.listen(8001, program.host, ->)

# Setup and start Hapi to serve.
server = new Hapi.Server()
server.connection({host: program.host, port: 8000})

server.route
  method: "GET"
  path: '/bundle.js'
  handler:
    proxy:
      uri: "http://localhost:8001/bundle.js"
      passThrough: true
      xforward: true

server.route
  method: "GET"
  path: '/html/{path*}'
  handler: (request, reply) ->
    if request.path is "favicon.ico"
      return reply Boom.notFound()

    html = React.renderToStaticMarkup(React.createElement(HTML))
    reply html

server.route
  method: "GET"
  path: '/{path*}'
  handler:
    directory:
      path: directory + "/pages/"
      listing: false
      index: false

server.ext 'onRequest', (request, reply) ->
  negotiator = new Negotiator(request.raw.req)
  console.log negotiator.mediaType()
  console.log request.path

  if negotiator.mediaType() is "text/html"
    request.setUrl "/html" + request.path
    reply.continue()
  else
    reply.continue()

server.start ->
  console.log "Server running at:", server.info.uri
