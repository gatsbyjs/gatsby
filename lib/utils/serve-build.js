/* @flow weak */
import Hapi from 'hapi'
import opn from 'opn'

const debug = require('debug')('gatsby:application')

module.exports = (program) => {
  const directory = program.directory

  debug('Serving /public')

  // Setup and start Hapi to static files.

  const server = new Hapi.Server()

  server.connection({
    host: program.host,
    port: program.port,
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


  server.start((e) => {
    if (e) {
      console.log(e)
    }
    if (program.open) {
      opn(server.info.uri)
    }
    return console.log('Listening at:', server.info.uri)
  })
}
