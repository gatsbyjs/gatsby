require('node-cjsx').transform()
import Hapi from 'hapi'
import Boom from 'boom'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import webpack from 'webpack'
import Negotiator from 'negotiator'
import parsePath from 'parse-filepath'
import find from 'lodash/find'
import webpackRequire from 'webpack-require'
import WebpackPlugin from 'hapi-webpack-plugin'

import getUserGatsbyConfig from './get-user-gatsby-config'
import globPages from './glob-pages'
import webpackConfig from './webpack.config'
const debug = require('debug')('gatsby:application')
import babelExcludeTest from './babel-exclude-test'

module.exports = (program) => {
  const directory = program.directory

  // Load pages for the site.
  return globPages(directory, (err, pages) => {
    const compilerConfig = webpackConfig(program, directory, 'develop', program.port)
    const config = getUserGatsbyConfig(compilerConfig, 'develop')

    const compiler = webpack(config.resolve())

    const HTMLPath = `${directory}/html`

    const htmlCompilerConfig = webpackConfig(program, directory, 'develop', program.port)
    // Remove react-transform option from Babel as redbox-react doesn't work
    // on the server.
    htmlCompilerConfig.removeLoader('js')
    htmlCompilerConfig.loader('js', {
      test: /\.jsx?$/, // Accept either .js or .jsx files.
      exclude: babelExcludeTest,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015', 'stage-0'],
        plugins: ['add-module-exports'],
      },
    })

    const htmlConfig = getUserGatsbyConfig(htmlCompilerConfig, 'develop')

    webpackRequire(htmlConfig.resolve(), require.resolve(HTMLPath), (error, factory) => {
      if (error) {
        console.log(`Failed to require ${directory}/html.js`)
        error.forEach((e) => {
          console.log(e)
        })
        process.exit()
      }
      const HTML = factory()
      debug('Configuring develop server')

      // Setup and start Hapi to serve html + static files + webpack-hot-middleware.
      const server = new Hapi.Server()
      server.connection({
        host: program.host,
        port: program.port,
      })

      server.route({
        method: 'GET',
        path: '/html/{path*}',
        handler: (request, reply) => {
          if (request.path === 'favicon.ico') {
            return reply(Boom.notFound())
          }

          try {
            const htmlElement = React.createElement(
              HTML, {
                body: '',
              }
            )
            let html = ReactDOMServer.renderToStaticMarkup(htmlElement)
            html = `<!DOCTYPE html>\n${html}`
            return reply(html)
          } catch (e) {
            console.log(e.stack)
            throw e
          }
        },
      })

      server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
          directory: {
            path: `${directory}/pages`,
            listing: false,
            index: false,
          },
        },
      })

      server.ext('onRequest', (request, reply) => {
        const negotiator = new Negotiator(request.raw.req)

        if (negotiator.mediaType() === 'text/html') {
          request.setUrl(`/html${request.path}`)
          reply.continue()
        } else if (request.path === '/bundle.js') {
          reply.continue()
        } else {
          // Rewrite path to match disk path.
          const parsed = parsePath(request.path)
          const page = find(pages, (p) => p.path === (`${parsed.dirname}/`))

          if (page) {
            request.setUrl(`/${parsePath(page.requirePath).dirname}/${parsed.basename}`)
          }

          reply.continue()
        }
      })

      const assets = {
        noInfo: true,
        reload: true,
        publicPath: config._config.output.publicPath,
      }
      const hot = {
        hot: true,
        quiet: true,
        noInfo: true,
        host: program.host,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        stats: {
          colors: true,
        },
      }

      server.register({
        register: WebpackPlugin,
        options: {
          compiler,
          assets,
          hot,
        },
      }, (er) => {
        if (er) {
          console.log(er)
          process.exit()
        }

        server.start((e) => {
          if (e) {
            console.log(e)
          }
          return console.log('Listening at:', server.info.uri)
        })
      })
    })
  })
}
