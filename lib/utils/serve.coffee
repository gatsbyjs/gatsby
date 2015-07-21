require('node-cjsx').transform()
Hapi = require 'hapi'
Boom = require 'boom'
React = require 'react'
Router = require 'react-router'
path = require 'path'
WebpackDevServer = require 'webpack-dev-server'
webpack = require 'webpack'
Negotiator = require 'negotiator'
parsePath = require 'parse-filepath'
_ = require 'underscore'
globPages = require './glob-pages'
webpackConfig = require './webpack.config'

module.exports = (program) ->
  {relativeDirectory, directory} = program

  # Load pages for the site.
  globPages directory, (err, pages) ->
    try
      HTML = require directory + '/html'
    catch e
      console.log e
      HTML = require "#{__dirname}/../isomorphic/html"

    # Generate random port for webpack to listen on.
    # Perhaps should check if port is open.
    webpackPort = Math.round(Math.random() * 1000 + 1000)

    compilerConfig = webpackConfig(program, directory, 'serve', webpackPort)
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
    webpackDevServer.listen(webpackPort, program.host, ->)

    # Setup and start Hapi to serve html + static files.
    server = new Hapi.Server()
    server.connection({host: program.host, port: program.port})

    server.route
      method: "GET"
      path: '/bundle.js'
      handler:
        proxy:
          uri: "http://localhost:#{webpackPort}/bundle.js"
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

