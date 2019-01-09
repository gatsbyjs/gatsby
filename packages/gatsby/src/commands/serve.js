/* @flow weak */
const openurl = require(`better-opn`)
const signalExit = require(`signal-exit`)
const compression = require(`compression`)
const express = require(`express`)
const getConfigFile = require(`../bootstrap/get-config-file`)
const preferDefault = require(`../bootstrap/prefer-default`)
const chalk = require(`chalk`)

module.exports = async program => {
  let { prefixPaths, port, open } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  const config = await preferDefault(
    getConfigFile(program.directory, `gatsby-config`)
  )

  let pathPrefix = config && config.pathPrefix
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
    console.log(
      `${chalk.blue(`info`)} gatsby serve running at: ${chalk.bold(
        openUrlString
      )}`
    )
    if (open) {
      console.log(`${chalk.blue(`info`)} Opening browser...`)
      Promise.resolve(openurl(openUrlString)).catch(err =>
        console.log(
          `${chalk.yellow(
            `warn`
          )} Browser not opened because no browser was found`
        )
      )
    }
  })

  signalExit((code, signal) => {
    server.close()
  })
}
