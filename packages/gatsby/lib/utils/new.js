/* @flow weak */
const logger = require(`tracer`).colorConsole()

const initStarter = require(`./init-starter`)

module.exports = (rootPath, starter = `gatsbyjs/gatsby-starter-default`) => {
  initStarter(starter, { rootPath, logger }).catch(error => logger.error(error))
}
