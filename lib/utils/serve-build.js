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
      if (e.code === 'EADDRINUSE') {
        const finder = require('process-finder')
        finder.find({ elevate: false, port: program.port }, (startErr, pids) => {
          const msg =
`We were unable to start Gatsby on port ${program.port} as there's already a process
listening on that port (PID: ${pids[0]}). You can either use a different port
(e.g. gatsby serve-build --port ${parseInt(program.port, 10) + 1}) or stop the process already listening
on your desired port.`
          console.log(msg)
          process.exit()
        })
      } else {
        console.log(e)
      }
    } else {
      if (program.open) {
        opn(server.info.uri)
      }
      return console.log('Listening at:', server.info.uri)
    }
  })
}
