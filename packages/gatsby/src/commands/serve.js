/* @flow weak */
const openurl = require(`opn`)
const signalExit = require(`signal-exit`)
const compression = require(`compression`)
const express = require(`express`)
const getConfigFile = require(`../bootstrap/get-config-file`)
const preferDefault = require(`../bootstrap/prefer-default`)

module.exports = async program => {
  let { prefixPaths, port, open } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  let { pathPrefix } = await preferDefault(
    getConfigFile(program.directory, `gatsby-config`)
  )

  pathPrefix = prefixPaths && pathPrefix ? pathPrefix : `/`

  const app = express()
  const router = express.Router()
  router.use(compression())
  router.use(express.static(`public`))
  router.use((req, res, next) => {
    if (req.accepts(`html`)) {
      res.status(404).sendFile(`404.html`, { root: `public` })
    } else {
      next()
    }
  })
  app.use(pathPrefix, router)

  const server = app.listen(port, () => {
    let openUrlString = `http://localhost:${port}${pathPrefix}`
    console.log(`gatsby serve running at:`, openUrlString)
    if (open) {
      console.log(`Opening browser...`)
      openurl(openUrlString)
    }
  })

  signalExit((code, signal) => {
    server.close()
  })
}
