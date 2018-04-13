/* @flow weak */
const serve = require(`serve`)
const signalExit = require(`signal-exit`)

module.exports = program => {
  let { port, open, directory } = program
  port = typeof port === `string` ? parseInt(port, 10) : port
  const buildDirectory = process.env.GATSBY_BUILD_DIR || `public`
  let server = serve(`${directory}/${buildDirectory}`, { port, open })

  signalExit((code, signal) => {
    server.stop()
  })
}
