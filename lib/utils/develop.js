/* @flow weak */
require('node-cjsx').transform()
import detect from 'detect-port'
import Hapi from 'hapi'
import Boom from 'boom'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import webpack from 'webpack'
import Negotiator from 'negotiator'
import parsePath from 'parse-filepath'
import _ from 'lodash'
import webpackRequire from 'webpack-require'
import WebpackPlugin from 'hapi-webpack-plugin'
import opn from 'opn'
import fs from 'fs'
import glob from 'glob'
import rl from 'readline'
import GraphQL from 'hapi-graphql'

import bootstrap from '../bootstrap'

const rlInterface = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
})

import webpackConfig from './webpack.config'
const debug = require('debug')('gatsby:application')

function startServer (program, launchPort) {
  const directory = program.directory
  const serverPort = launchPort || program.port

  // Load pages for the site.
  return bootstrap(program, (err, routes, schema) => {
  //return globPages(directory, (err, pages) => {
    const compilerConfig = webpackConfig(program, directory, 'develop', program.port)

    const compiler = webpack(compilerConfig.resolve())

    let HTMLPath = `${directory}/html`
    // Check if we can't find an html component in root of site.
    if (glob.sync(`${HTMLPath}.*`).length === 0) {
      HTMLPath = '../isomorphic/html'
    }

    const htmlCompilerConfig = webpackConfig(program, directory, 'develop-html', program.port)

    webpackRequire(htmlCompilerConfig.resolve(), require.resolve(HTMLPath), (error, factory) => {
      if (error) {
        console.log(`Failed to require ${directory}/html.js`)
        error.forEach((e) => {
          console.log(e)
        })
        process.exit()
      }
      const HTML = factory()
      debug('Configuring develop server')

      const server = new Hapi.Server()

      server.connection({
        host: program.host,
        port: serverPort,
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
            path: `${program.directory}/pages`,
            listing: false,
            index: false,
          },
        },
      })

      server.ext('onRequest', (request, reply) => {
        if (request.path === '/graphql') {
          return reply.continue()
        }

        const negotiator = new Negotiator(request.raw.req)

        // Try to map the url path to match an actual path of a file on disk.
        const parsed = parsePath(request.path)
        const page = _.find(routes, (p) => p.path === (`${parsed.dirname}/`))

        let absolutePath = `${program.directory}/pages`
        let path
        if (page) {
          path = `/${parsePath(page.component).dirname}/${parsed.basename}`
          absolutePath += `/${parsePath(page.component).dirname}/${parsed.basename}`
        } else {
          path = request.path
          absolutePath += request.path
        }
        let isFile = false
        try {
          isFile = fs.lstatSync(absolutePath).isFile()
        } catch (e) {
          // Ignore.
        }

        // If the path matches a file, return that.
        if (isFile) {
          request.setUrl(path)
          reply.continue()
        // Let people load the bundle.js directly.
        } else if (request.path === '/bundle.js') {
          reply.continue()
        } else if (negotiator.mediaType() === 'text/html') {
          request.setUrl(`/html${request.path}`)
          reply.continue()
        } else {
          reply.continue()
        }
      })

      const assets = {
        noInfo: true,
        reload: true,
        publicPath: compilerConfig._config.output.publicPath,
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


      return server.register([
        // Add GraphQL support
        {
          register: GraphQL,
          options: {
            query: {
              graphiql: true,
              pretty: true,
              schema,
            },
            route: {
              path: '/graphql',
            },
          }
        },
        {
          register: WebpackPlugin,
          options: {
            compiler,
            assets,
            hot,
          },
        },
      ], (er) => {
        if (er) {
          console.log(er)
          process.exit()
        }

        server.start((e) => {
          if (e) {
            if (e.code === 'EADDRINUSE') {
              // eslint-disable-next-line max-len
              console.log(`Unable to start Gatsby on port ${serverPort} as there's already a process listing on that port.`)
            } else {
              console.log(e)
            }

            process.exit()
          } else {
            if (program.open) {
              opn(server.info.uri)
            }
            console.log('Listening at:', server.info.uri)
          }
        })
      })
    })
  })
}

module.exports = (program) => {
  // TODO boot checker — gatsby.config.js/html.js/local install

  // Detect if a process is already listening on the program port.
  // If it is, ask the user if they'd like to use a different port.
  detect(program.port, (err, _port) => {
    if (err) {
      console.error(err)
      process.exit()
    }

    if (program.port !== _port) {
      // eslint-disable-next-line max-len
      const question = `Something is already running at port ${program.port} \nWould you like to run the app at another port instead? [Y/n] `

      return rlInterface.question(question, (answer) => {
        let launchPort = program.port
        if (answer.length === 0 || answer.match(/^yes|y$/i)) {
          launchPort = _port
        }

        return startServer(program, launchPort)
      })
    }

    return startServer(program)
  })
}
