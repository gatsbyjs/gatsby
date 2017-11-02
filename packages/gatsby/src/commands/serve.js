/* @flow weak */
const serve = require(`serve`)
const signalExit = require(`signal-exit`)

module.exports = program => {
  let { port, open, directory } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  let server = serve(`${directory}/public`, { port, open })

  signalExit((code, signal) => {
    server.stop()
  })
}
