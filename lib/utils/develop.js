require('node-cjsx').transform();
var Hapi = require('hapi');
var Boom = require('boom');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var Router = require('react-router');
var path = require('path');
var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var Negotiator = require('negotiator');
var parsePath = require('parse-filepath');
var _ = require('underscore');
var webpackRequire = require('webpack-require');
var fs = require('fs')
var assign = require('object-assign')

var globPages = require('./glob-pages');
var webpackConfig = require('./webpack.config');

module.exports = function(program) {
  var relativeDirectory = program.relativeDirectory;
  var directory = program.directory;

  // Load pages for the site.
  return globPages(directory, function(err, pages) {
    // Generate random port for webpack to listen on.
    // Perhaps should check if port is open.
    var webpackPort = Math.round(Math.random() * 1000 + 1000);

    var compilerConfig = webpackConfig(program, directory, 'develop', webpackPort);
    var compiler = webpack(compilerConfig);

    var HTMLPath;
    if (fs.existsSync(directory + "/html.cjsx") || fs.existsSync(directory + "/html.jsx")) {
      HTMLPath = directory + "/html"
    }
    else {
      HTMLPath = __dirname + "/../isomorphic/html"
    }

    var htmlCompilerConfig = webpackConfig(program, directory, 'production', webpackPort);
    webpackRequire(htmlCompilerConfig, require.resolve(HTMLPath), function(err, factory) {
      if (err) {
        console.log("Failed to require " + directory + "/html.jsx")
        err.forEach(function(error) { console.log(error) })
        process.exit()
      }
      var HTML = factory()

      var webpackDevServer = new WebpackDevServer(compiler, {
        hot: true,
        quiet: true,
        noInfo: true,
        host: program.host,
        stats: {
          colors: true
        }
      });

      // Start webpack-dev-server
      webpackDevServer.listen(webpackPort, program.host, function() {});

      // Setup and start Hapi to serve html + static files.
      var server = new Hapi.Server();
      server.connection({host: program.host, port: program.port});

      server.route({
        method: "GET",
        path: '/bundle.js',
        handler: {
          proxy: {
            uri: "http://localhost:" + webpackPort + "/bundle.js",
            passThrough: true,
            xforward: true
          }
        }
      });

      server.route({
        method: "GET",
        path: '/html/{path*}',
        handler: function(request, reply) {
          if (request.path === "favicon.ico") {
            return reply(Boom.notFound());
          }

          var html = ReactDOMServer.renderToStaticMarkup(React.createElement(HTML));
          html = "<!DOCTYPE html>\n" + html;
          return reply(html);
        }
      });

      server.route({
        method: "GET",
        path: '/{path*}',
        handler: {
          directory: {
            path: directory + "/pages",
            listing: false,
            index: false
          }
        }
      });

      server.ext('onRequest', function(request, reply) {
        var negotiator = new Negotiator(request.raw.req);

        if (negotiator.mediaType() === "text/html") {
          request.setUrl("/html" + request.path);
          return reply.continue();
        } else {
          // Rewrite path to match disk path.
          var parsed = parsePath(request.path);
          var page = _.find(pages, function(page) { return page.path === (parsed.dirname + "/"); });

          if (page) {
            request.setUrl("/" + parsePath(page.requirePath).dirname + "/" + parsed.basename);
          }

          return reply.continue();
        }
      });

      return server.start(function(err) {
        if (err) {
          console.log(err);
        }
        return console.log("Listening at:", server.info.uri);
      });
    });
  });
};
