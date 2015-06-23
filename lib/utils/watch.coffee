require('node-cjsx').transform()
Hapi = require 'hapi'
Boom = require 'boom'
React = require 'react'
Router = require 'react-router'
path = require 'path'
WebpackDevServer = require 'webpack-dev-server'
webpack = require 'webpack'
StaticSiteGeneratorPlugin = require 'static-site-generator-webpack-plugin'
Negotiator = require 'negotiator'
parsePath = require 'parse-filepath'
_ = require 'underscore'
globPages = require './glob-pages'

module.exports = (program) ->
  {relativeDirectory, directory} = program

  # Load pages for the site.
  globPages directory, (err, pages) ->
    try
      HTML = require directory + '/html'
    catch e
      console.log e
      HTML = require "#{__dirname}/../isomorphic/html"

    compilerConfig = {
      entry: [
        "#{__dirname}/../../node_modules/webpack-dev-server/client?#{program.host}:11122",
        "#{__dirname}/../../node_modules/webpack/hot/only-dev-server",
        "#{__dirname}/web-entry"
      ],
      devtool: "eval",
      debug: true
      output:
        path: directory
        filename: 'bundle.js'
        publicPath: "http://#{program.host}:11122/"
      resolveLoader: {
        modulesDirectories: ["#{__dirname}/../../node_modules", "#{__dirname}/../loaders"]
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
      ],
      resolve: {
        extensions: ['', '.js', '.jsx', '.cjsx', '.coffee', '.json', '.less', '.toml', '.yaml']
        modulesDirectories: [directory, "#{__dirname}/../isomorphic", "#{directory}/node_modules", "node_modules"]
      },
      module: {
        loaders: [
          { test: /\.css$/, loaders: ['style', 'css']},
          { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
          { test: /\.jsx/, loaders: ['react-hot', 'babel']},
          { test: /\.less/, loaders: ['style', 'css', 'less']},
          { test: /\.coffee$/, loader: 'coffee' }
          { test: /\.toml$/, loader: 'config', query: {
            directory: directory
          } }
          { test: /\.md$/, loader: 'markdown' }
          { test: /\.html$/, loader: 'raw' }
          { test: /\.json$/, loaders: ['json'] }
          { test: /\.toml/, loaders: ['toml'] }
          { test: /\.png$/, loader: 'null' }
          { test: /\.jpg$/, loader: 'null' }
          { test: /\.ico$/, loader: 'null' }
          { test: /\.pdf$/, loader: 'null' }
          { test: /\.txt$/, loader: 'null' }
        ]
      }
    }

    compiler = webpack(compilerConfig)

    webpackDevServer = new WebpackDevServer(compiler, {
      hot: true
      quiet: true
      noInfo: true
      host: program.host
      stats:
        colors: true
    })

    # Start webpack-dev-server
    webpackDevServer.listen(11122, program.host, ->)

    # Setup and start Hapi to serve html + static files.
    server = new Hapi.Server()
    server.connection({host: program.host, port: 8000})

    server.route
      method: "GET"
      path: '/bundle.js'
      handler:
        proxy:
          uri: "http://localhost:11122/bundle.js"
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
          path: directory + "/pages"
          listing: false
          index: false

    server.ext 'onRequest', (request, reply) ->
      negotiator = new Negotiator(request.raw.req)

      if negotiator.mediaType() is "text/html"
        request.setUrl "/html" + request.path
        reply.continue()
      else
        # Rewrite path to match disk path.
        parsed = parsePath request.path
        page = _.find pages, (page) -> page.path is (parsed.dirname + "/")

        if page
          request.setUrl "/#{parsePath(page.requirePath).dirname}/#{parsed.basename}"

        reply.continue()

    server.start ->
      console.log "Listening at:", server.info.uri

