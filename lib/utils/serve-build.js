/* @flow weak */
import Hapi from 'hapi'
import opn from 'opn'
import chalk from 'chalk'
import startWithDynamicPort from './startWithDynamicPort'

const debug = require('debug')('gatsby:application')

function startServer(program, launchPort) {
  const directory = program.directory
  const serverPort = launchPort || program.port

  debug('Serving /public')
  const server = new Hapi.Server()

  server.connection({
    host: program.host,
    port: serverPort,
  })

  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: `${directory}/public`,
        listing: false,
        index: true,
      },
    },
  })

  server.start(e => {
    if (e) {
      if (e.code === 'EADDRINUSE') {
        // eslint-disable-next-line max-len
        console.log(
          chalk.red(
            `Unable to start Gatsby on port ${serverPort} as there's already a process listening on that port.`
          )
        )
      } else {
        console.log(chalk.red(e))
      }

      process.exit()
    } else {
      if (program.open) {
        opn(server.info.uri)
      }
      console.log(chalk.green('Server started successfully!'))
      console.log()
      console.log('Listening at:')
      console.log()
      console.log('  ', chalk.cyan(server.info.uri))
    }
  })
}

module.exports = startWithDynamicPort(startServer)
