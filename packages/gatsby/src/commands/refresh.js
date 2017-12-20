/* @flow */

const http = require(`http`)

module.exports = async (program: { host: string, port: string }) => {
  const options = {
    host: program.host,
    port: program.port,
    path: `/__refresh`,
    method: `POST`,
  }

  const req = http.request(options, (res) => {
    res.on(`end`, () => {
      console.log()
      console.info(`Successfully refreshed external data`)
    })
  })

  req.on(`error`, (e) => {
    console.log()
    console.error(`Unable to refresh external data: ${e.message}`)
  })

  req.end()
}
