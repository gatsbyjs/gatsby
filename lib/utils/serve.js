require('node-cjsx').transform();
import Hapi from 'hapi';
import Boom from 'boom';
import React from 'react';
import Router from 'react-router';
import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import Negotiator from 'negotiator';
import parsePath from 'parse-filepath';
import _ from 'underscore';
import globPages from './glob-pages';
import webpackConfig from './webpack.config';

module.exports = function(program) {
  var {relativeDirectory, directory} = program;

  // Load pages for the site.
  return globPages(directory, function(err, pages) {
    try {
      var HTML = require(directory + '/html');
    } catch (e) {
      console.log("error loading html template", e);
      HTML = require(`${__dirname}/../isomorphic/html`);
    }

    // Generate random port for webpack to listen on.
    // Perhaps should check if port is open.
    var webpackPort = Math.round(Math.random() * 1000 + 1000);

    var compilerConfig = webpackConfig(program, directory, 'serve', webpackPort);
    var compiler = webpack(compilerConfig);

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
          uri: `http://localhost:${webpackPort}/bundle.js`,
          passThrough: true,
          xforward: true
        }
      }
    });

    server.route({
      method: "GET",
      path: '/html/{path*}',
      handler(request, reply) {
        if (request.path === "favicon.ico") {
          return reply(Boom.notFound());
        }

        var html = React.renderToStaticMarkup(React.createElement(HTML));
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
          request.setUrl(`/${parsePath(page.requirePath).dirname}/${parsed.basename}`);
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
};
