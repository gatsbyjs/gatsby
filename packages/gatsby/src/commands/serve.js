/* @flow weak */
const handler = require(`serve-handler`)
const openurl = require(`opn`)
const http = require(`http`)
const signalExit = require(`signal-exit`)

module.exports = program => {
  let { port, open } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  let server = http.createServer((request, response) => handler(request, response, {
      "public": `public`,
    }),
  )

  server.listen(port, () => {
    let openUrlString = `http://localhost:` + port
    console.log(`gatsby serve running at:`, openUrlString)
    if (open) {
      let openUrlString = `http://localhost:` + port
      console.log(`Opening browser...`)
      openurl(openUrlString)
    }
  })

  signalExit((code, signal) => {
    server.close()
  })
}
