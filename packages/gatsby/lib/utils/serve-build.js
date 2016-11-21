/* @flow weak */
import detect from 'detect-port'
import Hapi from 'hapi'
import opn from 'opn'
import rl from 'readline'

const rlInterface = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const debug = require(`debug`)(`gatsby:application`)

function startServer (program, launchPort) {
  const directory = program.directory
  const serverPort = launchPort || program.port

  debug(`Serving /public`)
  const server = new Hapi.Server()

  server.connection({
    host: program.host,
    port: serverPort,
  })

  server.route({
    method: `GET`,
    path: `/{path*}`,
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
      if (e.code === `EADDRINUSE`) {
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
      console.log(`Listening at:`, server.info.uri)
    }
  })
}

module.exports = (program) => {
  const port = typeof program.port === 'string'
    ? parseInt(program.port, 10)
    : program.port

  detect(port, (err, _port) => {
    if (err) {
      console.error(err)
      process.exit()
    }

    if (port !== _port) {
      // eslint-disable-next-line max-len
      const question = `Something is already running at port ${port} \nWould you like to run the app at another port instead? [Y/n] `

      return rlInterface.question(question, (answer) => {
        if (answer.length === 0 || answer.match(/^yes|y$/i)) {
          program.port = _port
        }

        return startServer(program, program.port)
      })
    }

    return startServer(program)
  })
}
